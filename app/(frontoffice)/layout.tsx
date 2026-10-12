import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

interface FrontOfficeLayoutProps {
  children: ReactNode;
}

export default function FrontOfficeLayout({
  children,
}: FrontOfficeLayoutProps) {
  return (
    <>
      <Navbar />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          gap: "2rem",
          flex: 1,
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
