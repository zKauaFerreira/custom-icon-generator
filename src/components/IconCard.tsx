import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from './ui/checkbox';
import { svgToPng, svgToIco } from '@/lib/image-converter';
import { showError } from '@/utils/toast';

interface IconData {
  title: string;
  slug: string;
}

interface IconCardProps {
  icon: IconData;
  color: string;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

const svgCache = new Map<string, string>();

export const IconCard: React.FC<IconCardProps> = ({ icon, color, isSelected, onSelect }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        blob = await svgToPng(svgContent, 256, color);
      } else { // ico
        blob = await svgToIco(svgContent, color);
      }
      
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName);
    } catch (error) {
      console.error(`Failed to download as ${format}:`, error);
      showError(`Falha ao baixar como ${format.toUpperCase()}.`);
    }
  };

  return (
    <Card className="flex flex-col relative bg-card">
      <div className="absolute top-3 right-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(icon.slug)}
          aria-label={`Select ${icon.title}`}
        />
      </div>
      <CardHeader>
        <CardTitle className="truncate pr-8 leading-normal">{icon.title}</CardTitle>
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
        <Button size="sm" variant="outline" onClick={() => handleDownload('svg')} disabled={loading || !svgContent}>SVG</Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('png')} disabled={loading || !svgContent}>PNG</Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('ico')} disabled={loading || !svgContent}>ICO</Button>
      </CardFooter>
    </Card>
  );
};