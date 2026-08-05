"use client";

import Form from "@/components/Form";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import {
  IUserFormValues,
  IUserPasswordFormValues,
  UserBEResponse,
} from "@/types/user";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const { data, loading, error } = useGetState<UserBEResponse>(
    userId ? `/api/backoffice/users/${userId}` : undefined,
  );

  async function handleSubmit(values: IUserFormValues) {
    const response = await fetch(`/api/backoffice/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar utilizador." }));
      alert(error.error ?? "Erro ao guardar utilizador.");
      return;
    }

    router.push("/backoffice/users");
  }

  async function handleSubmitPassword(values: IUserPasswordFormValues) {
    if (values.password !== values.confirm) {
      alert("A nova password e a confirmação não coincidem.");
      return;
    }

    const response = await fetch(`/api/backoffice/users/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erro ao guardar password." }));
      alert(error.error ?? "Erro ao guardar password.");
      return;
    }

    router.push("/backoffice/users");
  }

  return (
    <>
      <Title label="Editar utilizador" back />

      {loading && <p>A carregar utilizador...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && data && (
        <>
          <Form<IUserFormValues>
            initialValues={data}
            fields={[
              { key: "name", label: "Nome" },
              { key: "email", label: "Email", type: "email" },
            ]}
            onSubmit={handleSubmit}
          />

          <h3>Password</h3>
          <Form<IUserPasswordFormValues>
            fields={[
              { key: "actual", label: "Atual", type: "password" },
              { key: "password", label: "Nova", type: "password" },
              { key: "confirm", label: "Confirmar", type: "password" },
            ]}
            onSubmit={handleSubmitPassword}
          />
        </>
      )}
    </>
  );
}
