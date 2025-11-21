import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Download, FileArchive, Trash2 } from 'lucide-react';
import type { IconData } from '@/pages/Index';
import { showError, showLoading, showSuccess, dismissToast } from '@/utils/toast';

interface BatchDownloaderSheetProps {
  selectedIcons: Set<string>;
  allIcons: IconData[];
  color: string;
  onClear: () => void;
}

const getColoredSvg = (baseSvg: string, fillColor: string) => {
  if (!baseSvg) return '';
  return baseSvg.replace('<svg', `<svg fill="${fillColor}"`);
};

export const BatchDownloaderSheet: React.FC<BatchDownloaderSheetProps> = ({ selectedIcons, allIcons, color, onClear }) => {
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
    } catch (error)
    {
      console.error("Failed to create ZIP file:", error);
      dismissToast(loadingToast);
      showError('Falha ao gerar o arquivo ZIP.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (selectedIcons.size === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-8 right-8 z-50 h-14 rounded-full shadow-lg flex items-center gap-3 px-6 animate-in fade-in-90 slide-in-from-bottom-10 duration-300">
          <FileArchive className="h-6 w-6" />
          <span className="text-lg font-semibold">{selectedIcons.size} selecionado(s)</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle>Ícones Selecionados ({selectedIcons.size})</SheetTitle>
          <SheetDescription>
            Revise sua seleção e baixe todos os ícones de uma vez.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto my-4 pr-4 space-y-2">
          {selectedIconsDetails.map(icon => (
            <div key={icon.slug} className="text-sm text-muted-foreground truncate p-2 rounded-md bg-muted/50">
              {icon.title}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-auto border-t pt-4">
          <Button onClick={handleDownloadZip} disabled={isDownloading} className="flex-grow">
            <Download className="h-4 w-4 mr-2" />
            Baixar ZIP
          </Button>
          <Button variant="outline" onClick={onClear} disabled={isDownloading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};