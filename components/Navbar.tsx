"use client";

import { useRouter, usePathname } from "next/navigation";
import { Box, Button } from "@mui/material";
import { NAVBAR_BORDER_WIDTH_PX, NAVBAR_Z_INDEX } from "@/constants/layout";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/competitions", label: "Competições" },
  { href: "/teams", label: "Equipas" },
  { href: "/matches", label: "Jogos" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: NAVBAR_Z_INDEX,
        borderBottom: `${NAVBAR_BORDER_WIDTH_PX}px solid`,
        borderBottomColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        component="nav"
        aria-label="Navegação do front office"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          gap: 1,
          width: "100%",
          px: 3,
          py: 2,
        }}
      >
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              size="small"
              onClick={() => router.push(item.href)}
              variant={active ? "contained" : "text"}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
