"use client";

import Form from "@/components/Form";
import { IUserFormValues } from "@/types/user";
import Link from "next/link";
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
      <h1>Criar utilizador</h1>

      <Form<IUserFormValues>
        fields={[
          { key: "name", label: "Nome" },
          { key: "email", label: "Email", type: "email" },
          { key: "password", label: "Password", type: "password" },
        ]}
        onSubmit={handleSubmit}
      />

      <Link
        href="/backoffice/users"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </>
  );
}
