import { useEffect, useState } from "react";
import { APP_NAME } from "@family-hub/shared";

type Health = { status: string; db: string };

export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/v1/health")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return (await response.json()) as Health;
      })
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "erreur inconnue");
      });
  }, []);

  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>Arbre généalogique familial — jalon M0 (fondations).</p>
      {health ? (
        <p>
          API : {health.status}, base : {health.db}
        </p>
      ) : error ? (
        <p>API injoignable ({error}). Lancez docker compose up.</p>
      ) : (
        <p>Vérification de l&apos;API…</p>
      )}
    </main>
  );
}
