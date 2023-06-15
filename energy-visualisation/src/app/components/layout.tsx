"use client";

import * as React from "react";
import { CSSObject, Theme, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import DrawerNav from "./drawer-nav";
import TopAppBar from "./top-app-bar";
import { ThemeContext, ThemeProvider } from "../contexts/theme-context";
import { useContext } from "react";
import { useTheme } from "@mui/material/styles";

// Fixed width of the Drawer
const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

// Styled MuiAppBar whose styles change on open / close
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  position: "absolute",
  zIndex: theme.zIndex.drawer + 1,
  ...(open
    ? {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }
    : {
        marginLeft: `calc(${theme.spacing(7)} + 1px)`,
        width: `calc(100% - calc(${theme.spacing(7)} + 1px))`,
        [theme.breakpoints.up("sm")]: {
          marginLeft: `calc(${theme.spacing(8)} + 1px)`,
          width: `calc(100% - calc(${theme.spacing(8)} + 1px))`,
        },
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }),
}));

// Styles for the Drawer when open
export const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create(["width", "background-color"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

// Styles for the Drawer when closed
export const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create(["width", "background-color"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

// Component which wraps main content
// Includes the Top App Bar and Drawer Navigation
export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const { theme } = useContext(ThemeContext);
  const muiTheme = useTheme();

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          open={open}
        >
          <TopAppBar className="h-24" />
        </AppBar>

        <DrawerNav toggleOpen={toggleOpen} open={open} />

        <Box component="main" sx={{ flexGrow: 1}}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
