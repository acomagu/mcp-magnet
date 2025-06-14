import type { Platform, ShellExecutorService } from '@mcp-magnet/dialog';
import { PermissionInfo, Runtime, isWingetInstalled } from '@mcp-magnet/dialog/runtime';
import { type CommandName } from '@mcp-magnet/shell-commands';

/**
 * Deno specific permission information
 */
interface DenoPermissionInfo extends PermissionInfo {
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
      console.log('START2 checking Deno installation');
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
    // Use the platform stored during construction
    if (this.platform === 'windows') {
      // wingetが利用可能かチェック - pass shellExecutor
      const hasWinget = await isWingetInstalled(this.shellExecutor);
      if (hasWinget) {
        // wingetが利用可能な場合はwingetでインストール
        return 'deno_install_windows_winget';
      } else {
        // 従来のPowerShellスクリプト
        return 'deno_install_windows_fallback';
      }
    } else {
      return 'deno_install_unix';
    }
  }

  /**
   * Generates Deno permission information based on arguments.
   * @param args List of arguments passed to the Deno command.
   * @returns PermissionInfo object or undefined if not applicable.
   */
  getPermissionInfo(args: string[]): DenoPermissionInfo | undefined {
    console.log('Generating Deno permissions:', args);
    const permissions: string[] = [];
    let title = "Deno Permissions";

    // 全権限フラグの検出 (-A または --allow-all)
    const allowAll = args.some(arg => arg === '-A' || arg === '--allow-all');

    // 個別の権限を検出して分かりやすい表示に変換
    args.forEach(arg => {
      if (arg.startsWith('--allow-')) {
        const permString = arg.substring(8); // Remove --allow- prefix
        const [permType, permScope] = permString.split('=');

        // 権限タイプに基づいて分かりやすい表示に変換（絵文字付き）
        switch (permType) {
          case 'read':
            permissions.push(permScope ? `📂 ファイル読み取り: ${permScope}` : '📂 ファイル読み取り');
            break;
          case 'write':
            permissions.push(permScope ? `💾 ファイル書き込み: ${permScope}` : '💾 ファイル書き込み');
            break;
          case 'net':
            permissions.push(permScope ? `🌐 ネットワーク: ${permScope}` : '🌐 ネットワーク');
            break;
          case 'env':
            permissions.push('⚙️ 環境変数');
            break;
          case 'run':
            permissions.push('▶️ サブプロセス実行');
            break;
          case 'ffi':
            permissions.push('🔌 外部ライブラリ');
            break;
          case 'hrtime':
            permissions.push('⏱️ 高精度タイマー');
            break;
          case 'sys':
            permissions.push('💻 システム情報');
            break;
          default:
            // 未知の権限タイプはそのまま表示
            permissions.push(`🔒 ${permString}`);
        }
      }
    });

    return {
      title: title,
      permissions: permissions.length > 0 ? permissions : ["🔒 Default (No specific permissions requested)"],
      allowAll: allowAll,
      description: allowAll ?
        "警告: すべての権限が付与されます。ファイルシステム、ネットワーク、環境変数など、あらゆるシステムリソースにアクセス可能です。" :
        "Permissions requested by the Deno script."
    };
  }
}
