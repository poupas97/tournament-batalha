import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function FrontOfficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </main>
    </>
  );
}
