import type { CommandName } from '@mcp-magnet/shell-commands';
import { createContext } from 'react';
import { usePlatform, type Platform } from '../platform';
import { createKnownRuntimes } from '../runtimes';
import { useShellExecutor } from '../shellExecutor';

/**
 * Generic interface for permission information across different runtimes
 */
export interface PermissionInfo {
  title: string;
  permissions: string[];
  allowAll: boolean; // Flag indicating if all permissions are granted
}

export interface Runtime {
  isInstalled(): Promise<boolean>;
  installCommand?(): Promise<CommandName | undefined>;
  readonly installInstructionUrl: string;
  readonly autoInstallSupportedPlatforms: readonly Platform[];
  readonly name: string;
  readonly description: string;
  readonly commands: string[];

  // Optional method to get permission information from command arguments
  getPermissionInfo?(args: string[]): PermissionInfo | undefined;
}

export const RuntimesContext = createContext<Runtime[] | undefined>(undefined);

export function useRuntimes(): Runtime[] {
  // const runtimes = useContext(RuntimesContext);
  // if (!runtimes) throw new Error('useRuntime must be used within a RuntimeProvider');
  // return runtimes
  const platform = usePlatform();
  const shellExecutor = useShellExecutor();
  return createKnownRuntimes(platform, shellExecutor);
}
