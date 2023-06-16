"use client";

import * as React from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import HomeIcon from "@mui/icons-material/Home";
import EarthIcon from "@mui/icons-material/Public";
import FlagIcon from "@mui/icons-material/Flag";
import GroupIcon from "@mui/icons-material/Workspaces";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material";
import { openedMixin, closedMixin } from "./layout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeContext } from "../contexts/theme-context";
import { useContext } from "react";
import { useTheme } from "@mui/material/styles";

interface DrawerNavProps {
  toggleOpen: () => any;
  open: boolean;
}

// Styled MuiDrawer whose styles change on open / close
export const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
    },
  }),
}));

// Interface for a Drawer Nav List Item
interface NavItem {
  title: string;
  href?: string; // href to link to
  icon: JSX.Element;
  subitems?: NavItem[];
  isHeading?: boolean;
}

// List of Nav Items to be displayed in the Drawer
const NavItemList: NavItem[] = [
  {
    title: "Welcome",
    href: "/",
    icon: <HomeIcon />,
  },

  {
    title: "Country Profile",
    href: "/country",
    icon: <FlagIcon />,
  },
  {
    title: "Global Trends",
    href: "/aggregate-countries",
    icon: <EarthIcon />,
  },
  {
    title: "Production Groups",
    href: "/similar-countries",
    icon: <GroupIcon />,
  },
  {
    title: "Production Hierarchy",
    href: "/tree-map",
    icon: <ViewQuiltIcon />,
  },
];

export default function DrawerNav({ toggleOpen, open }: DrawerNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const path = pathname.split("/")[1];
    return path === href.split("/")[1];
  };

  const { theme } = useContext(ThemeContext);
  const muiTheme = useTheme();

  // Recursive function to render nested items
  function renderNavItems(items: NavItem[], open: boolean) {
    // Renders a Nav Item
    function ListItemComponent({
      item,
      open,
    }: {
      item: NavItem;
      open: boolean;
    }) {
      return (
        <>
          <ListItem
            disablePadding
            className={
              item.href && isActive(item.href)
                ? "bg-primary bg-opacity-30"
                : " "
            }
            sx={{
              display: "block",
            }}
            divider={item.isHeading === true}
          >
            <ListItemButton
              disableRipple
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: theme === "light" ? muiTheme.palette.vuwGreen : "",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
        </>
      );
    }

    return items.map((item, index) => (
      <React.Fragment key={index}>
        {/* 
          If the item has a href, wrap it in a Link component
        */}
        {item.href ? (
          <Link href={item.href}>
            <ListItemComponent item={item} open={open} />
          </Link>
        ) : (
          <ListItemComponent item={item} open={open} />
        )}
        {item.subitems && renderNavItems(item.subitems, open)}
      </React.Fragment>
    ));
  }

  return (
    <Drawer variant="permanent" open={open}>
      {/* Pseudo margin */}
      <div className="h-24" />
      {/* Open and Close Menu Button */}
      <ListItem
        key={"hamburger"}
        disablePadding
        sx={{
          display: "block",
        }}
      >
        <ListItemButton
          disableRipple
          onClick={toggleOpen}
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: theme === "light" ? muiTheme.palette.vuwGreen : "",
            }}
          >
            <MenuIcon />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
      <Divider className="dark:bottom-1 dark:border-b-white dark:opacity-[0.18]" />
      {/* Links */}
      <List>
        <List>{renderNavItems(NavItemList, open)}</List>
      </List>
    </Drawer>
  );
}
