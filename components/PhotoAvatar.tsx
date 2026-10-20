import ImageIcon from "@mui/icons-material/Image";
import { Avatar } from "@mui/material";
import { getPhotoPreviewSource } from "@/lib/photo";

type PhotoAvatarProps = {
  photo: string | null | undefined;
  alt: string;
  size: number;
};

export default function PhotoAvatar({ photo, alt, size }: PhotoAvatarProps) {
  const src = getPhotoPreviewSource(photo);

  return (
    <Avatar
      src={src ?? undefined}
      alt={alt}
      sx={{
        width: size,
        height: size,
        bgcolor: "action.hover",
        color: "text.secondary",
      }}
    >
      <ImageIcon sx={{ fontSize: size * 0.6 }} />
    </Avatar>
  );
}
