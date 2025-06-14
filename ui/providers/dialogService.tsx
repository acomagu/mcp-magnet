import { DialogService, DialogServiceContext } from '@mcp-magnet/dialog';
import * as dialog from '@tauri-apps/plugin-dialog';
import React from 'react';

class TauriDialogService implements DialogService {
  async openFileDialog(options?: Partial<dialog.OpenDialogOptions>): Promise<string | null> {
    return await dialog.open({
      multiple: false,
      directory: true,
      title: 'Select Project Directory', // Default title
      ...options, // Allow overriding defaults
    });
  }
}

export function DialogServiceProvider({ children }: { children: React.ReactNode }) {
  const dialogService = new TauriDialogService();

  return (
    <DialogServiceContext.Provider value={{ dialogService }}>
      {children}
    </DialogServiceContext.Provider>
  );
}
