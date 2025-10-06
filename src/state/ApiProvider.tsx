import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiStore } from './apiStore';
import { apiRegistry } from '../api/registry';

export function ApiProvider({ children }: PropsWithChildren): JSX.Element {
  const queryClient = useQueryClient();
  const setFreshness = useApiStore((state) => state.setFreshness);
  const registerError = useApiStore((state) => state.registerError);

  const bootstrap = useCallback(async () => {
    await Promise.all(
      apiRegistry.map(async (entry) => {
        try {
          const data = await queryClient.fetchQuery({
            queryKey: entry.queryKey,
            queryFn: entry.fetcher
          });
          setFreshness(entry.key, { updatedAt: Date.now(), ttl: entry.ttlMs });
          return data;
        } catch (error) {
          registerError(entry.key, error instanceof Error ? error.message : 'Unknown error');
        }
      })
    );
  }, [queryClient, registerError, setFreshness]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return children as JSX.Element;
}
