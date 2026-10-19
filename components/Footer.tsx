import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        borderTop: "0.25rem solid",
        borderColor: "divider",
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body1" color="text.secondary">
        Tournament Batalha
      </Typography>
    </Box>
  );
}
