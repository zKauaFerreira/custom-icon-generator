import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from './ui/label';

interface PreviewBackgroundSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PreviewBackgroundSelector: React.FC<PreviewBackgroundSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Label>Fundo</Label>
      <ToggleGroup type="single" value={value} onValueChange={(newValue) => newValue && onChange(newValue)} defaultValue="transparent">
        <ToggleGroupItem value="transparent" aria-label="Fundo transparente">Transparente</ToggleGroupItem>
        <ToggleGroupItem value="#ffffff" aria-label="Fundo branco">Branco</ToggleGroupItem>
        <ToggleGroupItem value="#000000" aria-label="Fundo preto">Preto</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};