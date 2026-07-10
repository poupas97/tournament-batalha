"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function BackofficePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Dashboard do Backoffice</h1>
      <p>Aqui você poderá gerenciar clientes e produtos.</p>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        <Link href="/backoffice/users" style={{ color: "#0366d6" }}>
          Utilizadores
        </Link>
        <Link href="/backoffice/teams" style={{ color: "#0366d6" }}>
          Equipas
        </Link>
        <Link href="/backoffice/players" style={{ color: "#0366d6" }}>
          Jogadores
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/backoffice/login" })}
          style={{
            padding: "0.75rem",
            background: "#d73a49",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </main>
  );
}
