import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

export type ThemeColorName = 'Dark' | 'Violet' | 'Blue';

export interface ThemeColor {
  name: ThemeColorName;
  main: string;
}

export const THEME_COLORS: Record<ThemeColorName, ThemeColor> = {
  'Dark': { name: 'Dark', main: '#111318' },
  'Violet': { name: 'Violet', main: '#7c4dff' },
  'Blue': { name: 'Blue', main: '#1976d2' },
};

interface ThemeContextType {
  currentColor: ThemeColor;
  setThemeColor: (colorName: ThemeColorName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentColor: THEME_COLORS['Dark'],
  setThemeColor: () => {},
});

export const useCustomTheme = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user._id || user.email;
      }
    } catch (e) {}
    return null;
  };

  const getSavedColor = useCallback(() => {
    const userId = getUserId();
    const key = userId ? `appThemeColor_${userId}` : 'appThemeColor_default';
    const savedColor = localStorage.getItem(key) as ThemeColorName;
    return savedColor && THEME_COLORS[savedColor] ? savedColor : 'Dark';
  }, []);

  const [currentColorName, setCurrentColorName] = useState<ThemeColorName>(getSavedColor);

  const currentColor = THEME_COLORS[currentColorName];

  useEffect(() => {
    const userId = getUserId();
    const key = userId ? `appThemeColor_${userId}` : 'appThemeColor_default';
    localStorage.setItem(key, currentColorName);
  }, [currentColorName]);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentColorName(getSavedColor());
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [getSavedColor]);

  const setThemeColor = (colorName: ThemeColorName) => {
    setCurrentColorName(colorName);
  };

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: currentColor.main,
          },
        },
      }),
    [currentColor]
  );

  return (
    <ThemeContext.Provider value={{ currentColor, setThemeColor }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
