import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from './ui/button';
import { Copy, Shuffle } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface ColorSelectorProps {
  color: string;
  setColor: (color: string) => void;
  recentColors: string[];
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ color, setColor, recentColors }) => {
  const handleRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setColor(randomColor);
  };

  const handleCopyColor = () => {
    navigator.clipboard.writeText(color);
    showSuccess("Cor copiada para a área de transferência!");
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="color-picker">Escolha uma cor</Label>
          <div className="flex items-center gap-2">
            <input
              id="color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 p-0 bg-transparent border-0 rounded-md cursor-pointer"
            />
            <Button variant="outline" size="icon" onClick={handleCopyColor}><Copy className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={handleRandomColor}><Shuffle className="h-4 w-4" /></Button>
          </div>
        </div>
        {recentColors.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>Cores recentes</Label>
            <div className="flex gap-2 flex-wrap">
              {recentColors.map((recentColor) => (
                <button
                  key={recentColor}
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: recentColor }}
                  onClick={() => setColor(recentColor)}
                  aria-label={`Select color ${recentColor}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};