import { useState, useEffect, useMemo } from 'react';
import { useLenis } from '@/components/LenisProvider';
import type { IconData } from '@/pages/Index';

// Função utilitária para obter um elemento aleatório de um array
const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Função para gerar o placeholder
const generatePlaceholder = (iconList: IconData[]): string => {
  if (iconList.length < 2) return "Pesquisar ícones...";
  
  const icon1 = getRandomElement(iconList);
  let icon2 = getRandomElement(iconList);
  
  // Garante que os dois ícones sejam diferentes
  while (icon2.slug === icon1.slug) {
    icon2 = getRandomElement(iconList);
  }
  
  return `${icon1.title}, ${icon2.title}...`;
};

/**
 * Hook que retorna um placeholder dinâmico que muda a cada rolagem.
 * @param iconList A lista completa de dados dos ícones.
 * @returns A string do placeholder dinâmico.
 */
export function useDynamicPlaceholder(iconList: IconData[]): string {
  const lenis = useLenis();
  const [placeholder, setPlaceholder] = useState(() => generatePlaceholder(iconList));
  
  // Memoiza a função de geração para evitar recriação desnecessária
  const updatePlaceholder = useMemo(() => () => {
    setPlaceholder(generatePlaceholder(iconList));
  }, [iconList]);

  useEffect(() => {
    if (!lenis) return;

    // Lenis usa um evento 'scroll' que podemos ouvir
    lenis.on('scroll', updatePlaceholder);

    return () => {
      lenis.off('scroll', updatePlaceholder);
    };
  }, [lenis, updatePlaceholder]);
  
  return placeholder;
}