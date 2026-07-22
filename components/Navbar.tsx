"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/competitions", label: "Competições" },
  { href: "/teams", label: "Equipas" },
  { href: "/matches", label: "Jogos" },
];

export default function Navbar() {
  const pathname = usePathname();

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
              item.href === "/"
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
      </nav>
    </header>
  );
}
