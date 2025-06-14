import React, { useState } from 'react';
import '@mcp-magnet/styles/app.css';

interface AppWithRefresh {
  name: string;
  canRefresh: boolean;
  refreshInstrument?: string;
}

interface CompletionStepProps {
  onClose: () => void;
  appsWithRefresh?: AppWithRefresh[];
  onRefreshApp?: (appName: string) => Promise<void>;
}

export function CompletionStep({ onClose, appsWithRefresh, onRefreshApp }: CompletionStepProps) {
  const [refreshingApp, setRefreshingApp] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<'success' | 'error' | null>(null);
  // 自動リフレッシュ失敗時または説明が必要なときに表示するアプリ名
  const [showInstructions, setShowInstructions] = useState<{[key: string]: boolean}>({});

  const handleRefreshApp = async (appName: string) => {
    if (!onRefreshApp) return;

    setRefreshingApp(appName);
    setRefreshResult(null);

    try {
      await onRefreshApp(appName);
      setRefreshResult('success');
      // 成功したら説明は非表示に
      setShowInstructions(prev => ({...prev, [appName]: false}));
    } catch (error) {
      console.error(`Failed to refresh ${appName}:`, error);
      setRefreshResult('error');
      // 失敗したら説明を表示
      setShowInstructions(prev => ({...prev, [appName]: true}));
    } finally {
      setRefreshingApp(null);
    }
  };

  // リフレッシュ可能な（自動または手動）アプリがあるかどうか
  const hasRefreshableApp = appsWithRefresh && appsWithRefresh.some(app =>
    app.canRefresh || app.refreshInstrument
  );

  return (
    <div className="step-container">
        <div className="step-header">
          <h3>完了</h3>
        </div>

        <div className="step-content">
          {/* 完了メッセージのコンテンツ */}
          <div className="completion-message">
            <div className="completion-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2" fill="none" />
                <path d="M8 12L11 15L16 9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p>設定の追加が完了しました</p>

            {refreshResult === 'success' && (
              <p className="completion-success-message">
                アプリケーションの再起動が完了しました
              </p>
            )}

            {refreshResult === 'error' && (
              <p className="completion-error-message">
                アプリケーションの再起動に失敗しました
              </p>
            )}

            {/* 手動リフレッシュの説明を表示 */}
            {appsWithRefresh && appsWithRefresh.map(app =>
              showInstructions[app.name] && app.refreshInstrument && (
                <div key={`${app.name}-instructions`} className="completion-instructions">
                  <p>手動で再起動する方法:</p>
                  <p>{app.refreshInstrument}</p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="step-footer">
          {hasRefreshableApp && appsWithRefresh && appsWithRefresh.map(app => {
            // 自動リフレッシュ可能な場合はボタンを表示
            if (app.canRefresh) {
              return (
                <button
                  key={app.name}
                  className="button btn-secondary"
                  onClick={() => handleRefreshApp(app.name)}
                  disabled={refreshingApp !== null}
                  style={{ marginRight: '10px' }}
                >
                  {refreshingApp === app.name ? `${app.name} 再起動中...` : `${app.name} を再起動する`}
                </button>
              );
            }
            // 自動リフレッシュできない場合、説明がある場合は説明ボタンを表示
            else if (app.refreshInstrument) {
              return (
                <button
                  key={app.name}
                  className="button btn-secondary"
                  onClick={() => setShowInstructions(prev => ({...prev, [app.name]: !prev[app.name]}))}
                  style={{ marginRight: '10px' }}
                >
                  {showInstructions[app.name] ? `手順を隠す` : `${app.name} 再起動手順を表示`}
                </button>
              );
            }
            return null;
          })}
          <button className="button btn-primary" onClick={onClose}>閉じる</button>
        </div>
      </div>
  );
}
