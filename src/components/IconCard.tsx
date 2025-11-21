import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { IconData } from '@/data/icons';
import { Skeleton } from "@/components/ui/skeleton";
import toIco from 'canvas-to-ico';

interface IconCardProps {
  icon: IconData;
  color: string;
  onColorUse: (color: string) => void;
}

export const IconCard: React.FC<IconCardProps> = ({ icon, color, onColorUse }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://cdn.simpleicons.org/${icon.slug}`)
      .then(res => res.text())
      .then(text => {
        setSvgContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to fetch icon: ${icon.slug}`, err);
        setLoading(false);
      });
  }, [icon.slug]);

  const coloredSvg = useMemo(() => {
    if (!svgContent) return null;
    // Adiciona o atributo fill à tag <svg> para colorir o ícone.
    return svgContent.replace('<svg', `<svg fill="${color}"`);
  }, [svgContent, color]);

  const handleDownload = (format: 'svg' | 'png' | 'ico') => {
    if (!coloredSvg) return;
    onColorUse(color);

    const fileName = `${icon.slug}-${color.substring(1)}.${format}`;

    if (format === 'svg') {
      const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName);
    } else {
      // Para PNG e ICO, precisamos renderizar o SVG em um canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = 256;
        canvas.height = 256;
        ctx.drawImage(img, 0, 0, 256, 256);
        URL.revokeObjectURL(url);

        if (format === 'png') {
          const pngUrl = canvas.toDataURL('image/png');
          triggerDownload(pngUrl, fileName);
        } else if (format === 'ico') {
          const icoUrl = toIco(canvas);
          triggerDownload(icoUrl, fileName);
        }
      };
      img.src = url;
    }
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <Skeleton className="h-16 w-16" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{icon.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex justify-center items-center p-6">
        {coloredSvg && (
          <div
            className="w-16 h-16"
            dangerouslySetInnerHTML={{ __html: coloredSvg }}
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => handleDownload('svg')}>SVG</Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('png')}>PNG</Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('ico')}>ICO</Button>
      </CardFooter>
    </Card>
  );
};