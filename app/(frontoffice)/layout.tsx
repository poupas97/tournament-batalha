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
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          gap: "2rem",
        }}
      >
        {children}
      </main>
    </>
  );
}
