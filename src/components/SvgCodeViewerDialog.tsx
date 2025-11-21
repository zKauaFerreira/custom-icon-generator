import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { showSuccess, showError } from "@/utils/toast";
import { IconData } from "@/pages/Index";
import { saveAs } from "file-saver";
import React, { useState, useMemo, useEffect } from "react";
import { ColorPicker } from "./ColorPicker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SvgCodeViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: IconData;
  svgContent: string;
  color: string;
  resolution: number;
}

// Função utilitária para colorir o SVG e formatar (indentação simples)
const formatAndColorizeSvg = (svgText: string, color: string): string => {
  // 1. Colorir o SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  doc.documentElement.setAttribute('fill', color);
  const serializer = new XMLSerializer();
  const coloredSvg = serializer.serializeToString(doc.documentElement);

  // 2. Formatar (indentação básica)
  let formatted = coloredSvg.replace(/>\s*</g, '><'); // Remove whitespace between tags
  formatted = formatted.replace(/></g, '>\n<'); // Add newline between tags
  
  // 3. Adicionar classes de cor para visualização (simulação de IDE)
  formatted = formatted.replace(/<svg/g, '<span class="text-purple-400">&lt;svg</span>');
  formatted = formatted.replace(/<\/svg>/g, '<span class="text-purple-400">&lt;/svg&gt;</span>');
  formatted = formatted.replace(/<path/g, '\n  <span class="text-purple-400">&lt;path</span>');
  formatted = formatted.replace(/d="/g, ' <span class="text-yellow-400">d</span>="<span class="text-green-400">');
  formatted = formatted.replace(/"\/>/g, '</span>"<span class="text-purple-400">/&gt;</span>');
  formatted = formatted.replace(/fill="/g, ' <span class="text-yellow-400">fill</span>="<span class="text-green-400">');
  formatted = formatted.replace(/viewBox="/g, ' <span class="text-yellow-400">viewBox</span>="<span class="text-green-400">');
  formatted = formatted.replace(/xmlns="/g, ' <span class="text-yellow-400">xmlns</span>="<span class="text-green-400">');
  formatted = formatted.replace(/width="/g, ' <span class="text-yellow-400">width</span>="<span class="text-green-400">');
  formatted = formatted.replace(/height="/g, ' <span class="text-yellow-400">height</span>="<span class="text-green-400">');
  
  return formatted;
};

// Função utilitária para obter o SVG colorido puro para cópia/download
const getColoredSvgString = (svgText: string, color: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    doc.documentElement.setAttribute('fill', color);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc.documentElement);
};


export const SvgCodeViewerDialog: React.FC<SvgCodeViewerDialogProps> = ({ open, onOpenChange, icon, svgContent, color, resolution }) => {
  // Estado local para a cor, inicializado com a cor da prop
  const [localColor, setLocalColor] = useState(color);

  // Resetar a cor local quando o modal abrir ou a cor da prop mudar
  useEffect(() => {
    setLocalColor(color);
  }, [color, open]);

  // Recalcula o SVG colorido e formatado apenas quando o svgContent ou localColor mudar
  const { coloredSvgString, formattedHtml } = useMemo(() => {
    const coloredSvgString = getColoredSvgString(svgContent, localColor);
    const formattedHtml = formatAndColorizeSvg(svgContent, localColor);
    return { coloredSvgString, formattedHtml };
  }, [svgContent, localColor]);


  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(coloredSvgString);
      showSuccess("Código SVG copiado para a área de transferência!");
    } catch (err) {
      console.error('Failed to copy SVG:', err);
      showError("Falha ao copiar o código SVG.");
    }
  };

  const handleDownloadSvg = () => {
    try {
      // Usa a cor local para o nome do arquivo e o conteúdo
      const cleanColor = localColor.substring(1);
      const blob = new Blob([coloredSvgString], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, `${icon.slug}-${cleanColor}.svg`);
      showSuccess("Download SVG iniciado!");
    } catch (error) {
      console.error('Failed to download SVG:', error);
      showError("Falha ao baixar o SVG.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Visualizar Código SVG: {icon.title}
            
            {/* Color Picker Integrado com Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-6 w-6">
                    <ColorPicker 
                        value={localColor} 
                        onChange={setLocalColor}
                        size="sm"
                        className="h-6 w-6"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alterar Cor ({localColor})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
          <DialogDescription>
            Código SVG colorido com a cor selecionada (<span className="font-mono font-semibold" style={{ color: localColor }}>{localColor}</span>).
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 flex-grow min-h-0">
          {/* Painel de Pré-visualização */}
          <div className="w-1/4 flex flex-col items-center p-4 border rounded-md bg-muted/50 self-start">
            <div
              className="w-24 h-24 mb-4"
              dangerouslySetInnerHTML={{ __html: getColoredSvgString(svgContent, localColor) }}
            />
            <p className="mb-4 text-sm text-muted-foreground text-center">Pré-visualização</p>
          </div>

          {/* Visualizador de Código */}
          <div className="flex-grow bg-gray-900 rounded-md overflow-hidden border border-gray-700">
            <ScrollArea className="h-full p-4 text-sm font-mono text-white">
              <pre className="whitespace-pre-wrap break-words">
                <code dangerouslySetInnerHTML={{ __html: formattedHtml }} />
              </pre>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleDownloadSvg}>
            <Download className="h-4 w-4 mr-2" />
            Baixar SVG
          </Button>
          <Button variant="outline" onClick={handleCopySvg}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Código SVG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};