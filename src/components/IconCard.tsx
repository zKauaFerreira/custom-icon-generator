import React, { useState, useEffect } from 'react';
import ICO from 'icojs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from './ui/checkbox';

interface IconData {
  title: string;
  slug: string;
}

interface IconCardProps {
  icon: IconData;
  color: string;
  previewBg: string;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

const svgCache = new Map<string, string>();

export const IconCard: React.FC<IconCardProps> = ({ icon, color, previewBg, isSelected, onSelect }) => {
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

  const getColoredSvg = (baseSvg: string | null, fillColor: string) => {
    if (!baseSvg) return '';
    return baseSvg.replace('<svg', `<svg fill="${fillColor}"`);
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

  const convertSvgToPng = (svgBlobUrl: string, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Could not get canvas context"));

      const img = new Image();
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => reject(new Error(`Failed to load SVG blob into image: ${e}`));
      img.src = svgBlobUrl;
    });
  };

  const handleDownload = async (format: 'svg' | 'png' | 'ico') => {
    const coloredSvg = getColoredSvg(svgContent, color);
    if (!coloredSvg) return;

    const cleanColor = color.substring(1);
    const fileName = `${icon.slug}-${cleanColor}.${format}`;
    const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
      if (format === 'svg') {
        triggerDownload(url, fileName);
      } else if (format === 'png') {
        const pngUrl = await convertSvgToPng(url, 256);
        triggerDownload(pngUrl, fileName);
      } else if (format === 'ico') {
        const sizes = [16, 32, 48];
        const imageBuffers = await Promise.all(sizes.map(size => {
          return new Promise<{ data: Uint8ClampedArray; width: number; height: number; }>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));

            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, size, size);
              const imageData = ctx.getImageData(0, 0, size, size);
              resolve({
                data: imageData.data,
                width: size,
                height: size,
              });
            };
            img.onerror = (err) => reject(err);
            img.src = url;
          });
        }));

        const icoBuffer = ICO.encode(imageBuffers);
        const icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
        const icoUrl = URL.createObjectURL(icoBlob);
        triggerDownload(icoUrl, fileName);
      }
    } catch (error) {
      console.error(`Failed to download as ${format}:`, error);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="flex flex-col relative">
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(icon.slug)}
          aria-label={`Select ${icon.title}`}
        />
      </div>
      <CardHeader>
        <CardTitle className="truncate pl-8">{icon.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex justify-center items-center p-6 rounded-md" style={{ backgroundColor: previewBg }}>
        {loading ? (
          <Skeleton className="h-16 w-16" />
        ) : svgContent ? (
          <div
            className="w-16 h-16"
            dangerouslySetInnerHTML={{ __html: getColoredSvg(svgContent, color) }}
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