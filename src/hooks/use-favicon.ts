import { useEffect, useMemo } from 'react';
import { Canvg } from 'canvg';
import { CUSTOM_FAVICON_SVG } from '@/lib/favicon-icon';

const FAVICON_SIZE = 64; // Standard size for modern favicons

/**
 * Hook to dynamically update the document favicon based on a color.
 * @param color The hex color string (e.g., '#FF0000').
 */
export function useFavicon(color: string) {
  
  // Memoize the colored SVG string
  const coloredSvg = useMemo(() => {
    // Replace all fill attributes with the current color
    // Note: The provided SVG uses fill="#000000" which we need to replace.
    // We also ensure the SVG is properly formatted for Canvg.
    return CUSTOM_FAVICON_SVG.replace(/fill="#000000"/g, `fill="${color}"`);
  }, [color]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = FAVICON_SIZE;
    canvas.height = FAVICON_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Could not get canvas context for favicon generation.");
      return;
    }

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Use Canvg to render the colored SVG onto the canvas
    const renderFavicon = async () => {
      try {
        const v = await Canvg.from(ctx, coloredSvg);
        await v.render();
        
        // Convert canvas to PNG Data URL
        const dataURL = canvas.toDataURL('image/png');
        link!.href = dataURL;
      } catch (error) {
        console.error("Failed to render SVG for favicon:", error);
      }
    };

    renderFavicon();

  }, [coloredSvg]);
}