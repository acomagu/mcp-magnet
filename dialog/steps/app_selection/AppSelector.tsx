import { useEffect, useState } from 'react';
import { useDialogService } from '../../dialogService';
import { useMCPConfigManagers } from '../../mcpConfigManager';
import './AppSelector.css';

// やらなければならないこと:
// - フォルダ選択機能がちゃんと動くか確認
// - Manifest管理機能のレビュー
//   - env mark?
//   - _MCP_MANIFEST_URL
//   - _MCP_MANIFEST_VERSION <- 必須
// - unknown/でいいのか？
// - SignをDialog内(外?)で検証
//
//
// Optional:
// - MacOSでのテスト
// - VSCodeサポート
// - Windsurfサポート
// - nodeのインストール
// - optional argumentsに向けてオブジェクトのarg対応？
//   - permissionAdditionalInfo 的な部分にまとめたほうがいいかも

interface AppSelectorProps {
  onSubmit: () => void;
  onBack?: () => void;
  installs: { app: string, projectPath?: string }[];
  setInstalls: (updater: (prev: { app: string, projectPath?: string }[]) => { app: string, projectPath?: string }[]) => void;
}

/**
 * アプリケーション選択ダイアログのコンポーネント
 */
export function AppSelector({ onSubmit, onBack, installs, setInstalls }: AppSelectorProps) {
  const managers = useMCPConfigManagers(); // Get managers from context via hook
  const dialogService = useDialogService(); // Get dialog service from context

  const clients = managers.map(manager => manager.getClientInfo());

  const [selectedClients, setSelectedClients] = useState<string[]>();
  useEffect(() => { // Backボタンで戻ってきた時用のselectedClientsの計算
    if (selectedClients != undefined) return;

    const selected = [...installs.reduce((s, install) => s.add(install.app), new Set<string>())];
    setSelectedClients(selected);
  }, [installs, selectedClients]);

  const handleAppToggle = (appId: string) => {
    handleGlobalToggle(appId); // ここでProjectsがサポートされていないものに関してもハンドル

    // 選択解除の場合、全てのインストールを削除
    if (selectedClients?.includes(appId)) {
      setInstalls(prev => prev.filter(install => install.app !== appId));
    }

    setSelectedClients(prev => {
      if (prev?.includes(appId)) {
        return prev?.filter(id => id !== appId);
      } else {
        return [...prev ?? [], appId];
      }
    });
  };

  const handleGlobalToggle = (appId: string) => {
    setInstalls(prev => {
      const i = prev.findIndex(install => install.app === appId && install.projectPath == undefined);
      if (i !== -1) {
        return prev.filter((_, index) => index !== i);
      } else {
        return [...prev, { app: appId }];
      }
    });
  };

  const handleAddProject = async (appId: string) => {
    let selected;
    try {
      selected = await dialogService.openFileDialog();
    } catch (error) {
      // TODO: show Notification
      console.error('ディレクトリ選択ダイアログでエラーが発生しました:', error);
    }

    if (selected == null) return;

    const paths = Array.isArray(selected) ? selected : [selected];
    for (const path of paths) {
      if (installs.find(({ app, projectPath }) => app === appId && projectPath === path)) {
        // TODO: show notification
        console.warn('このプロジェクトは既に追加されています:', selected);
        continue;
      }

      setInstalls(prev => [...prev, { app: appId, projectPath: path }]);
    }
  };

  const handleRemoveProject = (appId: string, path: string) => {
    setInstalls(prev => prev.filter(install => !(install.app === appId && install.projectPath === path)));
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>MCPサーバーのインストール先を選択</h3>
      </div>
      <div className="step-description">
        インストールするアプリケーションを選択してください
      </div>

      <div className="step-content">
        <div className="app-selector-apps">
          {clients.map(app => (
            <div
              key={app.id}
              className={`app-option ${selectedClients?.includes(app.id) ? 'selected' : ''}`}
            >
              <label className="app-option-label">
                <input
                  type="checkbox"
                  checked={selectedClients?.includes(app.id)}
                  onChange={() => handleAppToggle(app.id)}
                  className="app-checkbox form-check-input"
                />
                <div className="app-option-content">
                  <div className="app-name">{app.name}</div>
                </div>
              </label>

              {app.supportsProjects &&
                <div className="project-accordion">
                  <div className="project-settings">
                    <label className="project-setting-option">
                      <input
                        type="checkbox"
                        checked={installs.some(i => i.app === app.id && !i.projectPath)}
                        onChange={() => handleGlobalToggle(app.id)}
                        className="project-setting-checkbox"
                      />
                      <div className="project-setting-content">
                        <h4>グローバルにインストール</h4>
                        <p>すべてのプロジェクトに適用されます</p>
                      </div>
                    </label>

                    <div className="project-list">
                      <h4>プロジェクトを選択</h4>
                      {installs.filter((i): i is typeof i & { projectPath: string } => i.app === app.id && i.projectPath != undefined).map(({ projectPath }, index: number) => (
                        <div key={index} className="project-item">
                          <span className="project-path">{projectPath}</span>
                          <button
                            className="remove-project-btn"
                            onClick={() => handleRemoveProject(app.id, projectPath)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-project-btn"
                        onClick={() => handleAddProject(app.id)}
                      >
                        + プロジェクト追加
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="step-footer">
        <button
          type="button"
          className="button btn-secondary"
          onClick={onBack}
        >
          戻る
        </button>
        <button
          type="button"
          className="button btn-primary"
          disabled={!installs.length}
          onClick={onSubmit}
        >
          進む
        </button>
      </div>
    </div>
  );
}
