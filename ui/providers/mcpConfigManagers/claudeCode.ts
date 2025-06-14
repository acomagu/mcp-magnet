import * as path from '@tauri-apps/api/path';
import * as z from '@zod/mini'; // Import Zod
import { readJSONFile, writeJSONFile } from '../../util';
import { ProjectMCPConfigManager, MCPConfig, MCPConfigManager } from '@mcp-magnet/dialog';

const configFileSchema = z.object({
  mcpServers: z.optional(z.record(z.string(), z.object({
    command: z.string(),
    args: z.array(z.string()),
    env: z.optional(z.record(z.string(), z.string())),
  }))),
});

class ClaudeCodeMCPConfigManagerImpl implements ProjectMCPConfigManager {
  homeDir: string;
  projectPath?: string;
  constructor(homeDir: string, projectPath?: string) {
    this.homeDir = homeDir;
    this.projectPath = projectPath;
  }
  async upsert(name: string, config: MCPConfig): Promise<void> {
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

    try {
      await writeJSONFile(configFileSchema, configPath, conf);
      console.log(`ClaudeCode global MCP configuration updated successfully at ${configPath}`);
    } catch (error) {
      throw new Error(`Failed to write ClaudeCode global MCP configuration to ${configPath}: ${error}`);
    }
  }
  getConfigFilePath() {
    if (this.projectPath) {
      return path.join(this.projectPath, '.mcp.json');
    }
    return path.join(this.homeDir, '.claude', 'mcp_servers.json');
  }
}

export class ClaudeCodeMCPConfigManager extends ClaudeCodeMCPConfigManagerImpl implements MCPConfigManager {
  constructor(homeDir: string) {
    super(homeDir);
  }
  getProject(projectPath: string): ProjectMCPConfigManager {
    return new ClaudeCodeMCPConfigManagerImpl(this.homeDir, projectPath);
  }
  getClientInfo() {
    return {
      id: 'claudeCode',
      name: 'Claude Code',
      iconColor: 'claude',
      supportsProjects: true
    };
  }
}
