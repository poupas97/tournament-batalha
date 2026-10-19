"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    background: {
      default: "#f6f8fa",
    },
    text: {
      primary: "#24292f",
    },
    primary: {
      main: "#0969da",
    },
    error: {
      main: "#d92f2f",
    },
  },

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: "system-ui, sans-serif",
  },
});

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        [theme.breakpoints.down("sm")]: {
          minWidth: 0,
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
        },
      },
    },
  },

  MuiCssBaseline: {
    styleOverrides: {
      html: {
        [theme.breakpoints.down("sm")]: {
          fontSize: "14px",
        },
      },

      body: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      },

      "button, input, select, textarea": {
        font: "inherit",
      },

      main: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: 0,
        gap: theme.spacing(4),
        padding: theme.spacing(4),
      },
    },
  },
};

theme.components = components;

export default function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
