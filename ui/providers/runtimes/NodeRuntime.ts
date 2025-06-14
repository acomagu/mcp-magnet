import type { Platform } from '@mcp-magnet/dialog';
import { ShellExecutorService } from "@mcp-magnet/dialog";
import { Runtime, isHomebrewInstalled, isWingetInstalled } from "@mcp-magnet/dialog/runtime";
import { CommandName } from "@mcp-magnet/shell-commands";

export class NodeRuntime implements Runtime {
  readonly name = 'Node.js';
  readonly description = 'JavaScript runtime environment for server-side applications';
  readonly commands = ['node', 'npm', 'npx'];
  readonly installInstructionUrl = 'https://nodejs.org/en/download/';
  readonly autoInstallSupportedPlatforms: readonly Platform[] = ['windows', 'macos', 'linux'];

  // Store dependencies provided during instantiation
  private platform: Platform;
  private shellExecutor: ShellExecutorService;

  constructor(platform: Platform, shellExecutor: ShellExecutorService) {
    this.platform = platform;
    this.shellExecutor = shellExecutor;
  }

  async isInstalled(): Promise<boolean> {
    try {
      // Use the injected shellExecutor
      const output = await this.shellExecutor.execute('node_version_check');
      return output.code === 0;
    } catch (error) {
      console.error('Error checking Node.js installation:', error);
      return false;
    }
  }

  async installCommand(): Promise<CommandName | undefined> {
    // Use the platform stored during construction
    if (this.platform === 'windows') {
      // wingetが利用可能かチェック - pass shellExecutor
      const hasWinget = await isWingetInstalled(this.shellExecutor);
      if (hasWinget) {
        // wingetが利用可能な場合
        return 'node_install_windows_winget';
      } else {
        // wingetが利用できない場合は従来のメソッド（MicrosoftのWebサイトを開く）
        console.log('winget is not available, using alternative installation method');
        return 'node_install_windows_fallback';
      }
    } else if (this.platform === 'macos') {
      // Homebrewがインストールされているか確認 - pass shellExecutor
      const hasHomebrew = await isHomebrewInstalled(this.shellExecutor);
      if (!hasHomebrew) {
        console.log('Homebrew is not installed on macOS, cannot auto-install Node.js');
        return undefined; // Homebrewがない場合は自動インストール不可
      }

      return 'node_install_macos';
    } else {
      return 'node_install_linux';
    }
  }
}
