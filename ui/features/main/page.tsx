import "@mcp-magnet/styles/components.css";
import { Suspense, useState } from "react";
import Notification from '../Notification';
import { MCPServerConfigForm } from "../settings/MCPServerConfigForm";
import "./page.css";

export function App() {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // 通知を表示する関数
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  // 通知を閉じる関数
  const closeNotification = () => {
    setNotification(null);
  };

  // MCP設定フォームが保存されたときのハンドラー
  const handleMCPConfigSaved = (enabledServers: Record<string, boolean>) => {
    console.log('保存された設定:', enabledServers);
    showNotification('設定を保存しました', 'success');
  };

  // MCP設定フォームでエラーが発生したときのハンドラー
  const handleMCPConfigError = (errorMessage: string) => {
    showNotification(errorMessage, 'error');
  };

  return (
    <Suspense fallback="Loading...">
      <main className="container">
        <h1>MCP Magnet</h1>
        <p className="text-center description">
          Manage Model Context Protocol configurations for AI applications
        </p>
        <div className="panel mt-3 mb-3 p-4">
          <h2 className="panel-title">MCP サーバー管理</h2>
          <p className="text-muted mt-2">Coming Soon!</p>
        </div>
        <div className="panel mt-3 mb-3 p-4">
          <p className="mt-1 mb-2"><a target="_blank" href="https://playground.mcpmagnet.app">Link Generator</a></p>
          <p className="mt-3 mb-1"><a target="_blank" href="https://github.com/acomagu/mcp-magnet/blob/main/README_ja.md#%E3%81%8A%E8%A9%A6%E3%81%97%E7%94%A8%E3%83%AA%E3%83%B3%E3%82%AF">Link例</a></p>
        </div>

        {/* MCP Server インストール先設定フォーム */}
        <MCPServerConfigForm
          onSaved={handleMCPConfigSaved}
          onError={handleMCPConfigError}
        />

        {/* 通知コンポーネント */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </main>
    </Suspense>
  );
}
