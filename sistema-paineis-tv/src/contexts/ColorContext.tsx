
import { createContext, useContext, useEffect, useState } from 'react';

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

interface ColorContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  presetSchemes: { name: string; scheme: ColorScheme }[];
  resetToDefault: () => void;
}

const defaultScheme: ColorScheme = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  accent: '#10b981',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827'
};

const presetSchemes = [
  {
    name: 'Azul Padrão',
    scheme: defaultScheme
  },
  {
    name: 'Verde Esmeralda',
    scheme: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#3b82f6',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#111827'
    }
  },
  {
    name: 'Roxo Moderno',
    scheme: {
      primary: '#8b5cf6',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#111827'
    }
  },
  {
    name: 'Laranja Vibrante',
    scheme: {
      primary: '#f97316',
      secondary: '#6b7280',
      accent: '#06b6d4',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#111827'
    }
  },
  {
    name: 'Rosa Elegante',
    scheme: {
      primary: '#ec4899',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#111827'
    }
  },
  {
    name: 'Azul Escuro',
    scheme: {
      primary: '#1e40af',
      secondary: '#6b7280',
      accent: '#059669',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#111827'
    }
  }
];

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme');
    return saved ? JSON.parse(saved) : defaultScheme;
  });

  useEffect(() => {
    // Aplicar cores CSS customizadas
    const root = document.documentElement;
    
    // Converter hex para RGB para usar com opacity
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const primaryRgb = hexToRgb(colorScheme.primary);
    const accentRgb = hexToRgb(colorScheme.accent);

    if (primaryRgb) {
      root.style.setProperty('--color-primary', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
    }
    if (accentRgb) {
      root.style.setProperty('--color-accent', `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`);
    }

    root.style.setProperty('--color-primary-hex', colorScheme.primary);
    root.style.setProperty('--color-secondary-hex', colorScheme.secondary);
    root.style.setProperty('--color-accent-hex', colorScheme.accent);
    root.style.setProperty('--color-background-hex', colorScheme.background);
    root.style.setProperty('--color-surface-hex', colorScheme.surface);
    root.style.setProperty('--color-text-hex', colorScheme.text);

    localStorage.setItem('colorScheme', JSON.stringify(colorScheme));
  }, [colorScheme]);

  const resetToDefault = () => {
    setColorScheme(defaultScheme);
  };

  return (
    <ColorContext.Provider value={{ 
      colorScheme, 
      setColorScheme, 
      presetSchemes,
      resetToDefault 
    }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
}
