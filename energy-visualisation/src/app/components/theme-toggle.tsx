"use client";

import React, { useContext } from "react";
import { ThemeContext } from "../contexts/theme-context";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "@mui/material/styles";

export default function ThemeToggle() {
  const muiTheme = useTheme();

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <IconButton onClick={toggleTheme} sx={{ color: muiTheme.palette.vuwGreen }}>
      {theme === "light" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}
