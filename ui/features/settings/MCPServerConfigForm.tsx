import { useInstallerConfig, useMCPConfigManagers } from "@mcp-magnet/dialog";
import { useState } from "react";
import "./MCPServerConfigForm.css";

interface MCPServerConfigFormProps {
  onSaved?: (enabledClients: Record<string, boolean>) => void;
  onError?: (message: string) => void;
}

/**
 * MCP サーバーのインストール先設定を管理するフォームコンポーネント
 */
export function MCPServerConfigForm({ onSaved, onError }: MCPServerConfigFormProps) {
  const { config, setConfig } = useInstallerConfig();
  const managers = useMCPConfigManagers();

  // サーバー情報を取得
  const mcpServers = managers.map(m => m.getClientInfo());

  const [enabledClients, setEnabledServers] = useState<Record<string, boolean>>(() => {
    const initialEnabledState: Record<string, boolean> = {};
    mcpServers.forEach(server => {
      // 設定ファイルに値があればそれを使い、なければデフォルトでtrue
      initialEnabledState[server.id] =
        config && config.enabledClients && server.id in config.enabledClients
          ? config.enabledClients[server.id]
          : true;
    });
    return initialEnabledState;
  });

  // サーバーの有効/無効を切り替える
  const toggleServerEnabled = (serverId: string) => {
    setEnabledServers(prev => ({
      ...prev,
      [serverId]: !prev[serverId]
    }));
  };

  // 変更を保存する
  const saveSettings = async () => {
    try {
      // 設定ファイルに保存
      if (config) {
        await setConfig(prevConfig => ({
          ...prevConfig,
          enabledClients,
          lastUpdated: new Date().toISOString()
        }));
      }

      // 親コンポーネントに保存完了を通知
      onSaved?.(enabledClients);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      onError?.('設定の保存に失敗しました');
    }
  };

  return (
    <div className="panel mcp-server-config-form"> {/* Keep specific container class */}
      <h2 className="panel-title">MCP クライアント設定</h2>
      <p>インストール時に表示するアプリケーションを選択してください</p>

      <div className="server-list">
        {mcpServers.map(server => (
          <div key={server.id} className="server-item">
            {/* Use consolidated form-check class */}
            <label className="form-check server-toggle">
              {/* Use consolidated form-check-input class */}
              <input
                type="checkbox"
                className="form-check-input"
                checked={enabledClients[server.id] || false}
                onChange={() => toggleServerEnabled(server.id)}
              />
              <div className="server-info">
                 {/* Use consolidated app-icon class */}
                <div className={`app-icon server-icon ${server.iconColor}`}></div>
                <span className="server-name">{server.name}</span>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Use consolidated dialog-footer class */}
      <div className="dialog-footer settings-actions">
        {/* Use consolidated button classes */}
        <button
          className="button btn-primary"
          onClick={saveSettings}
        >
          設定を保存
        </button>
      </div>
    </div>
  );
}
