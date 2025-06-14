import React, { createContext, useContext, type ReactNode } from 'react';

// --- Context Definition ---

export type Platform = 'linux' | 'macos' | 'windows';

// Context will hold the platform string directly
export const PlatformContext = createContext<Platform | undefined>(undefined);

export const usePlatform = (): Platform => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider (PlatformProvider or DemoPlatformProvider)');
  }
  return context;
};

// --- Demo Provider ---

interface DemoPlatformProviderProps {
  children: ReactNode;
}

// Define the default platform for the demo
const demoPlatform: Platform = 'linux';

export const DemoPlatformProvider: React.FC<DemoPlatformProviderProps> = ({ children }) => {
  // Provide the hardcoded demo platform value
  console.log(`[DemoPlatform] Providing platform: ${demoPlatform}`);
  return (
    <PlatformContext.Provider value={demoPlatform}>
      {children}
    </PlatformContext.Provider>
  );
};
