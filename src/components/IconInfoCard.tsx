import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IconData } from '@/pages/Index';
import * as allSimpleIcons from 'simple-icons';
import { Link, Palette, Hash } from 'lucide-react';

interface IconInfoCardProps {
  icon: IconData;
}

// Função para buscar os dados originais do Simple Icon usando o slug
const getOriginalIconData = (slug: string) => {
  // Simple Icons exporta objetos com a chave sendo o título, mas precisamos encontrar pelo slug
  const iconKey = Object.keys(allSimpleIcons).find(key => 
    (allSimpleIcons as any)[key].slug === slug
  );
  return iconKey ? (allSimpleIcons as any)[iconKey] : null;
};

export const IconInfoCard: React.FC<IconInfoCardProps> = ({ icon }) => {
  const originalData = getOriginalIconData(icon.slug);
  const originalHex = originalData?.hex ? `#${originalData.hex}` : 'N/A';
  const sourceUrl = originalData?.source;

  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Informações do Ícone</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 text-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground"><Hash className="h-4 w-4" /> Slug:</span>
          <span className="font-mono text-foreground">{icon.slug}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-muted-foreground"><Palette className="h-4 w-4" /> Cor Original:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground">{originalHex}</span>
            {originalHex !== 'N/A' && (
              <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: originalHex }}></div>
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
              Ver Fonte Original
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};