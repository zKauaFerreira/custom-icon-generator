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

    // 1. Find or create the dynamic favicon link element
    let link: HTMLLinkElement | null = document.querySelector("link[rel='icon'][data-dynamic='true']") as HTMLLinkElement;
    
    if (!link) {
      // If the dynamic link doesn't exist, remove any existing default favicon links 
      // (this is crucial if the browser cached a static one)
      document.querySelectorAll("link[rel*='icon']").forEach(existingLink => {
        if (!existingLink.getAttribute('data-dynamic')) {
          existingLink.remove();
        }
      });
      
      // Create the dynamic link if it wasn't found (should be found now due to index.html change)
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png'; // Explicitly set type
      link.setAttribute('data-dynamic', 'true'); // Mark as dynamic link
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