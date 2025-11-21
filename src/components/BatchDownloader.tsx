import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // file-saver é uma dependência transitória de jszip
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Download, FileArchive } from 'lucide-react';
import type { IconData } from '@/pages/Index';
import { showError, showLoading, showSuccess } from '@/utils/toast';
import { dismissToast } from '@/utils/toast';

interface BatchDownloaderProps {
  selectedIcons: Set<string>;
  allIcons: IconData[];
  color: string;
  onClear: () => void;
}

const getColoredSvg = (baseSvg: string, fillColor: string) => {
  if (!baseSvg) return '';
  return baseSvg.replace('<svg', `<svg fill="${fillColor}"`);
};

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({ selectedIcons, allIcons, color, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedIconsDetails = allIcons.filter(icon => selectedIcons.has(icon.slug));

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    const loadingToast = showLoading(`Preparando ${selectedIcons.size} ícones...`);
    const zip = new JSZip();

    try {
      await Promise.all(selectedIconsDetails.map(async (icon) => {
        const response = await fetch(`https://cdn.simpleicons.org/${icon.slug}`);
        if (!response.ok) return;
        const svgText = await response.text();
        const coloredSvg = getColoredSvg(svgText, color);
        const cleanColor = color.substring(1);
        zip.file(`${icon.slug}-${cleanColor}.svg`, coloredSvg);
      }));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `icons-${color.substring(1)}.zip`);
      dismissToast(loadingToast);
      showSuccess('Download iniciado!');
    } catch (error) {
      console.error("Failed to create ZIP file:", error);
      dismissToast(loadingToast);
      showError('Falha ao gerar o arquivo ZIP.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg p-4 mb-8">
      <CollapsibleTrigger asChild>
        <button className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            <span className="font-semibold">{selectedIcons.size} ícone(s) selecionado(s)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {isOpen ? 'Ocultar' : 'Mostrar'} detalhes
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
          {selectedIconsDetails.map(icon => (
            <p key={icon.slug} className="text-sm text-muted-foreground truncate">{icon.title}</p>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleDownloadZip} disabled={isDownloading}>
            <Download className="h-4 w-4 mr-2" />
            Baixar ZIP
          </Button>
          <Button variant="outline" onClick={onClear} disabled={isDownloading}>Limpar Seleção</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};