import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Color {
  name: string;
  hex: string;
}

interface ColorPickerProps {
  onColorChange: (color: Color) => void;
  defaultColor?: Color;
  onColorCodeChange: (colorCode: string) => void;
  defaultColorCode?: string;
}

export function ColorPicker({ 
  onColorChange, 
  defaultColor, 
  onColorCodeChange,
  defaultColorCode = ""
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<Color>(
    defaultColor || { name: "Blu", hex: "#2563eb" }
  );
  const [colorCode, setColorCode] = useState<string>(defaultColorCode);

  const colors: Color[] = [
    { name: "Nero", hex: "#000000" },
    { name: "Bianco", hex: "#ffffff" },
    { name: "Grigio", hex: "#6b7280" },
    { name: "Rosso", hex: "#dc2626" },
    { name: "Blu", hex: "#2563eb" },
    { name: "Verde", hex: "#16a34a" },
    { name: "Giallo", hex: "#eab308" },
    { name: "Arancione", hex: "#f97316" },
    { name: "Viola", hex: "#7c3aed" },
    { name: "Rosa", hex: "#ec4899" },
  ];

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const handleColorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorCode(e.target.value);
    onColorCodeChange(e.target.value);
  };

  return (
    <div>
      <Label className="block text-sm font-medium mb-2">
        Colore
      </Label>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {colors.map((color) => (
          <div
            key={color.name}
            className={cn(
              "w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform duration-150",
              selectedColor.name === color.name 
                ? "transform scale-115 ring-2 ring-primary" 
                : "hover:scale-110"
            )}
            style={{ backgroundColor: color.hex }}
            onClick={() => handleColorSelect(color)}
            title={color.name}
          />
        ))}
      </div>
      <div className="flex items-center mb-2">
        <Input
          type="text"
          id="colorCode"
          placeholder="Codice colore (es. RAL 5002)"
          value={colorCode}
          onChange={handleColorCodeChange}
          className="w-full"
        />
      </div>
      <div className="text-sm text-muted-foreground mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Colore selezionato: <span className="font-medium ml-1">{selectedColor.name}</span>
      </div>
    </div>
  );
}
