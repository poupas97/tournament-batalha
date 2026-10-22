import PhotoAvatar from "@/components/PhotoAvatar";
import { Player } from "@/generated/prisma";
import { IPlayerFormValues } from "@/types/team";
import { Stack, Typography } from "@mui/material";

export default function PlayerIdentity({
  player,
  size = "medium",
  imageAtEnd,
  showNumber,
}: {
  player: Player | IPlayerFormValues | undefined;
  size?: "small" | "medium" | "large";
  imageAtEnd?: boolean;
  showNumber?: boolean;
}) {
  if (!player?.name) {
    return <Typography variant="body2"> - </Typography>;
  }

  return (
    <Stack
      direction={imageAtEnd ? "row-reverse" : "row"}
      spacing={1}
      sx={{ alignItems: "center", justifyContent: "flex-start", minWidth: 0 }}
    >
      <PhotoAvatar
        photo={player.photo}
        alt={`Foto de ${player.name}`}
        size={size}
      />
      <Typography
        variant="body2"
        color="inherit"
        noWrap
        sx={{ minWidth: 0, textAlign: "left" }}
      >
        {imageAtEnd
          ? `${player.name}${showNumber ? ` - ${player.number}` : ""}`
          : `${showNumber ? `${player.number} - ` : ""}${player.name}`}
      </Typography>
    </Stack>
  );
}
