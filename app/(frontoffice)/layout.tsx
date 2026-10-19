import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Stack } from "@mui/material";
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
      <Stack
        spacing={{ xs: 2, sm: 4 }}
        sx={{ padding: { xs: 2, sm: 4 }, flex: 1 }}
      >
        {children}
      </Stack>
      <Footer />
    </>
  );
}
