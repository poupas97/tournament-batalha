"use client";

import Detail from "@/components/Detail";
import Title from "@/components/Title";
import useGetState from "@/hooks/useGetState";
import { UserBEResponse } from "@/types/user";
import { useParams } from "next/navigation";

export default function ViewUserPage() {
  const params = useParams();
  const userId = params?.id;

  const { data, loading, error } = useGetState<UserBEResponse>(
    userId ? `/api/backoffice/users/${userId}` : undefined,
  );

  return (
    <>
      <Title
        label="Ver utilizador"
        back
        edit={`/backoffice/users/${userId}/edit`}
      />

      <Detail<UserBEResponse>
        loading={loading}
        error={error}
        data={data}
        fields={[
          { key: "name", label: "Nome" },
          { key: "email", label: "Email" },
          { key: "role", label: "Função" },
        ]}
      />
    </>
  );
}
