import { createContext, useContext } from 'react';
import { type InstallerConfigService } from './service';

export const InstallerConfigServiceContext = createContext<InstallerConfigService | undefined>(undefined);

export const useInstallerConfigService = (): InstallerConfigService => {
  const context = useContext(InstallerConfigServiceContext);
  if (context === undefined) {
    throw new Error('useInstallerConfigContext must be used within an InstallerConfigProvider (InstallerConfigProvider or DemoInstallerConfigProvider)');
  }
  return context;
};
