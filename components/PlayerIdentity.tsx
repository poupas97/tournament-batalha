import PhotoAvatar from "@/components/PhotoAvatar";
import { Player } from "@/generated/prisma";
import { IPlayerFormValues } from "@/types/team";
import { Stack, Typography } from "@mui/material";

export default function PlayerIdentity({
  player,
  size = "medium",
  imageAtEnd = false,
}: {
  player: Player | IPlayerFormValues | undefined;
  size?: "small" | "medium" | "large";
  imageAtEnd?: boolean;
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
        size={{ small: 24, medium: 32, large: 40 }[size]}
        variant="rounded"
      />
      <Typography
        variant="body2"
        color="inherit"
        noWrap
        sx={{ minWidth: 0, textAlign: "left" }}
      >
        {imageAtEnd
          ? `${player.name} - ${player.number}`
          : `${player.number} - ${player.name}`}
      </Typography>
    </Stack>
  );
}
