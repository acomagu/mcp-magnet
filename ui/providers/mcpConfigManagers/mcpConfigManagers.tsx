import type { ShellExecutorService } from '@mcp-magnet/dialog';
import { type MCPConfigManager, MCPConfigManagerContext, useShellExecutor } from '@mcp-magnet/dialog';
import * as path from '@tauri-apps/api/path';
import React, { type ReactNode, use } from 'react';
import { ClaudeCodeMCPConfigManager } from './claudeCode';
import { ClaudeDesktopMCPConfigManager } from './claudeDesktop';
import { CursorMCPConfigManager } from './cursor';

// Cache the promise for real managers
let realManagersPromise: Promise<MCPConfigManager[]> | undefined;

// Renamed from TauriMCPConfigManagerProvider
export const MCPConfigManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get the shell executor from context
  const shellExecutor = useShellExecutor();

  // Create the promise if it doesn't exist yet
  if (!realManagersPromise) {
    realManagersPromise = getMCPConfigManagers(shellExecutor);
  }

  // Use the 'use' hook to suspend until the promise resolves
  const managers = use(realManagersPromise);

  return (
    <MCPConfigManagerContext.Provider value={managers}>
      {children}
    </MCPConfigManagerContext.Provider>
  );
};

/**
 * MCP設定マネージャーのインスタンスを取得
 * @param shellExecutor Service instance to execute shell commands
 */
async function getMCPConfigManagers(shellExecutor: ShellExecutorService): Promise<MCPConfigManager[]> {
  const homeDir = await path.homeDir();

  return [
    new ClaudeDesktopMCPConfigManager(homeDir, shellExecutor),
    new CursorMCPConfigManager(homeDir),
    new ClaudeCodeMCPConfigManager(homeDir),
  ];
}
