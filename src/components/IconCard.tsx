import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface IconData {
  title: string;
  slug: string;
}

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
  const [imageLoading, setImageLoading] = useState(true);
  const cleanColor = color.substring(1);
  const iconUrl = `https://cdn.simpleicons.org/${icon.slug}/${cleanColor}`;

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
    onColorUse(color);
    const fileName = `${icon.slug}-${cleanColor}.${format}`;

    if (format === 'svg') {
      try {
        const response = await fetch(iconUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        triggerDownload(url, fileName);
      } catch (error) {
        console.error("Failed to download SVG:", error);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Necessary for loading external images into canvas

    img.onload = async () => {
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(img, 0, 0, 256, 256);

      if (format === 'png') {
        const pngUrl = canvas.toDataURL('image/png');
        triggerDownload(pngUrl, fileName);
      } else if (format === 'ico') {
        const icoUrl = await canvasToIcoUrl(canvas);
        triggerDownload(icoUrl, fileName);
      }
    };
    
    img.onerror = () => {
      console.error("Failed to load image for conversion:", iconUrl);
    };

    img.src = iconUrl;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{icon.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex justify-center items-center p-6">
        {imageLoading && <Skeleton className="h-16 w-16" />}
        <img
          src={iconUrl}
          alt={icon.title}
          className={`w-16 h-16 ${imageLoading ? 'hidden' : 'block'}`}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => handleDownload('svg')}>SVG</Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('png')}>PNG</Button>
        <Button size="sm" variant="outline" onClick={() => handleDownload('ico')}>ICO</Button>
      </CardFooter>
    </Card>
  );
};