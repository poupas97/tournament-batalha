"use client";

import Form from "@/components/Form";
import Title from "@/components/Title";
import { IUserFormValues } from "@/types/user";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const router = useRouter();

  async function handleSubmit(values: IUserFormValues) {
    const response = await fetch("/api/backoffice/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    return { response, onSuccess: () => router.back() };
  }

  return (
    <>
      <Title
        label="Criar utilizador"
        description="Crie uma conta e defina as permissões de acesso"
        back
      />

      <Form<IUserFormValues>
        fields={[
          { key: "name", label: "Nome" },
          { key: "email", label: "Email", type: "email" },
          { key: "password", label: "Password", type: "password" },
          { key: "confirm", label: "Confirmar Password", type: "password" },
        ]}
        onSubmit={handleSubmit}
      />
    </>
  );
}
