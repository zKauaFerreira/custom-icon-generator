import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from './ui/checkbox';
import { svgToPng, svgToIco } from '@/lib/image-converter';
import { showError } from '@/utils/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { SvgCodeViewerDialog } from './SvgCodeViewerDialog'; // Importando o novo componente

interface IconData {
  title: string;
  slug: string;
}

interface IconCardProps {
  icon: IconData;
  color: string;
  resolution: number; // Nova propriedade
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

const svgCache = new Map<string, string>();

export const IconCard: React.FC<IconCardProps> = ({ icon, color, resolution, isSelected, onSelect }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false); // Estado para o novo modal
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      setLoading(true);
      if (svgCache.has(icon.slug)) {
        setSvgContent(svgCache.get(icon.slug)!);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`https://cdn.simpleicons.org/${icon.slug}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        svgCache.set(icon.slug, text);
        setSvgContent(text);
      } catch (error) {
        console.error("Failed to fetch SVG:", error);
        setSvgContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSvg();
  }, [icon.slug]);

  // Check truncation status
  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        // Check if scrollWidth (total width needed) is greater than clientWidth (visible width)
        setIsTruncated(titleRef.current.scrollWidth > titleRef.current.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [icon.title]);


  const getSvgForPreview = (baseSvg: string | null, fillColor: string) => {
    if (!baseSvg) return '';
    return baseSvg.replace(/<svg(.*?)>/, `<svg fill="${fillColor}"$1>`);
  };

  const triggerDownload = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: 'svg' | 'png' | 'ico') => {
    if (!svgContent) {
      showError("Conteúdo do ícone ainda não carregado.");
      return;
    }

    const cleanColor = color.substring(1);
    const fileName = `${icon.slug}-${cleanColor}.${format}`;

    try {
      let blob: Blob;
      if (format === 'svg') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
        doc.documentElement.setAttribute('fill', color);
        const serializer = new XMLSerializer();
        const coloredSvg = serializer.serializeToString(doc.documentElement);
        blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
      } else if (format === 'png') {
        // PNG usa a resolução
        blob = await svgToPng(svgContent, resolution, color); 
      } else { // ico
        // ICO usa a resolução (embora a função interna possa gerar múltiplas)
        blob = await svgToIco(svgContent, color);
      }
      
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName);
    } catch (error) {
      console.error(`Failed to download as ${format}:`, error);
      showError(`Falha ao baixar como ${format.toUpperCase()}.`);
    }
  };

  const TitleComponent = (
    <CardTitle ref={titleRef} className="truncate pr-8 leading-normal">
      {icon.title}
    </CardTitle>
  );

  return (
    <>
      {/* Removendo o onClick principal do Card */}
      <Card className="flex flex-col relative bg-card transition-shadow hover:shadow-lg">
        <div className="absolute top-3 right-3 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(icon.slug)}
                aria-label={`Select ${icon.title}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Selecionar</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardHeader>
          {isTruncated ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {TitleComponent}
              </TooltipTrigger>
              <TooltipContent>
                <p>{icon.title}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            TitleComponent
          )}
        </CardHeader>
        <CardContent className="flex-grow flex justify-center items-center p-6 rounded-md">
          {loading ? (
            <Skeleton className="h-16 w-16" />
          ) : svgContent ? (
            <div
              className="w-16 h-16"
              dangerouslySetInnerHTML={{ __html: getSvgForPreview(svgContent, color) }}
            />
          ) : (
            <div className="w-16 h-16 bg-destructive/20 rounded-md" />
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Adicionando o onClick para abrir o modal aqui */}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => svgContent && setIsCodeViewerOpen(true)} 
                disabled={loading || !svgContent}
              >
                SVG
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Visualizar Código / Baixar SVG</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => handleDownload('png')} disabled={loading || !svgContent}>PNG</Button>
            </TooltipTrigger>
            <TooltipContent><p>Baixar como PNG ({resolution}x{resolution})</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => handleDownload('ico')} disabled={loading || !svgContent}>ICO</Button>
            </TooltipTrigger>
            <TooltipContent><p>Baixar como ICO (Múltiplas resoluções)</p></TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
      
      {svgContent && (
        <SvgCodeViewerDialog
          open={isCodeViewerOpen}
          onOpenChange={setIsCodeViewerOpen}
          icon={icon}
          svgContent={svgContent}
          color={color}
          resolution={resolution}
        />
      )}
    </>
  );
};