"use client";

import { useRouter, usePathname } from "next/navigation";
import { Box, Button } from "@mui/material";

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
        zIndex: 20,
        borderBottom: "1px solid #d0d7de",
        bgcolor: "background.paper",
      }}
    >
      <Box
        component="nav"
        aria-label="Navegação do front office"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
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
    </Box>
  );
}
