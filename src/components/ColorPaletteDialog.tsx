import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ColorPaletteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorPaletteDialog({ open, onOpenChange }: ColorPaletteDialogProps) {
  const [primaryHue, setPrimaryHue] = useState(200);
  const [accentHue, setAccentHue] = useState(142);
  
  const colors = [
    { name: "آبی", hue: 200, var: "--primary" },
    { name: "سبز", hue: 142, var: "--accent" },
    { name: "قرمز", hue: 0, var: "--destructive" },
    { name: "نارنجی", hue: 38, var: "--warning" },
    { name: "بنفش", hue: 270, var: "--primary" },
    { name: "صورتی", hue: 330, var: "--accent" },
  ];

  const applyColor = (hue: number, type: 'primary' | 'accent') => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    if (type === 'primary') {
      setPrimaryHue(hue);
      root.style.setProperty('--primary', `${hue} 90% ${isDark ? '55%' : '45%'}`);
      root.style.setProperty('--ring', `${hue} 90% ${isDark ? '55%' : '45%'}`);
    } else {
      setAccentHue(hue);
      root.style.setProperty('--accent', `${hue} 71% 45%`);
    }
  };

  const resetColors = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    setPrimaryHue(200);
    setAccentHue(142);
    
    root.style.setProperty('--primary', `200 90% ${isDark ? '55%' : '45%'}`);
    root.style.setProperty('--accent', '142 71% 45%');
    root.style.setProperty('--ring', `200 90% ${isDark ? '55%' : '45%'}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تغییر رنگ برنامه</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">رنگ اصلی</Label>
            <div className="grid grid-cols-3 gap-3">
              {colors.slice(0, 4).map((color) => (
                <button
                  key={`primary-${color.hue}`}
                  onClick={() => applyColor(color.hue, 'primary')}
                  className={`h-12 rounded-md transition-all ${
                    primaryHue === color.hue ? 'ring-2 ring-offset-2 ring-foreground' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: `hsl(${color.hue} 90% 45%)` }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">رنگ فرعی</Label>
            <div className="grid grid-cols-3 gap-3">
              {colors.map((color) => (
                <button
                  key={`accent-${color.hue}`}
                  onClick={() => applyColor(color.hue, 'accent')}
                  className={`h-12 rounded-md transition-all ${
                    accentHue === color.hue ? 'ring-2 ring-offset-2 ring-foreground' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: `hsl(${color.hue} 71% 45%)` }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <Button onClick={resetColors} variant="outline" className="w-full">
            بازگشت به رنگ‌های پیش‌فرض
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
