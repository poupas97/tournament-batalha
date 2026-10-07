"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Box, Button } from "@mui/material";

const navItems = [
  { href: "/backoffice", label: "Dashboard" },
  { href: "/backoffice/users", label: "Utilizadores", adminOnly: true },
  { href: "/backoffice/audit-log", label: "Auditoria", adminOnly: true },
  { href: "/backoffice/competitions", label: "Competições" },
  { href: "/backoffice/teams", label: "Equipas" },
  { href: "/backoffice/matches", label: "Jogos" },
];

type BackofficeNavbarProps = {
  isAdmin: boolean;
};

export default function BackofficeNavbar({ isAdmin }: BackofficeNavbarProps) {
  const router = useRouter();
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
        zIndex: 20,
        borderBottom: "1px solid #d0d7de",
        bgcolor: "background.paper",
      }}
    >
      <Box
        component="nav"
        aria-label="Navegação do backoffice"
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

        <Button
          onClick={() => signOut({ callbackUrl: "/backoffice/login" })}
          color="error"
          variant="contained"
          size="small"
        >
          Sair
        </Button>
      </Box>
    </Box>
  );
}
