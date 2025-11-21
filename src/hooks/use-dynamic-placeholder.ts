import { useState, useMemo } from 'react';
import type { IconData } from '@/pages/Index';

// Utility function to get a random element from an array
const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Function to generate the placeholder
const generatePlaceholder = (iconList: IconData[]): string => {
  if (iconList.length < 2) return "Search icons...";
  
  const icon1 = getRandomElement(iconList);
  let icon2 = getRandomElement(iconList);
  
  // Ensures the two icons are different
  while (icon2.slug === icon1.slug) {
    icon2 = getRandomElement(iconList);
  }
  
  return `Search icons (ex: ${icon1.title}, ${icon2.title}...)`;
};

/**
 * Hook that returns a dynamic placeholder generated only on component mount.
 * @param iconList The complete list of icon data.
 * @returns The dynamic placeholder string.
 */
export function useDynamicPlaceholder(iconList: IconData[]): string {
  // The placeholder is generated only once during state initialization.
  const [placeholder] = useState(() => generatePlaceholder(iconList));
  
  // The hook no longer needs Lenis or useEffect, as it doesn't update on scroll.
  
  return placeholder;
}