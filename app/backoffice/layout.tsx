import BackofficeNavbar from "@/components/BackofficeNavbar";
import ModalProvider from "@/components/ModalProvider";
import { ReactNode } from "react";

export default function BackofficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ModalProvider>
      <BackofficeNavbar />
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </main>
    </ModalProvider>
  );
}
