import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to Italian format (dd/mm/yyyy)
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Format time to Italian format (hh:mm)
export function formatTime(dateString: string) {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Format date and time to Italian format (dd/mm/yyyy, hh:mm)
export function formatDateTime(dateString: string) {
  return `${formatDate(dateString)}, ${formatTime(dateString)}`;
}

// Get color hex code from color name
export function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    "Nero": "#000000",
    "Bianco": "#ffffff",
    "Grigio": "#6b7280",
    "Grigio Titanio": "#909090",
    "Rosso": "#dc2626",
    "Rosso Ferrari": "#ff2800",
    "Blu": "#2563eb",
    "Blu Metallizzato": "#0047ab",
    "Verde": "#16a34a",
    "Verde Militare": "#4b5320",
    "Giallo": "#eab308",
    "Arancione": "#f97316",
    "Viola": "#7c3aed",
    "Rosa": "#ec4899",
  };

  return colorMap[colorName] || "#6b7280";
}

// Get text for finish type
export function getFinishTypeText(finishType: string): string {
  const finishTypes: Record<string, string> = {
    "glossy": "Lucida",
    "matte": "Opaca",
    "metallic": "Metallizzata",
    "pearl": "Perlata",
    "satin": "Satinata",
  };

  return finishTypes[finishType] || finishType;
}


