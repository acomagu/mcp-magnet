import React, { type ReactNode } from 'react';
import { type CommandResult, ShellCommandEvent, ShellExecutorContext, ShellExecutorService } from '@mcp-magnet/dialog';
import { invoke, Channel } from '@tauri-apps/api/core';
import { ShellCommand, getShellCommand as getLocalShellCommand, CommandName, CommandNameSchema } from '@mcp-magnet/shell-commands';

class TauriShellExecutorService implements ShellExecutorService {
  async execute(commandName: CommandName): Promise<CommandResult> {
    try {
        CommandNameSchema.parse(commandName); // Validate command name
        return await invoke<CommandResult>('execute_shell_command', { name: commandName });
    } catch (error) {
        console.error(`[TauriShell] Error executing command '${commandName}':`, error);
        throw error;
    }
  }

  async executeWithStream(commandName: CommandName, listener: (event: ShellCommandEvent) => void): Promise<void> {
    try {
        CommandNameSchema.parse(commandName); // Validate command name
        const channel = new Channel<ShellCommandEvent>((message) => {
            listener(message);
        });
        await invoke('execute_shell_command_with_channel', {
            name: commandName,
            onEvent: channel,
        });
    } catch (error) {
        console.error(`[TauriShell] Error setting up stream for command '${commandName}':`, error);
        listener({ event: 'error', data: { message: `Failed to set up stream: ${error}` } });
        throw error;
    }
  }

  getCommandDetails(name: CommandName): ShellCommand | undefined {
    return getLocalShellCommand(name);
  }
}

const tauriShellService = new TauriShellExecutorService();
export const ShellExecutorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ShellExecutorContext.Provider value={tauriShellService}>
      {children}
    </ShellExecutorContext.Provider>
  );
};
