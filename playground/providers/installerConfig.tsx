import { type InstallerConfig, installerConfigSchema, type InstallerConfigService, InstallerConfigServiceContext } from '@mcp-magnet/dialog';
import React, { type ReactNode } from 'react';

class DemoInstallerConfigService implements InstallerConfigService {
  // Simple in-memory cache for the demo
  private demoConfig: InstallerConfig = { enabledClients: {} };

  async loadConfig(): Promise<InstallerConfig> {
    console.log('[DemoICS] Loading config (in-memory).');
    // Return a copy to prevent direct mutation
    return Promise.resolve({ ...this.demoConfig });
  }

  async saveConfig(config: InstallerConfig): Promise<void> {
    console.log('[DemoICS] Saving config (in-memory, no-op for persistence). Data:', config);
    try {
        // Still validate the structure
        const updatedConfig = {
            ...config,
            lastUpdated: new Date().toISOString(),
        };
        installerConfigSchema.parse(updatedConfig);
        this.demoConfig = updatedConfig; // Update in-memory cache
        return Promise.resolve();
    } catch (error) {
        console.error('[DemoICS] Invalid config format during save:', error);
        // Decide how to handle validation errors in demo
        return Promise.reject(error);
    }
  }
}

interface DemoInstallerConfigProviderProps {
  children: ReactNode;
}

// Instantiate the Demo service once
const demoService = new DemoInstallerConfigService();

export const DemoInstallerConfigProvider: React.FC<DemoInstallerConfigProviderProps> = ({ children }) => {
  return (
    <InstallerConfigServiceContext.Provider value={demoService}>
      {children}
    </InstallerConfigServiceContext.Provider>
  );
};
