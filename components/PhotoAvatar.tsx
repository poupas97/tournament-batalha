import ImageIcon from "@mui/icons-material/Image";
import { Avatar } from "@mui/material";
import { getPhotoPreviewSource } from "@/lib/photo";

type PhotoAvatarProps = {
  photo: string | null | undefined;
  alt: string;
  size: number;
  variant?: "circular" | "rounded";
};

export default function PhotoAvatar({
  photo,
  alt,
  size,
  variant = "circular",
}: PhotoAvatarProps) {
  const src = getPhotoPreviewSource(photo);

  return (
    <Avatar
      src={src ?? undefined}
      alt={alt}
      variant={variant}
      sx={{
        width: size,
        height: size,
        bgcolor: "action.hover",
        color: "text.secondary",
        ...(variant === "rounded" && {
          "& .MuiAvatar-img": {
            objectFit: "contain",
            bgcolor: "white",
          },
        }),
      }}
    >
      <ImageIcon sx={{ fontSize: size * 0.6 }} />
    </Avatar>
  );
}
