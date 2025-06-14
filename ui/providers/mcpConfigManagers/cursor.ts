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

class CursorMCPConfigManagerImpl implements ProjectMCPConfigManager {
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
      console.log(`Cursor global MCP configuration updated successfully at ${configPath}`);
    } catch (error) {
      throw new Error(`Failed to write Cursor global MCP configuration to ${configPath}: ${error}`);
    }
  }
  getConfigFilePath() {
    return path.join(this.projectPath ?? this.homeDir, '.cursor', 'mcp.json');
  }
}

export class CursorMCPConfigManager extends CursorMCPConfigManagerImpl implements MCPConfigManager {
  constructor(homeDir: string) {
    super(homeDir);
  }
  getProject(projectPath: string): ProjectMCPConfigManager {
    return new CursorMCPConfigManagerImpl(this.homeDir, projectPath);
  }
  getClientInfo() {
    return {
      id: 'cursor',
      name: 'Cursor',
      iconColor: 'cursor',
      supportsProjects: true
    };
  }
}
