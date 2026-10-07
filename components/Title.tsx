"use client";

import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, IconButton, Typography } from "@mui/material";

type TitleProps = {
  label: string;
  description?: string;
  back?: boolean;
  edit?: string;
};

export default function Title({ label, description, back, edit }: TitleProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {back && (
          <IconButton size="small" onClick={router.back} aria-label="Voltar">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}

        <Box>
          <Typography variant="h4">{label}</Typography>
          {description && (
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>

      {edit ? (
        <Button
          size="small"
          variant="outlined"
          onClick={() => router.push(edit)}
        >
          Editar
        </Button>
      ) : (
        <Box sx={{ minWidth: 6 }} />
      )}
    </Box>
  );
}
