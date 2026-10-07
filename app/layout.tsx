import { ReactNode } from "react";
import "./globals.css";
import type { Metadata } from "next";
import MuiProvider from "./MuiProvider";

export const metadata: Metadata = {
  title: "Tournament Batalha",
  description: "Aplicação para gestão de torneios de futebol",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
