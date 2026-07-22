"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import { User } from "@/generated/prisma";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BackofficeUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/backoffice/users")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setUsers(data);
      })
      .catch(() => {
        setError("Erro ao carregar utilizadores.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Title label="Utilizadores" />

      <div>
        <Link
          href="/backoffice/users/create"
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
          }}
        >
          Adicionar utilizador
        </Link>
      </div>

      {loading && <p>A carregar utilizadores...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={users}
            columns={[
              { key: "name", header: "Nome" },
              { key: "email", header: "Email" },
              {
                key: "actions",
                header: "Ações",
                render: (team) => (
                  <>
                    <Link
                      href={`/backoffice/users/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/backoffice/users/edit/${team.id}`}
                      style={{ color: "#2563eb" }}
                    >
                      Editar
                    </Link>
                  </>
                ),
              },
            ]}
          />
        </div>
      )}
    </>
  );
}
