import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorSelectorProps {
  color: string;
  setColor: (color: string) => void;
  recentColors: string[];
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ color, setColor, recentColors }) => {
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="color-picker">Escolha uma cor</Label>
          <Input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-24 h-12 p-1"
          />
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