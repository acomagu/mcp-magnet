import { type CommandName } from "@mcp-magnet/shell-commands";
import type { Platform } from "../platform";
import type { Runtime } from "../runtime/runtime";
import { isHomebrewInstalled } from "../runtime/utils";
import type { ShellExecutorService } from "../shellExecutor";

export class PythonRuntime implements Runtime {
  readonly name = 'Python';
  readonly description = 'Python programming language';
  readonly commands = ['python', 'python3', 'pip', 'pip3'];
  readonly installInstructionUrl = 'https://www.python.org/downloads/';
  readonly autoInstallSupportedPlatforms: readonly Platform[] = ['macos'];
  private isInstalledPromise: Promise<boolean> | undefined;

  // Store dependencies provided during instantiation
  private platform: Platform;
  private shellExecutor: ShellExecutorService;

  constructor(platform: Platform, shellExecutor: ShellExecutorService) {
    this.platform = platform;
    this.shellExecutor = shellExecutor;
  }

  async isInstalled(): Promise<boolean> {
    if (this.isInstalledPromise) {
      return this.isInstalledPromise;
    }

    this.isInstalledPromise = (async () => {
      try {
        // まずpython3を試す
        try {
          // Use the injected shellExecutor
          const output = await this.shellExecutor.execute('python3_version_check');
          if (output.code === 0) return true;
        } catch (e) {
          // python3コマンドが失敗した場合はpythonも試す
        }

        // python3がなければpythonを試す
        // Use the injected shellExecutor
        const output = await this.shellExecutor.execute('python_version_check');

        // Python 2はバージョン情報をstderrに出力するため、両方チェック
        return output.code === 0;
      } catch (error) {
        console.error('Error checking Python installation:', error);
        return false;
      }
    })();

    return this.isInstalledPromise;
  }

  // isHomebrewInstalledを共通化したため削除

  async installCommand(): Promise<CommandName | undefined> {
    // Use the platform stored during construction
    if (this.platform === 'macos') {
      // Homebrewがインストールされているか確認 - pass shellExecutor
      const hasHomebrew = await isHomebrewInstalled(this.shellExecutor);
      if (!hasHomebrew) {
        console.log('Homebrew is not installed on macOS, cannot auto-install Python');
        return undefined; // Homebrewがない場合は自動インストール不可
      }

      return 'python_install_macos';
    } else {
      return undefined; // 他のプラットフォームは自動インストール不可
    }
  }
}
