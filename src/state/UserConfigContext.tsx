import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import { produce } from 'immer';
import { UserConfiguration, defaultConfiguration } from '../types/config';
import { loadFromStorage, persistToStorage } from '../utils/storage';

const STORAGE_KEY = 'rs-defence-config';

type ContextValue = {
  configuration: UserConfiguration;
  updateConfig: <K extends keyof UserConfiguration>(key: K, value: UserConfiguration[K]) => void;
  reset: () => void;
  initialiseFromStorage: () => void;
};

const UserConfigContext = createContext<ContextValue | undefined>(undefined);

export function UserConfigProvider({ children }: PropsWithChildren): JSX.Element {
  const [configuration, setConfiguration] = useState<UserConfiguration>(defaultConfiguration);

  const updateConfig = useCallback(
    <K extends keyof UserConfiguration>(key: K, value: UserConfiguration[K]) => {
      setConfiguration((current) => {
        const next = produce(current, (draft) => {
          draft[key] = value;
        });
        persistToStorage(STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setConfiguration(defaultConfiguration);
    persistToStorage(STORAGE_KEY, defaultConfiguration);
  }, []);

  const initialiseFromStorage = useCallback(() => {
    const stored = loadFromStorage<UserConfiguration>(STORAGE_KEY);
    if (stored) {
      setConfiguration(stored);
    }
  }, []);

  const value = useMemo<ContextValue>(() => ({ configuration, updateConfig, reset, initialiseFromStorage }), [
    configuration,
    updateConfig,
    reset,
    initialiseFromStorage
  ]);

  return <UserConfigContext.Provider value={value}>{children}</UserConfigContext.Provider>;
}

export function useUserConfig(): ContextValue {
  const ctx = useContext(UserConfigContext);
  if (!ctx) {
    throw new Error('useUserConfig must be used within a UserConfigProvider');
  }
  return ctx;
}
