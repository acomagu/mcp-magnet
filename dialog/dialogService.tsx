import { createContext, useContext } from 'react';

// DialogServiceのインターフェース定義
export interface DialogService {
  openFileDialog(options?: {
    directory?: boolean;
    multiple?: boolean;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }): Promise<string | string[] | null>;
}

// コンテキストの作成
interface DialogServiceContextValue {
  dialogService: DialogService;
}

// デフォルト値は警告を出す実装
const defaultValue: DialogServiceContextValue = {
  dialogService: {
    openFileDialog: async () => {
      console.warn('DialogService not initialized');
      return null;
    }
  }
};

export const DialogServiceContext = createContext<DialogServiceContextValue>(defaultValue);

// コンテキストを使用するためのカスタムフック
export function useDialogService(): DialogService {
  const { dialogService } = useContext(DialogServiceContext);
  return dialogService;
}

// コンテキストプロバイダーコンポーネント
