"use client";

import GridTable from "@/components/GridTable";
import Title from "@/components/Title";
import { AuditLog } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";

export default function BackofficeAuditLogPage() {
  const { data, loading, error } = useGetState<AuditLog[]>(
    "/api/backoffice/audit-log",
  );

  return (
    <>
      <Title
        label="Logs de Auditoria"
        description="Consulte os logs de auditoria"
      />

      <GridTable
        loading={loading}
        error={error}
        data={data}
        href={(it) => `/backoffice/audit-log/${it.id}`}
        columns={[
          { key: "id", header: "ID" },
          { key: "action", header: "Ação" },
          { key: "entity", header: "Entidade" },
          { key: "entityId", header: "ID da Entidade" },
          { key: "createdAt", header: "Data", format: "date" },
        ]}
      />
    </>
  );
}
