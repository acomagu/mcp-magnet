import { ShellExecutorContext } from '@mcp-magnet/dialog';
import React, { type ReactNode, useMemo, useSyncExternalStore } from 'react';
import { DemoShellExecutorService } from './demoService';
import type { RuntimeInstallationState } from './mockResults';

let runtimeInstallationState: RuntimeInstallationState = {
  deno: true,
  node: true,
  python: true,
};

const listeners = new Set<() => void>();

export function useRuntimeInstallation() {
  const state = useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => runtimeInstallationState,
    () => runtimeInstallationState,
  );

  const setState = (updater: (prev: RuntimeInstallationState) => RuntimeInstallationState) => {
    runtimeInstallationState = updater(runtimeInstallationState)
    listeners.forEach((l) => l());
  };

  return [state, setState] as const;
}

// Provider component
export const DemoShellExecutorProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [runtimeState] = useRuntimeInstallation();
  const shellExecutor = useMemo(() => new DemoShellExecutorService(runtimeState), [runtimeState]);

  return (
    <ShellExecutorContext.Provider value={shellExecutor}>
      {children}
    </ShellExecutorContext.Provider>
  );
};
