import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#0f172a",
    },

    background: {
      default: "#edf2f7",
      paper: "#ffffff",
    },

    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },

  typography: {
    fontFamily:
      '"Inter", system-ui, sans-serif',
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#edf2f7",
          color: "#0f172a",
        },
      },
    },
  },
});

export default theme;