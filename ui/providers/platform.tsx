import { Platform, PlatformContext } from '@mcp-magnet/dialog';
import * as os from '@tauri-apps/plugin-os';
import React, { ReactNode } from 'react';

interface PlatformProviderProps {
  children: ReactNode;
}

const loadPlatform = (): Platform => {
  const platform = os.platform();
  switch (platform) {
    case 'macos':
    case 'linux':
    case 'windows':
      return platform;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  return (
    <PlatformContext.Provider value={loadPlatform()}>
      {children}
    </PlatformContext.Provider>
  );
};
