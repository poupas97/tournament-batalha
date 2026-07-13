"use client";

import Detail from "@/components/Detail";
import { UserBEResponse } from "@/types/user";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewUserPage() {
  const params = useParams();
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

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Ver utilizador</h1>
      <p style={{ marginBottom: "1rem" }}>
        Veja os dados da utilizador, jogadores e staff associados.
      </p>

      {loading && <p>A carregar utilizador...</p>}

      {!loading && user && (
        <Detail<UserBEResponse>
          data={user}
          fields={[
            { key: "name", label: "Nome" },
            { key: "email", label: "Email" },
          ]}
        />
      )}

      <Link
        href="/backoffice/users"
        style={{ display: "inline-block", marginTop: "1rem" }}
      >
        Voltar
      </Link>
    </main>
  );
}
