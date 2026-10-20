import PhotoAvatar from "@/components/PhotoAvatar";
import { Team } from "@/generated/prisma";
import { TeamBEResponse } from "@/types/team";
import { Stack, Typography } from "@mui/material";

export default function TeamIdentity({
  team,
  placeholder,
  size = "medium",
  vertical = false,
}: {
  team: Team | TeamBEResponse | undefined;
  placeholder?: string;
  size?: "small" | "medium" | "large";
  vertical?: boolean;
}) {
  if (!team?.name) {
    return <Typography variant="body2">{placeholder || " - "}</Typography>;
  }

  return (
    <Stack
      direction={vertical ? "column" : "row"}
      spacing={1}
      sx={{
        alignItems: "center",
        minWidth: 0,
        width: vertical ? "100%" : undefined,
      }}
    >
      <PhotoAvatar
        photo={team.photo}
        alt={`Logo de ${team.name}`}
        size={{ small: 24, medium: 32, large: 40 }[size]}
        variant="rounded"
      />
      <Typography
        variant="body2"
        color="inherit"
        sx={{
          minWidth: 0,
          textAlign: vertical ? "center" : "left",
          overflowWrap: "anywhere",
        }}
      >
        {team.name}
      </Typography>
    </Stack>
  );
}
