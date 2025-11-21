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
import { useState } from "react";
import { showError } from "@/utils/toast";

export type DownloadFormat = 'svg' | 'png' | 'ico';

interface DownloadFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (format: DownloadFormat) => void;
  isDownloading: boolean;
}

export const DownloadFormatDialog = ({ open, onOpenChange, onDownload, isDownloading }: DownloadFormatDialogProps) => {
  const [format, setFormat] = useState<DownloadFormat>('svg');

  const handleDownloadClick = () => {
    if (!format) {
      showError("Please select a format.");
      return;
    }
    onDownload(format);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Icon Format</DialogTitle>
          <DialogDescription>
            Select the file format to download the icons in the ZIP archive.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={format} onValueChange={(value: DownloadFormat) => setFormat(value)}>
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <RadioGroupItem value="svg" id="r1" />
              <Label htmlFor="r1" className="cursor-pointer flex-grow">SVG (Vector, recommended)</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <RadioGroupItem value="png" id="r2" />
              <Label htmlFor="r2" className="cursor-pointer flex-grow">PNG (Image, 256x256px)</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <RadioGroupItem value="ico" id="r3" />
              <Label htmlFor="r3" className="cursor-pointer flex-grow">ICO (Windows Icon)</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDownloadClick} disabled={isDownloading}>
            {isDownloading ? 'Downloading...' : 'Confirm and Download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};