import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Gestão",
  description: "Base de projeto de gestão com backoffice e frontoffice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
