/**
 * 主题系统
 * 定义应用的主题配置和颜色系统
 */

export interface ThemeColors {
  // 主要颜色
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // 次要颜色
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // 背景颜色
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  
  // 文本颜色
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // 边框颜色
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  
  // 状态颜色
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// 深空主题
export const deepSpaceTheme: Theme = {
  name: 'deep-space',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    background: {
      primary: '#0f172a', // slate-900
      secondary: '#1e293b', // slate-800
      tertiary: '#334155', // slate-700
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#f8fafc', // slate-50
      secondary: '#e2e8f0', // slate-200
      tertiary: '#94a3b8', // slate-400
      inverse: '#0f172a', // slate-900
    },
    border: {
      primary: '#475569', // slate-600
      secondary: '#334155', // slate-700
      focus: '#3b82f6', // blue-500
    },
    status: {
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
      info: '#06b6d4', // cyan-500
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

// 星云主题
export const nebulaTheme: Theme = {
  name: 'nebula',
  colors: {
    primary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    background: {
      primary: '#1a0b2e', // 深紫色
      secondary: '#2d1b4e', // 中紫色
      tertiary: '#4c2a6b', // 浅紫色
      overlay: 'rgba(26, 11, 46, 0.8)',
    },
    text: {
      primary: '#fdf4ff', // fuchsia-50
      secondary: '#f5d0fe', // fuchsia-200
      tertiary: '#e879f9', // fuchsia-400
      inverse: '#1a0b2e',
    },
    border: {
      primary: '#a21caf', // fuchsia-700
      secondary: '#86198f', // fuchsia-800
      focus: '#d946ef', // fuchsia-500
    },
    status: {
      success: '#22c55e', // green-500
      warning: '#eab308', // yellow-500
      error: '#f97316', // orange-500
      info: '#8b5cf6', // violet-500
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(139 92 246 / 0.1)',
    md: '0 4px 6px -1px rgb(139 92 246 / 0.2), 0 2px 4px -2px rgb(139 92 246 / 0.1)',
    lg: '0 10px 15px -3px rgb(139 92 246 / 0.2), 0 4px 6px -4px rgb(139 92 246 / 0.1)',
    xl: '0 20px 25px -5px rgb(139 92 246 / 0.2), 0 8px 10px -6px rgb(139 92 246 / 0.1)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

// 可用主题列表
export const themes = {
  'deep-space': deepSpaceTheme,
  'nebula': nebulaTheme,
} as const;

export type ThemeName = keyof typeof themes;

// 默认主题
export const defaultTheme = deepSpaceTheme;
