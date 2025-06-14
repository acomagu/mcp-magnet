import { MCPConfig, MCPConfigManager, ShellExecutorService } from '@mcp-magnet/dialog';
import * as path from '@tauri-apps/api/path';
import * as os from '@tauri-apps/plugin-os';
import * as z from '@zod/mini';
import { readJSONFile, writeJSONFile } from '../../util';

const configFileSchema = z.object({
  mcpServers: z.optional(z.record(z.string(), z.object({
    command: z.string(),
    args: z.array(z.string()),
    env: z.optional(z.record(z.string(), z.string())),
  }))),
});

function getClaudeConfigPath(homeDir: string) {
  const platform = os.platform();
  switch (platform) {
    case 'macos':
      return path.join(homeDir, 'Library', 'Application Support', 'Claude');
    case 'windows':
      return path.join(homeDir, 'AppData', 'Roaming', 'Claude');
    case 'linux':
      return path.join(homeDir, '.config', 'claude');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export class ClaudeDesktopMCPConfigManager implements MCPConfigManager {
  homeDir: string;
  refreshInstrument = "MCP を読み込むために、Claude Desktop を File -> Quit から終了し、再度起動してください";
  private shellExecutor: ShellExecutorService; // Add shellExecutor field

  constructor(homeDir: string, shellExecutor: ShellExecutorService) {
    this.homeDir = homeDir;
    this.shellExecutor = shellExecutor;
  }
  async upsert(name: string, config: MCPConfig) {
    const configPath = await this.getConfigFilePath();

    const conf = await readJSONFile(configFileSchema, configPath, {});

    conf.mcpServers = {
      ...conf.mcpServers,
      [name]: {
        command: config.command,
        args: config.args,
        env: config.env,
      },
    };

    await writeJSONFile(configFileSchema, configPath, conf);
  }
  async getConfigFilePath() {
    return `${await getClaudeConfigPath(this.homeDir)}/claude_desktop_config.json`;
  }
  getClientInfo() {
    return {
      id: 'claude',
      name: 'Claude Desktop',
      iconColor: 'claude',
      supportsProjects: false
    };
  }

  async refresh(): Promise<void> {
    const platform = os.platform();

    try {
      // Claudeを終了 - use shellExecutor
      if (platform === 'windows') {
        await this.shellExecutor.execute('claude_kill_windows');
      } else if (platform === 'macos') {
        await this.shellExecutor.execute('claude_kill_macos');
      } else if (platform === 'linux') {
        await this.shellExecutor.execute('claude_kill_linux');
      } else {
        throw new Error(`Unsupported platform for refresh: ${platform}`);
      }

      // アプリが完全に終了するのを待つ
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Claudeを再起動 - use shellExecutor
      if (platform === 'windows') {
        // WindowsではローカルアプリデータフォルダーからClaudeを起動
        await this.shellExecutor.execute('claude_start_windows');
      } else if (platform === 'macos') {
        // macOSではアプリケーションとして開く
        await this.shellExecutor.execute('claude_start_macos');
      } else if (platform === 'linux') {
        // Linuxではコマンドとして実行
        await this.shellExecutor.execute('claude_start_linux');
      }
    } catch (error) {
      console.error('Failed to refresh Claude Desktop:', error);
      throw error;
    }
  }
}
