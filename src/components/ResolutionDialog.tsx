import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Resolution = number | 'custom';

interface ResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentResolution: number;
  onResolutionChange: (resolution: number) => void;
}

const PREDEFINED_RESOLUTIONS = [16, 32, 64, 128, 256, 512, 1024];
const MAX_CUSTOM_RESOLUTION = 4096;

export const ResolutionDialog: React.FC<ResolutionDialogProps> = ({ open, onOpenChange, currentResolution, onResolutionChange }) => {
  const [selectedOption, setSelectedOption] = useState<Resolution>(currentResolution);
  const [customValue, setCustomValue] = useState(currentResolution > 1024 ? currentResolution : 2048);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (PREDEFINED_RESOLUTIONS.includes(currentResolution)) {
        setSelectedOption(currentResolution);
      } else {
        setSelectedOption('custom');
        setCustomValue(currentResolution);
      }
      setError(null);
    }
  }, [open, currentResolution]);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) {
      setCustomValue(0);
      setError("A resolução deve ser um número positivo.");
    } else if (value > MAX_CUSTOM_RESOLUTION) {
      setCustomValue(value);
      setError(`Resolução máxima permitida é ${MAX_CUSTOM_RESOLUTION}px.`);
    } else {
      setCustomValue(value);
      setError(null);
    }
    setSelectedOption('custom');
  };

  const handleSave = () => {
    let finalResolution = currentResolution;

    if (selectedOption === 'custom') {
      if (error || customValue <= 0 || customValue > MAX_CUSTOM_RESOLUTION) {
        setError(error || "Por favor, insira uma resolução válida.");
        return;
      }
      finalResolution = customValue;
    } else if (typeof selectedOption === 'number') {
      finalResolution = selectedOption;
    }

    onResolutionChange(finalResolution);
    onOpenChange(false);
  };

  const displayCustomValue = selectedOption === 'custom' ? customValue : currentResolution;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Resolução de Download</DialogTitle>
          <DialogDescription>
            Selecione o tamanho (largura e altura em pixels) para os downloads em PNG.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <RadioGroup 
            value={selectedOption.toString()} 
            onValueChange={(value) => setSelectedOption(value === 'custom' ? 'custom' : parseInt(value, 10))}
            className="grid grid-cols-3 gap-2"
          >
            {PREDEFINED_RESOLUTIONS.map((res) => (
              <div key={res} className="flex items-center space-x-2">
                <RadioGroupItem value={res.toString()} id={`res-${res}`} className="sr-only" />
                <Label 
                  htmlFor={`res-${res}`} 
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    selectedOption === res && "border-primary"
                  )}
                >
                  <Check className={cn("mb-1 h-4 w-4", selectedOption === res ? "opacity-100" : "opacity-0")} />
                  {res}x{res}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2 pt-4">
            <Label htmlFor="custom-res">Resolução Personalizada (Máx: {MAX_CUSTOM_RESOLUTION}px)</Label>
            <div className="flex gap-2">
              <Input
                id="custom-res"
                type="number"
                value={customValue}
                onChange={handleCustomChange}
                min={1}
                max={MAX_CUSTOM_RESOLUTION}
                className={cn(selectedOption === 'custom' && error && "border-destructive")}
              />
              <Input
                value={`${displayCustomValue}x${displayCustomValue}`}
                disabled
                className="w-32 text-center bg-muted/50"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <X className="h-4 w-4" /> {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!!error || customValue <= 0}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};