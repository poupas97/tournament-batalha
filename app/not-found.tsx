"use client";

import { useRouter } from "next/navigation";
import { Button, Container, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Container
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="h2">404</Typography>

        <Typography variant="h5">Página não encontrada</Typography>

        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Voltar
        </Button>
      </Stack>
    </Container>
  );
}
