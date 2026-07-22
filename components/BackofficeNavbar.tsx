"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/backoffice", label: "Dashboard" },
  { href: "/backoffice/users", label: "Utilizadores" },
  { href: "/backoffice/competitions", label: "Competições" },
  { href: "/backoffice/teams", label: "Equipas" },
  { href: "/backoffice/matches", label: "Jogos" },
];

export default function BackofficeNavbar() {
  const pathname = usePathname();

  if (pathname === "/backoffice/login") {
    return null;
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid #d0d7de",
        background: "#ffffff",
      }}
    >
      <nav
        aria-label="Navegação do backoffice"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.85rem 2rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            flexWrap: "wrap",
          }}
        >
          {navItems.map((item) => {
            const active =
              item.href === "/backoffice"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  padding: "0.45rem 0.7rem",
                  borderRadius: "6px",
                  color: active ? "#ffffff" : "#57606a",
                  background: active ? "#0969da" : "transparent",
                  fontSize: "0.95rem",
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/backoffice/login" })}
          style={{
            padding: "0.5rem 0.75rem",
            border: "1px solid #d0d7de",
            borderRadius: "6px",
            background: "#ffffff",
            color: "#cf222e",
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Sair
        </button>
      </nav>
    </header>
  );
}
