"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Box, Button } from "@mui/material";
import { NAVBAR_BORDER_WIDTH_PX, NAVBAR_Z_INDEX } from "@/constants/layout";
import Link from "next/link";

const navItems = [
  { href: "/backoffice", label: "Dashboard" },
  { href: "/backoffice/competitions", label: "Competições" },
  { href: "/backoffice/teams", label: "Equipas" },
  { href: "/backoffice/matches", label: "Jogos" },
  { href: "/backoffice/help", label: "Ajuda" },
  { href: "/backoffice/users", label: "Utilizadores", adminOnly: true },
  { href: "/backoffice/audit-log", label: "Auditoria", adminOnly: true },
];

type BackofficeNavbarProps = {
  isAdmin: boolean;
};

export default function BackofficeNavbar({ isAdmin }: BackofficeNavbarProps) {
  const pathname = usePathname();

  if (pathname === "/backoffice/login") {
    return null;
  }

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
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        px: 3,
        py: 2,
      }}
    >
      <Box
        component="nav"
        aria-label="Navegação do backoffice"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          flex: 1,
          minWidth: 0,
        }}
      >
        {navItems
          .filter((item) => isAdmin || !item.adminOnly)
          .map((item) => {
            const active =
              item.href === "/backoffice"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                size="small"
                variant={active ? "contained" : "text"}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Button>
            );
          })}
      </Box>

      <Button
        onClick={() => signOut({ callbackUrl: "/backoffice/login" })}
        color="error"
        variant="contained"
        size="small"
      >
        Sair
      </Button>
    </Box>
  );
}
