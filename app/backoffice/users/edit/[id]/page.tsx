"use client";

import Form from "@/components/Form";
import Title from "@/components/Title";
import {
  IUserFormValues,
  IUserPasswordFormValues,
  UserBEResponse,
} from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;
  const [user, setUser] = useState<UserBEResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/backoffice/users/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setUser(data);
      })
      .catch(() => {
        alert("Erro ao carregar a utilizador.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

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

      {!loading && user && (
        <>
          <Form<IUserFormValues>
            initialValues={user}
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
