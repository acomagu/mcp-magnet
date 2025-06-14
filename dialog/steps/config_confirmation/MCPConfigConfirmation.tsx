import '@mcp-magnet/styles/app.css';
import './MCPConfigConfirmation.css';
import { PermissionDisplay } from '../overview/PermissionDisplay';
import type { MCPManifest } from '../../mcpConfigManager';
import type { PermissionInfo } from '../../runtime';
import React, { use } from 'react';

interface MCPConfigConfirmationProps {
  manifest: MCPManifest;
  env?: Record<string, string>;
  configFilePaths: Promise<string[]>;
  permissionInfo: PermissionInfo | undefined;
  onBack: () => void;
  onConfirm: () => void;
}

export function MCPConfigConfirmation({
  manifest,
  env,
  configFilePaths,
  permissionInfo,
  onBack,
  onConfirm
}: MCPConfigConfirmationProps) {
  const paths = use(configFilePaths);

  // バージョンを環境変数に追加
  const envWithVersion = env ? { ...env } : {};
  if (manifest.manifestVersion) {
    const author = manifest.manifestAuthor || 'unknown';
    envWithVersion.__MCP_SERVER_MANIFEST = `${author}/${manifest.name}@${manifest.manifestVersion}`;
  }

  const mcpConfigJSON = {
    [manifest.name]: {
      command: manifest.command,
      args: manifest.args,
      env: envWithVersion,
    },
  };
  return (
    <div className="step-container">
        {/* ステップヘッダー */}
        <div className="step-header">
           <h2>MCP 設定の追加</h2>
        </div>

        {/* ステップコンテンツ */}
        <div className="step-content">
          {permissionInfo ? (
            <PermissionDisplay permissionInfo={permissionInfo} label="" />
          ) : (
            <div className="card permission-section">
              <span className="permission-text">権限情報がありません</span>

              <p className="permission-description">
                すべての権限が付与される可能性があります。
              </p>
            </div>
          )}

          <div className="config-label">追加される設定内容：</div>
          <div className="config-preview">
            <pre>{JSON.stringify(mcpConfigJSON, null, 2)}</pre>
            {JSON.stringify(mcpConfigJSON).includes('__MCP_SERVER_MANIFEST') && (
              <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                Manifestとの紐づけを維持するために、<code>__MCP_SERVER_MANIFEST</code> 環境変数が追加されます
              </p>
            )}
          </div>

          <div className="confirmation-message">
            上記の設定がこれらのファイルに追加されます：
          </div>

          <div className="target-files">
            <ul>
              {paths.map((path, index) => (
                <li key={index}>{path}</li>
              ))}
            </ul>
          </div>

          <div className="confirmation-question">
            この内容でよろしいですか？
          </div>
        </div>

        {/* ステップフッター */}
        <div className="step-footer">
          <button className="button btn-secondary" onClick={onBack}>戻る</button>
          <button className="button btn-primary" onClick={onConfirm}>設定を追加</button>
        </div>
      </div>
  );
}
