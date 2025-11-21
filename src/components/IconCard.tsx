import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconData } from '@/data/icons';
import { Skeleton } from "@/components/ui/skeleton";

interface IconCardProps {
  icon: IconData;
  color: string;
  onColorUse: (color: string) => void;
}

/**
 * Converts a canvas element to a data URL for an ICO file.
 * This avoids the need for an external dependency.
 */
const canvasToIcoUrl = (canvas: HTMLCanvasElement): Promise<string> => {
  return new Promise((resolve) => {
    const pngDataUrl = canvas.toDataURL('image/png');
    const base64Data = pngDataUrl.substring(pngDataUrl.indexOf(',') + 1);
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    const size = canvas.width;
    // ICO file structure: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) + PNG data
    const icoBuffer = new ArrayBuffer(22 + uint8Array.length);
    const dataView = new DataView(icoBuffer);
    let offset = 0;

    // ICONDIR
    dataView.setUint16(offset, 0, true); // Reserved, must be 0
    offset += 2;
    dataView.setUint16(offset, 1, true); // Type 1 for .ico
    offset += 2;
    dataView.setUint16(offset, 1, true); // Number of images
    offset += 2;

    // ICONDIRENTRY
    dataView.setUint8(offset, size === 256 ? 0 : size); // Width
    offset += 1;
    dataView.setUint8(offset, size === 256 ? 0 : size); // Height
    offset += 1;
    dataView.setUint8(offset, 0); // Color count (0 for true color)
    offset += 1;
    dataView.setUint8(offset, 0); // Reserved
    offset += 1;
    dataView.setUint16(offset, 1, true); // Color planes
    offset += 2;
    dataView.setUint16(offset, 32, true); // Bits per pixel
    offset += 2;
    dataView.setUint32(offset, uint8Array.length, true); // Size of image data
    offset += 4;
    dataView.setUint32(offset, 22, true); // Offset of image data
    offset += 4;

    // Image data
    const icoUint8Array = new Uint8Array(icoBuffer);
    icoUint8Array.set(uint8Array, offset);

    const blob = new Blob([icoUint8Array], { type: 'image/x-icon' });
    resolve(URL.createObjectURL(blob));
  });
};


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
    return svgContent.replace('<svg', `<svg fill="${color}"`);
  }, [svgContent, color]);

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
    if (!coloredSvg) return;
    onColorUse(color);

    const fileName = `${icon.slug}-${color.substring(1)}.${format}`;

    if (format === 'svg') {
      const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, fileName);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(img, 0, 0, 256, 256);
      URL.revokeObjectURL(url);

      if (format === 'png') {
        const pngUrl = canvas.toDataURL('image/png');
        triggerDownload(pngUrl, fileName);
      } else if (format === 'ico') {
        const icoUrl = await canvasToIcoUrl(canvas);
        triggerDownload(icoUrl, fileName);
      }
    };
    img.src = url;
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
        <CardFooter className="flex justify-center gap-2">
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