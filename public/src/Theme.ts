import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f06f13',
    },
    secondary: {
      main: '#FFFFFF',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
  },
});

export default theme;
