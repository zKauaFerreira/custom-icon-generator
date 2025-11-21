import { useState, useMemo } from 'react';
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
  
  return `Pesquisar ícones (ex: ${icon1.title}, ${icon2.title}...)`;
};

/**
 * Hook que retorna um placeholder dinâmico que é gerado apenas na montagem do componente.
 * @param iconList A lista completa de dados dos ícones.
 * @returns A string do placeholder dinâmico.
 */
export function useDynamicPlaceholder(iconList: IconData[]): string {
  // O placeholder é gerado apenas uma vez na inicialização do estado.
  const [placeholder] = useState(() => generatePlaceholder(iconList));
  
  // O hook não precisa mais do Lenis nem do useEffect, pois não atualiza na rolagem.
  
  return placeholder;
}