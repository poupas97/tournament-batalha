import ModalProvider from "@/components/ModalProvider";
import { ReactNode } from "react";

export default function BackofficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ModalProvider>{children}</ModalProvider>;
}
