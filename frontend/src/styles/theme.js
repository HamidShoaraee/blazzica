import { createTheme } from '@mui/material/styles';

// Custom color palette
const palette = {
  primary: {
    main: '#7209B7',
    light: '#B5179E',
    dark: '#560BAD',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F72585',
    light: '#FF5CA8',
    dark: '#C20062',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  error: {
    main: '#FF4D4F',
  },
  success: {
    main: '#52C41A',
  },
  info: {
    main: '#4361EE',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Typography settings
const typography = {
  fontFamily: [
    'Poppins',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontWeight: 700,
    fontSize: '3.5rem',
    lineHeight: 1.2,
    '@media (max-width:600px)': {
      fontSize: '2.5rem',
    },
  },
  h2: {
    fontWeight: 700,
    fontSize: '2.75rem',
    lineHeight: 1.3,
    '@media (max-width:600px)': {
      fontSize: '2rem',
    },
  },
  h3: {
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.3,
    '@media (max-width:600px)': {
      fontSize: '1.5rem',
    },
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: '1.125rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
  },
};

// Shape settings
const shape = {
  borderRadius: 12,
};

// Components overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 50,
        padding: '12px 24px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)',
        },
      },
      containedPrimary: {
        background: `linear-gradient(45deg, ${palette.primary.main}, ${palette.secondary.main})`,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderRadius: 12,
            borderColor: palette.grey[300],
          },
          '&:hover fieldset': {
            borderColor: palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: palette.primary.main,
          },
        },
      },
    },
  },
};

// Create and export the theme
const theme = createTheme({
  palette,
  typography,
  shape,
  components,
});

export default theme; 