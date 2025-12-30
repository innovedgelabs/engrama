import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#002855', // Navy from logo - main brand color for titles, text
      light: '#1a4d7a',
      dark: '#001a3d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3ECFA0', // Teal/Mint from logo - accents, highlights
      light: '#6edbb8',
      dark: '#2ba87f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    success: {
      main: '#2BA87F',    // Darker mint - compliant/active
      light: '#3ECFA0',   // Brand mint
      dark: '#1f7a5c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',    // Warm amber - pending/review
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#000000',
    },
    error: {
      main: '#EF4444',    // Modern coral red - expired/critical
      light: '#FCA5A5',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0EA5E9',    // Bright blue - neutral info
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    htmlFontSize: 15,
    h1: {
      fontWeight: 600,
      fontSize: '2.25rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.3125rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.9375rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
    button: {
      fontSize: '0.8125rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Minimum 44px touch target on mobile
        },
        sizeSmall: {
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // Minimum 44px touch target on mobile
        },
        sizeSmall: {
        },
        sizeLarge: {
        },
      },
    },
  },
});

export default theme;

