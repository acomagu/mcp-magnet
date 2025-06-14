import { z } from '@zod/mini';
import commandsJson from './commands.json';

/**
 * Interface representing a shell command with its name, command, and arguments.
 */
export interface ShellCommand {
  name: string;
  command: string;
  args: string[];
}

/**
 * The list of all shell commands used in the application.
 */
const SHELL_COMMANDS: ShellCommand[] = commandsJson;

// 全てのコマンド名を明示的に列挙してzod/miniで型定義
export const CommandNameSchema = z.enum([
  'stream_test',
  'deno_version_check',
  'deno_install_windows_winget',
  'deno_install_windows_fallback',
  'deno_install_unix',
  'node_version_check',
  'node_install_windows_winget',
  'node_install_windows_fallback',
  'node_install_macos',
  'node_install_linux',
  'python3_version_check',
  'python_version_check',
  'python_install_macos',
  'winget_version_check',
  'homebrew_version_check',
  'claude_kill_windows',
  'claude_kill_macos',
  'claude_kill_linux',
  'claude_start_windows',
  'claude_start_macos',
  'claude_start_linux'
]);

// 型定義をエクスポート
export type CommandName = z.infer<typeof CommandNameSchema>;

/**
 * Get a shell command by name.
 * @param name The name of the shell command to get
 * @returns The shell command if found, undefined otherwise
 */
export function getShellCommand(name: CommandName): ShellCommand {
  const command = SHELL_COMMANDS.find(cmd => cmd.name === name);
  if (!command) throw new Error(`Command not found: ${name}`);

  return command;
}
