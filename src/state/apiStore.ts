import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FreshnessMetadata } from '../types/api';

type ApiSlice = {
  freshness: Record<string, FreshnessMetadata | null>;
  setFreshness: (key: string, meta: FreshnessMetadata | null) => void;
  registerError: (key: string, message: string) => void;
  errors: Record<string, string | null>;
};

export const useApiStore = create<ApiSlice>()(
  persist(
    (set) => ({
      freshness: {},
      errors: {},
      setFreshness: (key, meta) =>
        set((state) => ({
          freshness: { ...state.freshness, [key]: meta },
          errors: { ...state.errors, [key]: null }
        })),
      registerError: (key, message) =>
        set((state) => ({
          errors: { ...state.errors, [key]: message }
        }))
    }),
    {
      name: 'api-metadata',
      partialize: (state) => ({ freshness: state.freshness })
    }
  )
);
