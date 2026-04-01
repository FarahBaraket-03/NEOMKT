export async function warmupApi(): Promise<void> {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL;

  if (!graphqlUrl) {
    return;
  }

  const healthUrl = `${graphqlUrl.replace(/\/graphql\/?$/, '')}/health`;

  try {
    await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(30_000),
      cache: 'no-store',
    });
  } catch {
    // Warmup is best-effort; ignore network/cold-start errors.
  }
}