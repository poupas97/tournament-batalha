"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@heroui/react";

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
    <header className="sticky top-0 z-20 border-b border-border bg-white">
      <nav
        aria-label="Navegação do front office"
        className="flex items-center justify-between gap-4 px-6 py-4"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => {
            const active =
              item.href === "/"
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
      </nav>
    </header>
  );
}
