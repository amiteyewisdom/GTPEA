import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#38BDF8",
    },

    background: {
      default: "#071620",
      paper: "#0B192C",
    },

    text: {
      primary: "#E2E8F0",
      secondary: "#94A3B8",
    },
  },

  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#071620",
          color: "#E2E8F0",
        },
      },
    },
  },
});

export default theme;
