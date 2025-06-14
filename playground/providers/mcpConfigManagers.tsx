import { type MCPConfig, type MCPConfigManager, MCPConfigManagerContext, type MCPClientInfo, type ProjectMCPConfigManager } from '@mcp-magnet/dialog';
import React from 'react';

/**
 * Base class for dummy MCPConfigManagers for use in non-Tauri environments.
 * Implements the interface with no-op methods that return successful promises.
 */
class BaseDummyMCPConfigManager implements MCPConfigManager {
  protected clientInfo: MCPClientInfo;

  constructor(info: Partial<MCPClientInfo> & { id: string; name: string }) {
    // Ensure basic properties are set, allow overrides
    this.clientInfo = {
      iconColor: '#cccccc', // Default grey color
      supportsProjects: true, // Assume project support by default for dummies
      ...info, // Spread provided info
    };
  }

  getClientInfo(): MCPClientInfo {
    return this.clientInfo;
  }

  async upsert(name: string, config: MCPConfig): Promise<void> {
    console.log(`[Dummy ${this.clientInfo.name}] Upsert called (no-op). Name:`, name, `Config:`, config);
    return Promise.resolve();
  }

  async read(): Promise<MCPConfig[]> {
    console.log(`[Dummy ${this.clientInfo.name}] Read called (returning empty).`);
    return Promise.resolve([]);
  }

  async getConfigFilePath(): Promise<string> {
    // Return a plausible-looking dummy path based on ID
    const dummyPath = `/dummy/path/to/${this.clientInfo.id}/config.json`;
    console.log(`[Dummy ${this.clientInfo.name}] getConfigFilePath called (returning: ${dummyPath}).`);
    return dummyPath;
  }

  // Provide dummy implementation for getProject if needed by components
  getProject?(projectPath: string): ProjectMCPConfigManager {
    console.log(`[Dummy ${this.clientInfo.name}] getProject called for path: ${projectPath}.`);
    // Only return a project manager if the dummy supports projects
    if (this.clientInfo.supportsProjects) {
        return new DummyProjectMCPConfigManager(this, projectPath);
    }
    // Optionally throw an error or return undefined if projects aren't supported
    console.warn(`[Dummy ${this.clientInfo.name}] does not support projects.`);
    return undefined as any; // Cast to satisfy potential return type, though logic prevents it if !supportsProjects
  }

  // Provide dummy implementation for refresh if needed by components
  refresh?(): Promise<void> {
    console.log(`[Dummy ${this.clientInfo.name}] Refresh called (no-op).`);
    return Promise.resolve();
  }

  // Add other optional methods if the interface requires them
  // refreshInstrument?: string; // Example if needed
}

/**
 * Dummy ProjectMCPConfigManager.
 */
class DummyProjectMCPConfigManager implements ProjectMCPConfigManager {
  private projectPath: string;
  private parentServerInfo: MCPClientInfo;

  // Fixed constructor syntax
  constructor(parent: BaseDummyMCPConfigManager, projectPath: string) {
    this.projectPath = projectPath;
    this.parentServerInfo = parent.getClientInfo();
  }

  async upsert(_name: string, config: MCPConfig): Promise<void> {
    console.log(`[Dummy ${this.parentServerInfo.name} Project: ${this.projectPath}] Upsert called (no-op). Config:`, config);
    return Promise.resolve();
  }

  async read(): Promise<MCPConfig[]> {
    console.log(`[Dummy ${this.parentServerInfo.name} Project: ${this.projectPath}] Read called (returning empty).`);
    return Promise.resolve([]);
  }

  async getConfigFilePath() {
    const dummyPath = `${this.projectPath}/.mcp/${this.parentServerInfo.id}/config.json`;
    console.log(`[Dummy ${this.parentServerInfo.name} Project: ${this.projectPath}] getConfigFilePath called (returning: ${dummyPath}).`);
    return dummyPath;
  }
}

// --- Specific Dummy Manager Implementations ---

class DummyClaudeDesktopMCPConfigManager extends BaseDummyMCPConfigManager {
  constructor() {
    // Info based on src/services/mcpConfig/claudeDesktop.ts
    super({
      id: 'claude-desktop',
      name: 'Claude Desktop',
      iconColor: '#D97706', // Amber 600
      supportsProjects: false, // Claude Desktop doesn't support projects
    });
  }

  // Add dummy refresh method that uses shellExecutor
  async refresh(): Promise<void> {
    console.log(`[Dummy Claude Desktop] Refresh called (simulating with shellExecutor)`);
    // Just log that we would use shellExecutor, but don't actually execute anything
    return Promise.resolve();
  }
}

class DummyCursorMCPConfigManager extends BaseDummyMCPConfigManager {
  constructor() {
    // Info based on src/services/mcpConfig/cursor.ts
    super({
      id: 'cursor',
      name: 'Cursor',
      iconColor: '#4F46E5', // Indigo 600
      supportsProjects: true,
    });
  }
  // Cursor might have a refresh, keep the default no-op from base class
}

// Placeholder for Windsurf Dummy Manager
class DummyWindsurfMCPConfigManager extends BaseDummyMCPConfigManager {
  constructor() {
    super({
      id: 'windsurf', // Assuming an ID
      name: 'Windsurf',
      iconColor: '#0EA5E9', // Sky 500 (Example)
      supportsProjects: true, // Assuming project support
    });
  }
}

// --- Function to get all dummy managers ---

function getDummyMCPConfigManagers(): MCPConfigManager[] {
  return [
    new DummyClaudeDesktopMCPConfigManager(),
    new DummyCursorMCPConfigManager(),
    new DummyWindsurfMCPConfigManager(),
    // Add other dummy managers here as needed
  ];
}

export const DemoMCPConfigManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get dummy managers synchronously, passing shellExecutor
  const managers = getDummyMCPConfigManagers();

  // No need for 'use' hook here as data is synchronous
  return (
    <MCPConfigManagerContext.Provider value={managers}>
      {children}
    </MCPConfigManagerContext.Provider>
  );
};
