import ImageIcon from "@mui/icons-material/Image";
import { Avatar } from "@mui/material";
import { getPhotoPreviewSource } from "@/lib/photo";

type PhotoAvatarProps = {
  photo: string | null | undefined;
  alt: string;
  size?: "small" | "medium" | "large";
};

const sizes = {
  small: 24,
  medium: 32,
  large: 48,
} as const;

export default function PhotoAvatar({
  photo,
  alt,
  size = "medium",
}: PhotoAvatarProps) {
  const src = getPhotoPreviewSource(photo);
  const dimension = sizes[size];

  return (
    <Avatar
      src={src ?? undefined}
      alt={alt}
      variant="circular"
      sx={{
        width: dimension,
        height: dimension,
        bgcolor: "action.hover",
        color: "text.secondary",
      }}
    >
      <ImageIcon sx={{ fontSize: dimension * 0.6 }} />
    </Avatar>
  );
}
