"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import { MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {[
          {
            name: "Create Code",
            href: "/admin/create-code",
            icon: <AddIcon />,
          },
          {
            name: "User Codes",
            href: "/admin/user-codes",
            icon: <ListIcon />,
          },
          {
            name: "Manage Chains",
            href: "/admin/chains",
            icon: <ListIcon />,
          },
          {
            name: "Manage Knowledge Bases",
            href: "/admin/knowledge-bases",
            icon: <ListIcon />,
          },
          {
            name: "Manage LLM Providers",
            href: "/admin/llm-providers",
            icon: <ListIcon />,
          },
        ].map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton
              onClick={() => {
                router.push(link.href);
              }}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>
            <Button color="inherit" onClick={() => router.replace("/")}>
              Go Back Home
            </Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
