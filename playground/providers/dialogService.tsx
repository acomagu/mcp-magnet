import { type DialogService, DialogServiceContext } from '@mcp-magnet/dialog';
import React from 'react';

class DemoDialogService implements DialogService {
  async openFileDialog(): Promise<string | null> {
    return prompt('Enter file path') ?? null;
  }
}

export function DemoDialogServiceProvider({ children }: { children: React.ReactNode }) {
  const dialogService = new DemoDialogService();

  return (
    <DialogServiceContext.Provider value={{ dialogService }}>
      {children}
    </DialogServiceContext.Provider>
  );
}
