import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Frontoffice</h1>
      <p>Bem-vindo ao frontoffice. Esta é a página principal pública.</p>
      <nav style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <Link href="/teams" style={{ color: "#0366d6" }}>
          Equipas
        </Link>
      </nav>
    </>
  );
}
