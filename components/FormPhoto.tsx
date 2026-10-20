"use client";

import ImageIcon from "@mui/icons-material/Image";
import { Avatar, Button, Stack } from "@mui/material";
import { type ChangeEvent, useEffect, useState } from "react";
import {
  arrayBufferToBase64,
  getPhotoPreviewSource,
  isPhotoMimeType,
  MAX_PHOTO_BYTES,
  resizeImage,
} from "@/lib/photo";

type FormPhotoProps = {
  label: string;
  value?: string | null;
  onChange: (photo: string | null) => void;
};

export default function FormPhoto({ label, value, onChange }: FormPhotoProps) {
  const [preview, setPreview] = useState(() => getPhotoPreviewSource(value));

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isPhotoMimeType(file.type)) {
      alert("Escolha uma imagem JPEG, PNG ou WebP");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      alert("A imagem deve ter no máximo 5 MB");
      return;
    }

    try {
      const resizedImage = await resizeImage(file);
      const buffer = await resizedImage.arrayBuffer();
      setPreview(URL.createObjectURL(resizedImage));
      onChange(arrayBufferToBase64(buffer));
    } catch {
      alert("Não foi possível processar a imagem escolhida");
    }
  }

  return (
    <Stack direction="row" spacing={4} sx={{ display: "flex" }}>
      {preview ? (
        <img
          src={preview}
          alt={`Pré-visualização: ${label}`}
          width={100}
          height={100}
          style={{ objectFit: "cover", borderRadius: "50%" }}
        />
      ) : (
        <Avatar
          role="img"
          aria-label={`Sem foto: ${label}`}
          sx={{
            width: 100,
            height: 100,
            bgcolor: "action.hover",
            color: "text.secondary",
          }}
        >
          <ImageIcon sx={{ fontSize: 56 }} />
        </Avatar>
      )}
      <Stack
        spacing={1}
        sx={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Button component="label" variant="outlined">
          {preview ? "Alterar" : "Adicionar"}
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </Button>
        {preview && (
          <Button
            type="button"
            color="error"
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
          >
            Remover
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
