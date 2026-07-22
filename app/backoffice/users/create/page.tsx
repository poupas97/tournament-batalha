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

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao criar utilizador." }));
      alert(error.error ?? "Erro ao criar utilizador.");
      return;
    }

    router.push("/backoffice/users");
  }

  return (
    <>
      <Title label="Criar utilizador" back />

      <Form<IUserFormValues>
        fields={[
          { key: "name", label: "Nome" },
          { key: "email", label: "Email", type: "email" },
          { key: "password", label: "Password", type: "password" },
        ]}
        onSubmit={handleSubmit}
      />
    </>
  );
}
