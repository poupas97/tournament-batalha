import { Box } from "@mui/material";

type ColorSwatchProps = {
  color: string;
};

export default function ColorSwatch({ color }: ColorSwatchProps) {
  return (
    <Box
      component="span"
      aria-label={`Cor ${color}`}
      sx={{
        display: "flex",
        width: 60,
        height: 20,
        flexShrink: 0,
        borderRadius: 1,
        backgroundColor: color,
        border: "0.05rem solid",
        borderColor: "divider",
      }}
    />
  );
}
