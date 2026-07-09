import { BackofficeModalProvider } from "@/components/BackofficeModalProvider";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BackofficeModalProvider>{children}</BackofficeModalProvider>;
}
