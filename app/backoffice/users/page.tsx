"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import { User } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import { useRouter } from "next/navigation";

export default function BackofficeUsersPage() {
  const router = useRouter();

  const { data, loading, error } = useGetState<User[]>("/api/backoffice/users");

  return (
    <>
      <Title label="Utilizadores" />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        create="/backoffice/users/create"
        clickableRow={(it) => router.push(`/backoffice/users/${it.id}`)}
        columns={[
          { key: "name", header: "Nome" },
          { key: "email", header: "Email" },
          { key: "role", header: "Função" },
        ]}
      />
    </>
  );
}
