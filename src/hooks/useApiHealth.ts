import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRegistry } from '../api/registry';
import { useApiStore } from '../state/apiStore';

export function useApiHealth() {
  const queryClient = useQueryClient();
  const setFreshness = useApiStore((state) => state.setFreshness);
  const registerError = useApiStore((state) => state.registerError);

  const checkApis = useCallback(async () => {
    await Promise.all(
      apiRegistry.map(async (entry) => {
        try {
          await queryClient.fetchQuery({ queryKey: entry.queryKey, queryFn: entry.fetcher });
          setFreshness(entry.key, { updatedAt: Date.now(), ttl: entry.ttlMs });
        } catch (error) {
          registerError(entry.key, error instanceof Error ? error.message : 'Unknown error');
        }
      })
    );
  }, [queryClient, registerError, setFreshness]);

  return { checkApis };
}
