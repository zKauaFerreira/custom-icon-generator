import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IconData } from '@/pages/Index';
import * as allSimpleIcons from 'simple-icons';
import { Link, Palette, Hash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface IconInfoCardProps {
  icon: IconData;
  onColorSelect: (color: string) => void;
}

// Função para buscar os dados originais do Simple Icon usando o slug
const getOriginalIconData = (slug: string) => {
  // Simple Icons exporta objetos com a chave sendo o título, mas precisamos encontrar pelo slug
  const iconKey = Object.keys(allSimpleIcons).find(key => 
    (allSimpleIcons as any)[key].slug === slug
  );
  return iconKey ? (allSimpleIcons as any)[iconKey] : null;
};

export const IconInfoCard: React.FC<IconInfoCardProps> = ({ icon, onColorSelect }) => {
  const originalData = getOriginalIconData(icon.slug);
  const originalHex = originalData?.hex ? `#${originalData.hex}` : 'N/A';
  const sourceUrl = originalData?.source;
  const isColorAvailable = originalHex !== 'N/A';

  const handleColorClick = () => {
    if (isColorAvailable) {
      onColorSelect(originalHex);
    }
  };

  return (
    <Card className="w-full flex-grow bg-muted/50 border-none shadow-none">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Informações</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 text-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground"><Hash className="h-4 w-4" /> Slug:</span>
          <span className="font-mono text-foreground text-right">{icon.slug}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-muted-foreground cursor-default">
                <Palette className="h-4 w-4" /> Cor:
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cor Original do Ícone</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground">{originalHex}</span>
            {isColorAvailable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleColorClick}
                    className="w-4 h-4 rounded-sm border cursor-pointer hover:ring-2 ring-primary transition-all"
                    style={{ backgroundColor: originalHex }}
                    aria-label={`Usar cor ${originalHex}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Usar Cor Original</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        {sourceUrl && (
          <div className="pt-2 border-t">
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline flex items-center gap-1 text-xs"
            >
              <Link className="h-4 w-4" />
              Fonte Original
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};