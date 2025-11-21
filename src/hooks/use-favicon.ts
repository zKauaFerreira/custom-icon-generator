import { useEffect, useMemo } from 'react';
import { Canvg } from 'canvg';
import { CUSTOM_FAVICON_SVG } from '@/lib/favicon-icon';

// Aumentando o tamanho para 256x256 para garantir alta resolução em telas HiDPI
const FAVICON_SIZE = 256; 

/**
 * Hook to dynamically update the document favicon based on a color.
 * @param color The hex color string (e.g., '#FF0000').
 */
export function useFavicon(color: string) {
  
  // Memoize the colored SVG string
  const coloredSvg = useMemo(() => {
    // Ensure color is a valid hex string before replacement, defaulting to black if invalid/empty
    const safeColor = color && /^#([0-9A-F]{3}){1,2}$/i.test(color) ? color : '#000000';
    // Replace all fill attributes with the current color
    // Note: The provided SVG uses fill="#000000" which we need to replace.
    return CUSTOM_FAVICON_SVG.replace(/fill="#000000"/g, `fill="${safeColor}"`);
  }, [color]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isStale = false; // Flag para evitar aplicar resultados de renderizações desatualizadas

    const canvas = document.createElement('canvas');
    canvas.width = FAVICON_SIZE;
    canvas.height = FAVICON_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Could not get canvas context for favicon generation.");
      return;
    }
    
    // Limpa o canvas antes de renderizar o novo conteúdo
    ctx.clearRect(0, 0, FAVICON_SIZE, FAVICON_SIZE);

    // 1. Find or create the dynamic favicon link element
    let link: HTMLLinkElement | null = document.querySelector("link[rel='icon'][data-dynamic='true']") as HTMLLinkElement;
    
    if (!link) {
      // If the dynamic link doesn't exist, remove any existing default favicon links 
      document.querySelectorAll("link[rel*='icon']").forEach(existingLink => {
        if (!existingLink.getAttribute('data-dynamic')) {
          existingLink.remove();
        }
      });
      
      // Create the dynamic link if it wasn't found
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png'; // Explicitly set type
      link.setAttribute('data-dynamic', 'true'); // Mark as dynamic link
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    // Use Canvg to render the colored SVG onto the canvas
    const renderFavicon = async () => {
      try {
        // Use Canvg.fromString to explicitly load from a string.
        const v = Canvg.fromString(ctx, coloredSvg);
        await v.render();
        
        if (isStale) return; // Verificação crucial: se uma nova execução do efeito começou, ignora este resultado.
        
        // Convert canvas to PNG Data URL
        const dataURL = canvas.toDataURL('image/png');
        link!.href = dataURL;
      } catch (error) {
        // Only log if it's not stale
        if (!isStale) {
            console.error("Failed to render SVG for favicon:", error);
        }
      }
    };

    renderFavicon();
    
    // Função de limpeza: marca esta execução do efeito como obsoleta se uma nova começar
    return () => {
      isStale = true;
    };

  }, [coloredSvg]);
}