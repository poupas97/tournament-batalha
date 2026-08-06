"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/backoffice", label: "Dashboard", adminOnly: false },
  { href: "/backoffice/users", label: "Utilizadores", adminOnly: true },
  { href: "/backoffice/competitions", label: "Competições", adminOnly: false },
  { href: "/backoffice/teams", label: "Equipas", adminOnly: false },
  { href: "/backoffice/matches", label: "Jogos", adminOnly: false },
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
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "0.05rem solid #d0d7de",
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
          padding: "1rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
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
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    color: active ? "#ffffff" : "#57606a",
                    background: active ? "#0969da" : "transparent",
                    textDecoration: "none",
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
            padding: "0.75rem",
            border: "0.05rem solid #d0d7de",
            borderRadius: "0.5rem",
            background: "#ffffff",
            color: "#cf222e",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </nav>
    </header>
  );
}
