import { type CommandName } from '@mcp-magnet/shell-commands';
import type { Platform } from '../platform';
import type { PermissionInfo, Runtime } from '../runtime/runtime';
import { isWingetInstalled } from '../runtime/utils';
import type { ShellExecutorService } from '../shellExecutor';

/**
 * Deno specific permission information
 */
export interface DenoPermissionInfo extends PermissionInfo {
  description: string;
}

export class DenoRuntime implements Runtime {
  readonly name = 'Deno';
  readonly description = 'A secure JavaScript and TypeScript runtime';
  readonly commands = ['deno'];
  readonly installInstructionUrl = 'https://deno.land/#installation';
  readonly autoInstallSupportedPlatforms: readonly Platform[] = ['windows', 'macos', 'linux'];

  // Store dependencies provided during instantiation
  private platform: Platform;
  private shellExecutor: ShellExecutorService;
  private isInstalledPromise: Promise<boolean> | undefined;

  constructor(platform: Platform, shellExecutor: ShellExecutorService) {
    this.platform = platform;
    this.shellExecutor = shellExecutor;
  }

  isInstalled(): Promise<boolean> { // must be cached
    if (this.isInstalledPromise) {
      return this.isInstalledPromise;
    }

    this.isInstalledPromise = (async () => {
      console.log('START checking Deno installation');
      try {
        const output = await this.shellExecutor.execute('deno_version_check');
        return output.code === 0;
      } catch (error) {
        console.error('Error checking Deno installation:', error);
        return false;
      }
    })();
    return this.isInstalledPromise;
  }

  async installCommand(): Promise<CommandName | undefined> {
    if (this.platform === 'windows') {
      const hasWinget = await isWingetInstalled(this.shellExecutor);
      return hasWinget ? 'deno_install_windows_winget' : 'deno_install_windows_fallback';
    }

    return 'deno_install_unix';
  }

  /**
   * Extract the CLI flags that appear *before* the first positional argument (= script path/URL).
   * This mirrors Deno CLI behaviour: once the first non-flag token is seen, all remaining tokens
   * are forwarded to the script via `Deno.args` and must not be treated as permission flags.
   */
  private static extractCliFlags(args: string[]): string[] {
    const boundary = args.findIndex((arg) => !arg.startsWith('-'));
    return boundary === -1 ? args : args.slice(0, boundary);
  }

  /**
   * Generates Deno permission information based on arguments.
   * @param args Arguments passed to the "deno run" command, *excluding* the sub-command itself.
   */
  getPermissionInfo(args: string[]): DenoPermissionInfo | undefined {
    console.log('Generating Deno permissions:', args);

    // 1. isolate CLI flags only (before script name)
    const cliFlags = DenoRuntime.extractCliFlags(args);

    // 2. detect --allow-all / -A first because it overrides everything
    const allowAll = cliFlags.some((arg) => arg === '-A' || arg === '--allow-all');
    if (allowAll) {
      return {
        title: 'Deno Permissions',
        permissions: ['🛑 すべての権限を許可 (-A)'],
        allowAll: true,
        description:
          '警告: すべての権限が付与されます。ファイルシステム、ネットワーク、環境変数など、あらゆるシステムリソースにアクセス可能です。',
      };
    }

    // 3. regex helpers
    const allowRe = /^--allow-([a-z]+)(=(.+))?$/;

    const permissions: string[] = [];

    cliFlags.forEach((arg) => {
      const m = allowRe.exec(arg);
      if (!m) return; // ignore non-permission flags (e.g. --watch)

      const permType = m[1];
      const scopeString = m[3]; // may be undefined
      const scopes = scopeString ? scopeString.split(',') : [undefined];

      scopes.forEach((scope) => {
        switch (permType) {
          case 'read':
            permissions.push(scope ? `📂 ファイル読み取り: ${scope}` : '📂 ファイル読み取り');
            break;
          case 'write':
            permissions.push(scope ? `💾 ファイル書き込み: ${scope}` : '💾 ファイル書き込み');
            break;
          case 'net':
            permissions.push(scope ? `🌐 ネットワーク: ${scope}` : '🌐 ネットワーク');
            break;
          case 'env':
            permissions.push(scope ? `⚙️ 環境変数: ${scope}` : '⚙️ 環境変数');
            break;
          case 'run':
            permissions.push(scope ? `▶️ サブプロセス実行: ${scope}` : '▶️ サブプロセス実行');
            break;
          case 'ffi':
            permissions.push(scope ? `🔌 外部ライブラリ: ${scope}` : '🔌 外部ライブラリ');
            break;
          case 'hrtime':
            permissions.push('⏱️ 高精度タイマー');
            break;
          case 'sys':
            permissions.push(scope ? `💻 システム情報: ${scope}` : '💻 システム情報');
            break;
          default:
            permissions.push(`🔒 ${permType}${scope ? `=${scope}` : ''}`);
        }
      });
    });

    return {
      title: 'Deno Permissions',
      permissions: permissions.length > 0 ? permissions : ['🔒 Default (No specific permissions requested)'],
      allowAll: false,
      description: 'Permissions requested by the Deno script.',
    };
  }
}
