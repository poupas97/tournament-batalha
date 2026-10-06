"use client";

import Detail from "@/components/Detail";
import Title from "@/components/Title";
import { AuditLog } from "@/generated/prisma";
import useGetState from "@/hooks/useGetState";
import { useParams } from "next/navigation";

export default function ViewAuditLogPage() {
  const params = useParams();
  const auditLogId = params?.id;

  const { data, loading, error } = useGetState<AuditLog>(
    auditLogId ? `/api/backoffice/audit-log/${auditLogId}` : undefined,
  );

  return (
    <>
      <Title
        label="Ver logs de auditoria"
        description="Consulte os logs de auditoria"
        back
      />

      <Detail<AuditLog>
        loading={loading}
        error={error}
        data={data}
        fields={[
          { key: "actor.id", label: "ID do Actor" },
          { key: "actor.name", label: "Actor" },
          { key: "action", label: "Ação" },
          { key: "entity", label: "Entidade" },
          { key: "entityId", label: "ID da Entidade" },
          { key: "metadata", label: "Metadata", format: "json" },
          { key: "createdAt", label: "Data", format: "date" },
        ]}
      />
    </>
  );
}
