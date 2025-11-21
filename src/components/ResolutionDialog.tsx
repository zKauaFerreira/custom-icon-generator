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
    
    // Atualiza o valor personalizado, mesmo que seja inválido temporariamente
    setCustomValue(value);
    setSelectedOption('custom');

    if (isNaN(value) || value <= 0) {
      setError("A resolução deve ser um número positivo.");
    } else if (value > MAX_CUSTOM_RESOLUTION) {
      setError(`Resolução máxima permitida é ${MAX_CUSTOM_RESOLUTION}px.`);
    } else {
      setError(null);
    }
  };

  const handleOptionChange = (value: string) => {
    const newOption = value === 'custom' ? 'custom' : parseInt(value, 10);
    setSelectedOption(newOption);

    if (typeof newOption === 'number') {
      // Se selecionar uma opção predefinida, atualiza o campo customValue para refletir essa escolha
      setCustomValue(newOption);
      setError(null);
    }
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

  const currentDisplayValue = selectedOption === 'custom' ? customValue : (typeof selectedOption === 'number' ? selectedOption : currentResolution);
  const isCustomSelected = selectedOption === 'custom';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Resolução de Download</DialogTitle>
          <DialogDescription>
            Selecione o tamanho (largura e altura em pixels) para os downloads em PNG e ICO.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          
          {/* Opções Predefinidas */}
          <RadioGroup 
            value={selectedOption.toString()} 
            onValueChange={handleOptionChange}
            className="space-y-2"
          >
            <Label className="text-sm font-medium">Resoluções Padrão:</Label>
            {PREDEFINED_RESOLUTIONS.map((res) => (
              <div key={res} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                <RadioGroupItem value={res.toString()} id={`res-${res}`} />
                <Label htmlFor={`res-${res}`} className="flex-grow cursor-pointer">
                  {res}x{res}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Resolução Personalizada */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => setSelectedOption('custom')}>
                <RadioGroupItem value="custom" id="res-custom" />
                <Label htmlFor="res-custom" className="flex-grow cursor-pointer">
                    Resolução Personalizada (Máx: {MAX_CUSTOM_RESOLUTION}px)
                </Label>
            </div>
            
            <div className="flex gap-2 pl-8">
              <Input
                id="custom-res"
                type="number"
                value={isCustomSelected ? (customValue === 0 ? '' : customValue) : currentDisplayValue}
                onChange={handleCustomChange}
                onFocus={() => setSelectedOption('custom')}
                min={1}
                max={MAX_CUSTOM_RESOLUTION}
                placeholder="Ex: 2048"
                className={cn("w-1/2", isCustomSelected && error && "border-destructive")}
              />
              <Input
                value={`x ${currentDisplayValue}`}
                disabled
                className="w-1/2 text-center bg-muted/50"
              />
            </div>
            
            {error && isCustomSelected && (
              <p className="text-sm text-destructive flex items-center gap-1 pl-8">
                <X className="h-4 w-4" /> {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!!error || currentDisplayValue <= 0}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};