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
      {children}
    </ModalProvider>
  );
}
