const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const inflightRequests = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
  timeoutMs: number = 8000
): Promise<T> {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const inflight = inflightRequests.get(key);
  if (inflight) return inflight as Promise<T>;

  const promise = withTimeout(fetcher(), timeoutMs)
    .then((data) => {
      requestCache.set(key, { data, timestamp: Date.now() });
      inflightRequests.delete(key);
      return data;
    })
    .catch((err) => {
      requestCache.delete(key);
      inflightRequests.delete(key);
      throw err;
    });

  inflightRequests.set(key, promise);
  return promise;
}

export function invalidateCache(key: string): void {
  requestCache.delete(key);
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of requestCache.keys()) {
    if (key.startsWith(prefix)) {
      requestCache.delete(key);
    }
  }
}
