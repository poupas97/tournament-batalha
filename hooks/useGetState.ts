import { useEffect, useState } from "react";

export default function useGetState<T>(url: string | undefined) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!url) return;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
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

  const setData = (data: Partial<T> | ((current: T | null) => T | null)) => {
    setState((current) => ({
      ...current,
      data:
        typeof data === "function"
          ? data(current.data)
          : current.data
            ? { ...current.data, ...data }
            : null,
    }));
  };
  return { ...state, setData };
}
