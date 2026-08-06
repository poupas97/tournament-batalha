import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

export default function useGetState<T>(url: string | undefined) {
  const [state, setState] = useState<{
    data: T | undefined;
    loading: boolean;
    error: string | undefined;
    notFound: boolean;
  }>({ data: undefined, loading: true, error: undefined, notFound: false });

  useEffect(() => {
    if (!url) return;

    fetch(url)
      .then((response) => {
        if (response.status === 404) {
          setState((current) => ({ ...current, notFound: true }));
        }

        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error ?? "Erro desconhecido.");
        }

        setState((current) => ({ ...current, data, loading: false }));
      })
      .catch((err) =>
        setState((current) => ({
          ...current,
          error: err instanceof Error ? err.message : "Erro desconhecido.",
          loading: false,
        })),
      )
      .finally(() => setState((current) => ({ ...current, loading: false })));
  }, [url]);

  const setData = (
    data: Partial<T> | ((current: T | undefined) => T | undefined),
  ) => {
    setState((current) => ({
      ...current,
      data:
        typeof data === "function"
          ? data(current.data)
          : current.data
            ? { ...current.data, ...data }
            : undefined,
    }));
  };

  if (state.notFound) {
    return notFound();
  }

  return { ...state, setData };
}
