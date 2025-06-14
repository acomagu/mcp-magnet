import { createContext, useContext } from 'react';
import type { MCPConfigManager } from './manager';

export const MCPConfigManagerContext = createContext<MCPConfigManager[] | undefined>(undefined);

export const useMCPConfigManagerContext = (): MCPConfigManager[] => {
  const context = useContext(MCPConfigManagerContext);
  if (context === undefined) {
    throw new Error('useMCPConfigManagerContext must be used within an MCPConfigManagerProvider (MCPConfigManagerProvider or DemoMCPConfigManagerProvider)');
  }
  return context;
};
