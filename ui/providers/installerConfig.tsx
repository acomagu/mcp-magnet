import { InstallerConfig, installerConfigSchema, InstallerConfigService, InstallerConfigServiceContext } from '@mcp-magnet/dialog';
import * as path from '@tauri-apps/api/path'; // Needed for Tauri service
import { readJSONFile, writeJSONFile } from '../util'; // Keep using these for Tauri
import React from 'react';

const CONFIG_FILE_NAME = 'mcp_installer_config.json';

class TauriInstallerConfigService implements InstallerConfigService {
  private async getConfigPath(): Promise<string> {
    const configDirPath = await path.configDir();
    return await path.join(configDirPath, CONFIG_FILE_NAME);
  }

  async loadConfig(): Promise<InstallerConfig> {
    const configPath = await this.getConfigPath();
    return await readJSONFile(installerConfigSchema, configPath, { enabledServers: {} });
  }

  async saveConfig(config: InstallerConfig): Promise<void> {
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };

    installerConfigSchema.parse(updatedConfig);

    const configPath = await this.getConfigPath();
    await writeJSONFile(installerConfigSchema, configPath, updatedConfig);
  }
}

export const InstallerConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tauriService = React.useMemo(() => new TauriInstallerConfigService(), []);

  return (
    <InstallerConfigServiceContext.Provider value={tauriService}>
      {children}
    </InstallerConfigServiceContext.Provider>
  );
};
