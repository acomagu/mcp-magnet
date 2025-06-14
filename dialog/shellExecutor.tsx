import type { CommandName, ShellCommand } from '@mcp-magnet/shell-commands';
import { useContext } from 'react';
import { createContext } from 'react';

/**
 * Interface representing the result of a shell command execution.
 */
export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

export type ShellCommandEvent =
  | {
      event: 'started';
      data: {
        command: string;
        args: string[];
      };
    }
  | {
      event: 'stdout';
      data: {
        line: string;
      };
    }
  | {
      event: 'stderr';
      data: {
        line: string;
      };
    }
  | {
      event: 'finished';
      data: {
        code: number;
      };
    }
  | {
      event: 'error';
      data: {
        message: string;
      };
    };

export interface ShellExecutorService {
  /**
   * Executes a predefined shell command by its name and returns the final result.
   * @param commandName The registered name of the command.
   * @returns A promise resolving to the command's exit code, stdout, and stderr.
   */
  execute(commandName: CommandName): Promise<CommandResult>;

  /**
   * Executes a predefined shell command by its name and streams output/events.
   * @param commandName The registered name of the command.
   * @param listener A callback function to handle streamed events (stdout, stderr, finished, error).
   * @returns A promise that resolves when the command completes or rejects on setup error.
   */
  executeWithStream(commandName: CommandName, listener: (event: ShellCommandEvent) => void): Promise<void>;

  /**
   * Gets the details of a predefined shell command.
   * @param name The name of the shell command to get
   * @returns The shell command if found, undefined otherwise
   */
  getCommandDetails(name: CommandName): ShellCommand | undefined;
}

export const ShellExecutorContext = createContext<ShellExecutorService | undefined>(undefined);

export const useShellExecutor = (): ShellExecutorService => {
  const context = useContext(ShellExecutorContext);
  if (context === undefined) {
    throw new Error('useShellExecutor must be used within a ShellExecutorProvider (ShellExecutorProvider or DemoShellExecutorProvider)');
  }
  return context;
};
