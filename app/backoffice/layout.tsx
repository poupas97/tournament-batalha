import BackofficeNavbar from "@/components/BackofficeNavbar";
import ModalProvider from "@/components/ModalProvider";
import { UserRole } from "@/generated/prisma";
import { authOptions } from "@/lib/nextAuth";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";

export default async function BackofficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === UserRole.ADMIN;

  return (
    <ModalProvider>
      <BackofficeNavbar isAdmin={isAdmin} />
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
    </ModalProvider>
  );
}
