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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconInfoCard } from './IconInfoCard';

interface SvgCodeViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: IconData;
  svgContent: string;
  color: string;
  resolution: number;
}

// Utility function to colorize and format the SVG (simple indentation)
const formatAndColorizeSvg = (svgText: string, color: string): string => {
  // 1. Colorize the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  doc.documentElement.setAttribute('fill', color);
  const serializer = new XMLSerializer();
  const coloredSvg = serializer.serializeToString(doc.documentElement);

  // 2. Format (basic indentation)
  let formatted = coloredSvg.replace(/>\s*</g, '><'); // Remove whitespace between tags
  formatted = formatted.replace(/></g, '>\n<'); // Add newline between tags
  
  // 3. Add color classes for visualization (IDE simulation)
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

// Utility function to get the pure colored SVG string for copy/download
const getColoredSvgString = (svgText: string, color: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    doc.documentElement.setAttribute('fill', color);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc.documentElement);
};


export const SvgCodeViewerDialog: React.FC<SvgCodeViewerDialogProps> = ({ open, onOpenChange, icon, svgContent, color, resolution }) => {
  // Local state for color, initialized with the prop color
  const [localColor, setLocalColor] = useState(color);

  // Reset local color when the modal opens or the prop color changes
  useEffect(() => {
    setLocalColor(color);
  }, [color, open]);

  // Recalculate colored and formatted SVG only when svgContent or localColor changes
  const { coloredSvgString, formattedHtml } = useMemo(() => {
    const coloredSvgString = getColoredSvgString(svgContent, localColor);
    const formattedHtml = formatAndColorizeSvg(svgContent, localColor);
    return { coloredSvgString, formattedHtml };
  }, [svgContent, localColor]);


  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(coloredSvgString);
      showSuccess("SVG code copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy SVG:', err);
      showError("Failed to copy SVG code.");
    }
  };

  const handleDownloadSvg = () => {
    try {
      // Use local color for file name and content
      const cleanColor = localColor.substring(1);
      const blob = new Blob([coloredSvgString], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, `${icon.slug}-${cleanColor}.svg`);
      showSuccess("SVG download started!");
    } catch (error) {
      console.error('Failed to download SVG:', error);
      showError("Failed to download SVG.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            View SVG Code: {icon.title}
            
            {/* Integrated Color Picker */}
            <div className="h-6 w-6">
              <ColorPicker 
                  value={localColor} 
                  onChange={setLocalColor}
                  size="sm"
                  className="h-6 w-6"
              />
            </div>
          </DialogTitle>
          <DialogDescription>
            SVG code colored with the selected color (<span className="font-mono font-semibold" style={{ color: localColor }}>{localColor}</span>).
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 flex-grow min-h-0">
          
          {/* Left Column: Preview and Info - Using min-w and flex-shrink-0 */}
          <div className="flex flex-col gap-4 flex-grow-0 flex-shrink-0 basis-auto min-w-[200px] max-w-[300px]"> 
            
            {/* Preview Panel */}
            <div className="flex flex-col items-center p-4 border rounded-md bg-muted/50 flex-grow justify-center">
              <div
                className="w-24 h-24 mb-4"
                dangerouslySetInnerHTML={{ __html: getColoredSvgString(svgContent, localColor) }}
              />
              <p className="text-sm text-muted-foreground text-center">Preview</p>
            </div>

            {/* Information Card */}
            <IconInfoCard icon={icon} onColorSelect={setLocalColor} />
          </div>

          {/* Code Viewer - Takes up the remaining space */}
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
            Download SVG
          </Button>
          <Button variant="outline" onClick={handleCopySvg}>
            <Copy className="h-4 w-4 mr-2" />
            Copy SVG Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};