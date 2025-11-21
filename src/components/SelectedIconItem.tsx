import React, { useState, useEffect } from 'react';
import type { IconData } from '@/types/icon';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface SelectedIconItemProps {
  icon: IconData;
  onRemove: (slug: string) => void;
}

const svgCache = new Map<string, string>();

export const SelectedIconItem: React.FC<SelectedIconItemProps> = ({ icon, onRemove }) => {
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
        console.error(`Failed to fetch SVG for ${icon.slug}:`, error);
        setSvgContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSvg();
  }, [icon.slug]);

  const getPreviewSvg = (baseSvg: string | null) => {
    if (!baseSvg) return '';
    return baseSvg.replace('<svg', `<svg fill="currentColor"`);
  };

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground p-2 rounded-md bg-muted/50">
      <div className="flex items-center gap-3 truncate">
        {loading ? (
          <Skeleton className="h-4 w-4" />
        ) : svgContent ? (
          <div
            className="w-4 h-4 flex-shrink-0"
            dangerouslySetInnerHTML={{ __html: getPreviewSvg(svgContent) }}
          />
        ) : (
          <div className="w-4 h-4 bg-destructive/20 rounded-sm flex-shrink-0" />
        )}
        <span className="truncate">{icon.title}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => onRemove(icon.slug)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Remover {icon.title}</span>
      </Button>
    </div>
  );
};