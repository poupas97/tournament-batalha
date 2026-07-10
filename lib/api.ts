import { RouteContext } from "@/types/api";

export function getParamId(context: RouteContext) {
  const id = Number(context.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}
