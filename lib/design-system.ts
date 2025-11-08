/**
 * Mr.Prompt Design System
 * Modern, professional, and accessible color palette
 * Suitable for all ages and genders
 */

export const designSystem = {
  // Primary Brand Colors - Sophisticated and Modern
  colors: {
    primary: {
      50: '#f0f9ff',   // Lightest blue
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Main brand color - Professional Sky Blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',  // Darkest
    },
    
    // Secondary - Elegant Purple (for accents)
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // Main secondary - Elegant Purple
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    
    // Success - Fresh Green
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning - Warm Amber
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error - Soft Red
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral - Sophisticated Grays
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  
  // Gradients - Subtle and Professional
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    secondary: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    sunset: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    ocean: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
    forest: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
    
    // Background gradients - Very subtle
    bgLight: 'linear-gradient(180deg, rgba(14, 165, 233, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)',
    bgDark: 'linear-gradient(180deg, rgba(14, 165, 233, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)',
  },
  
  // Shadows - Soft and Modern
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    
    // Colored shadows for emphasis
    primaryGlow: '0 8px 16px -4px rgba(14, 165, 233, 0.3)',
    secondaryGlow: '0 8px 16px -4px rgba(168, 85, 247, 0.3)',
    successGlow: '0 8px 16px -4px rgba(34, 197, 94, 0.3)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", Consolas, Monaco, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
}

// Chat-specific color scheme
export const chatColors = {
  // User message - Professional Blue
  user: {
    bg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    text: '#ffffff',
    border: '#0284c7',
  },
  
  // Assistant message - Elegant Light Gray
  assistant: {
    bg: '#f5f5f5',
    text: '#171717',
    border: '#e5e5e5',
  },
  
  // System message - Subtle Purple
  system: {
    bg: '#faf5ff',
    text: '#581c87',
    border: '#e9d5ff',
  },
  
  // Code block - Dark Theme
  code: {
    bg: '#1e293b',
    text: '#e2e8f0',
    border: '#334155',
    lineNumbers: '#64748b',
    highlight: '#334155',
  },
  
  // Input area
  input: {
    bg: '#ffffff',
    border: '#e5e5e5',
    borderFocus: '#0ea5e9',
    placeholder: '#a3a3a3',
  },
}

// Admin panel colors
export const adminColors = {
  sidebar: {
    bg: '#0c4a6e',
    bgHover: '#075985',
    text: '#e0f2fe',
    textActive: '#ffffff',
    border: '#0369a1',
  },
  
  stats: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
  },
  
  chart: {
    primary: '#0ea5e9',
    secondary: '#a855f7',
    tertiary: '#22c55e',
    quaternary: '#f59e0b',
  },
}

// Export utility function for getting colors
export function getColor(path: string): string {
  const keys = path.split('.')
  let value: any = designSystem.colors
  
  for (const key of keys) {
    value = value?.[key]
  }
  
  return value || '#000000'
}

// Export utility for creating custom gradients
export function createGradient(color1: string, color2: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`
}
