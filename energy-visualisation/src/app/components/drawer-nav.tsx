"use client";

import * as React from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import HomeIcon from "@mui/icons-material/Home";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material";
import { openedMixin, closedMixin } from "./layout";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

// Interface for a Drawer Nav List Item
interface NavItem {
  title: string;
  href: string; // href to link to
  icon: JSX.Element;
}

// List of Nav Items to be displayed in the Drawer
const NavItemList: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <HomeIcon />,
  },
];

export default function DrawerNav({ toggleOpen, open }: DrawerNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const path = pathname.split("/")[1];
    return path === href.split("/")[1];
  };

  return (
    <Drawer variant="permanent" open={open}>
      {/* Drawer Header */}
      <div className="h-24 bg-vuwGreen justify-center">
        <div className="flex  h-full items-center justify-center">
          <Image
            src="/unplugged-logo.png "
            alt="Unplugged Logo"
            width={100}
            height={100}
          />
        </div>
      </div>
      <ListItem key={"hamburger"} disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={toggleOpen}
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            className="text-vuwGreen"
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            <MenuIcon />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
      <Divider />
      <List>
        {NavItemList.map((item, index) => (
          <Link href={item.href}>
            <ListItem
              key={index}
              disablePadding
              className={isActive(item.href) ? "bg-primary bg-opacity-30" : " "}
              sx={{
                display: "block",
              }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  className="text-vuwGreen"
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
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
          </Link>
        ))}
      </List>
    </Drawer>
  );
}
