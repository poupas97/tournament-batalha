import PhotoAvatar from "@/components/PhotoAvatar";
import { Staff } from "@/generated/prisma";
import { IStaffFormValues } from "@/types/team";
import { Stack, Typography } from "@mui/material";

export default function StaffIdentity({
  staff,
  size = "medium",
  imageAtEnd = false,
}: {
  staff: Staff | IStaffFormValues | undefined;
  size?: "small" | "medium" | "large";
  imageAtEnd?: boolean;
}) {
  if (!staff?.name) {
    return <Typography variant="body2"> - </Typography>;
  }

  return (
    <Stack
      direction={imageAtEnd ? "row-reverse" : "row"}
      spacing={1}
      sx={{ alignItems: "center", justifyContent: "flex-start", minWidth: 0 }}
    >
      <PhotoAvatar
        photo={staff.photo}
        alt={`Foto de ${staff.name}`}
        size={{ small: 24, medium: 32, large: 40 }[size]}
        variant="rounded"
      />
      <Typography
        variant="body2"
        color="inherit"
        noWrap
        sx={{ minWidth: 0, textAlign: "left" }}
      >
        {staff.name}
      </Typography>
    </Stack>
  );
}
