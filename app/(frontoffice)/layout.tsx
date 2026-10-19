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
      <main>{children}</main>
      <Footer />
    </>
  );
}
