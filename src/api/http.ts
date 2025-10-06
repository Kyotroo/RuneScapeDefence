const cache = new Map<string, { timestamp: number; data: unknown }>();

export async function httpGet<T>(url: string, ttlMs = 30 * 60 * 1000): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const json = (await response.json()) as T;
    cache.set(url, { timestamp: Date.now(), data: json });
    return json;
  } finally {
    clearTimeout(timeout);
  }
}
