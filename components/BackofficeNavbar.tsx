"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@heroui/react";

const navItems = [
  { href: "/backoffice", label: "Dashboard" },
  { href: "/backoffice/users", label: "Utilizadores", adminOnly: true },
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
    <header className="sticky top-0 z-20 border-b border-border bg-white">
      <nav
        aria-label="Navegação do backoffice"
        className="flex items-center justify-between gap-4 px-6 py-4"
      >
        <div className="flex items-center gap-2 flex-wrap">
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
                  size="sm"
                  onPress={() => router.push(item.href)}
                  className={`px-3 py-2 ${active ? "bg-hero-primary text-white" : "text-muted bg-transparent"}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Button>
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
