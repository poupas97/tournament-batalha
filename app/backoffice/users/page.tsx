"use client";

import DataTable from "@/components/DataTable";
import Title from "@/components/Title";
import { User } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BackofficeUsersPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<User[]>("/api/backoffice/users");

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

      {!loading && data && (
        <div style={{ marginTop: "1.5rem" }}>
          <DataTable
            data={data}
            clickableRow={(it) => router.push(`/backoffice/users/${it.id}`)}
            columns={[
              { key: "name", header: "Nome" },
              { key: "email", header: "Email" },
            ]}
          />
        </div>
      )}
    </>
  );
}
