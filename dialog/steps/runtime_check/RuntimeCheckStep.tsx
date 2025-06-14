import React, { Suspense, use, useEffect, useState } from 'react';
import { usePlatform } from '../../platform';
import { useRuntimeByCommand, useSpawnInstallProcess, type Runtime } from '../../runtime';
import { type MCPManifest } from "../../mcpConfigManager";
import { useShellExecutor } from '../../shellExecutor';
import './RuntimeCheckStep.css';
import { TerminalOutput } from './terminalOutput';

// インストールコマンドのプレビューを表示するコンポーネント
// It needs the platform to call installCommand
function CommandPreview({ runtime }: { runtime: Runtime | undefined }): React.ReactElement {
  if (!runtime?.installCommand) {
    return <pre className="command-preview">コマンド情報なし</pre>;
  }

  // use() を使って非同期データを取得 (installCommand uses this.platform internally)
  const commandPromise = runtime.installCommand(); // Removed platform argument
  const commandName = use(commandPromise);

  // commandNameがundefinedの場合
  if (!commandName) {
    return <pre className="command-preview">このプラットフォームでは自動インストールできません</pre>;
  }

  const shellExecutor = useShellExecutor();
  const shellCommand = shellExecutor.getCommandDetails(commandName);

  // shellCommandがundefinedの場合
  if (!shellCommand) {
    return <pre className="command-preview">コマンド情報の取得に失敗しました: {commandName}</pre>;
  }

  return (
    <pre className="command-preview">
      {`${shellCommand.command} ${shellCommand.args.join(' ')}`}
    </pre>
  );
}

interface RuntimeCheckStepProps {
  command: string;
  onBack: () => void;
  onComplete: () => void;
}

export function RuntimeCheckStep({
  command,
  onBack,
  onComplete,
}: RuntimeCheckStepProps): React.ReactElement {
  const [checking, setChecking] = useState<boolean>(true);
  const [installed, setInstalled] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [stdoutHandler, setStdoutHandler] = useState<((callback: (data: string) => void) => void) | null>(null);
  const [stderrHandler, setStderrHandler] = useState<((callback: (data: string) => void) => void) | null>(null);
  const platform = usePlatform();
  const shellExecutor = useShellExecutor();
  const runtime = useRuntimeByCommand(command);

  useEffect(() => {
    runtime?.isInstalled().then(setInstalled);
  }, [runtime]);

  // インストールハンドラー
  const handleInstall = async () => {
    if (!runtime?.installCommand) return;

    setInstalling(true);
    setError("");
    setErrorDetails("");
    setStdoutHandler(null);
    setStderrHandler(null);

    try {
      // インストールプロセスを開始, pass platform and shellExecutor
      const { promise, onStdout, onStderr } = await useSpawnInstallProcess(command);

      // 標準出力/標準エラーハンドラを保存
      setStdoutHandler(() => onStdout);
      setStderrHandler(() => onStderr);

      // プロセスの完了を待つ
      const success = await promise;
      setInstalled(success);

      if (!success) {
        setError(`${runtime.name}のインストールに失敗しました。`);
        setErrorDetails('インストールプロセスが正常に完了しませんでした。上記の出力を確認してください。');
      }
    } catch (err) {
      console.error(`Failed to install ${command}:`, err);
      setInstalled(false);

      // エラーメッセージを設定
      setError(`${runtime.name}のインストールに失敗しました。`);

      // エラー詳細を設定
      if (err instanceof Error) {
        setErrorDetails(err.message);
      } else {
        // オブジェクトとして扱い、文字列化して表示
        setErrorDetails(String(err));
      }
    } finally {
      setInstalling(false);
    }
  };

  // コンポーネントマウント時にランタイムチェック
  useEffect(() => {
    const checkRuntime = async () => {
      setChecking(false);
    };

    checkRuntime();
  }, [command, platform, shellExecutor]); // Add shellExecutor to dependency array

  // ランタイムが見つからない場合
  if (!checking && !runtime) {
    return (
      <div className="step-container">
        <div className="step-header">
          <h3>ランタイム確認</h3>
        </div>
        <div className="step-description">
          不明なランタイム: {command}
        </div>

        <div className="step-content">
          <div className="warning-icon">⚠</div>
          <p>このコマンドに対応するランタイム情報が見つかりませんでした。</p>
        </div>

        <div className="step-footer">
          <button
            type="button"
            className="button button-secondary"
            onClick={onBack}
          >
            戻る
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={onComplete}
          >
            続行 (runtimeなしで実行)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>ランタイム確認</h3>
      </div>
      <div className="step-description">
        {checking ?
          `${runtime?.name || command}が利用可能か確認しています...` :
          installed ?
            `${runtime?.name || command}がインストールされています` :
            `${runtime?.name || command}がインストールされていません`
        }
      </div>

      <div className="step-content">
        {checking ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>確認中...</p>
          </div>
        ) : installed ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{runtime?.name || command}は正常にインストールされています。次のステップに進みます...</p>
          </div>
        ) : (
          <div className="install-prompt">
            <div className="warning-icon">⚠</div>
            <p>{runtime?.name || command}がインストールされていないため、MCPを実行できません。</p>

            {runtime?.installCommand ? (
              <div className="auto-install-option">
                {/* インストールコマンドの情報を表示 */}
                <div className="install-command-info">
                  <p>実行されるコマンド:</p>
                  <Suspense fallback={<pre className="command-preview">コマンド取得中...</pre>}>
                    {/* Pass platform to CommandPreview */}
                    <CommandPreview runtime={runtime} />
                  </Suspense>
                </div>

                <button
                  className="button button-primary"
                  onClick={handleInstall}
                  disabled={installing}
                >
                  {installing ? 'インストール中...' : `${runtime.name}をインストール`}
                </button>

                <TerminalOutput
                  onStdout={stdoutHandler || undefined}
                  onStderr={stderrHandler || undefined}
                />

                {error && (
                  <div className="error-message">
                    <p><strong>{error}</strong></p>
                    {errorDetails && (
                      <div className="error-details">
                        <p>詳細: {errorDetails}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="divider">
                  <span>または</span>
                </div>

                <div className="install-instructions">
                  <p>
                    <a href={runtime.installInstructionUrl} target="_blank" rel="noopener noreferrer">
                      {runtime.name}のインストール手順を確認する
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="manual-install-instructions">
                <p>
                  {runtime?.name || command}を手動でインストールしてください。
                  インストール後、このダイアログを閉じて再度試してください。
                </p>
                <div className="install-instructions">
                  <p>
                    <a href={runtime?.installInstructionUrl} target="_blank" rel="noopener noreferrer">
                      {runtime?.name || command}のインストール手順を確認する
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-footer">
        <button
          type="button"
          className="button button-secondary"
          onClick={onBack}
          disabled={checking || installing}
        >
          戻る
        </button>

        {!checking && !installing && (
          <button
            type="button"
            className="button button-primary"
            onClick={onComplete}
          >
            続行 (runtimeなしで実行)
          </button>
        )}
      </div>
    </div>
  );
}

// ランタイムチェックをスキップするかどうかを判断するための静的メソッド
RuntimeCheckStep.shouldSkip = async (manifest: MCPManifest): Promise<boolean> => {
  const command = manifest.command;

  // コマンドに対応するランタイムを取得
  // useRuntimeByCommand を使用してランタイムを取得
  const runtime = await import('../../runtime').then(module => {
    // 非同期関数内で同期的に使用するため、直接モジュールから関数を取得
    return module.useRuntimeByCommand(command);
  });

  // ランタイムが存在しない場合はスキップしない
  if (!runtime) {
    return false;
  }

  try {
    // ランタイムがインストール済みかどうかをチェック
    const isInstalled = await runtime.isInstalled();
    // インストール済みの場合はスキップ
    return isInstalled;
  } catch (error) {
    console.error('Error checking runtime installation:', error);
    // エラーが発生した場合はスキップしない
    return false;
  }
};

/**
 * コマンドがランタイムチェックを必要とするかどうかを判断する
 * @param command コマンド文字列
 * @returns ランタイムチェックが必要かどうか
 */
function isRuntimeCheckNeeded(command: string): boolean {
  // コマンドがdeno, node, pythonなどの場合はruntimeチェックが必要
  return ['deno', 'node', 'python', 'python3'].includes(command);
}

/**
 * MCPManifestに基づいてランタイムチェックステップを表示すべきかどうかを判断するフック
 * @param manifest MCPManifest
 * @returns ランタイムチェックステップを表示すべきかどうか
 */
export function useShouldShowRuntimeCheckStep(manifest: MCPManifest): boolean { // hookの前でEarly Return しない!
  const command = manifest.command;

  // TODO: 一旦特定コマンドの場合のみ表示しているが、全てのコマンドについて
  // コマンドが存在するかどうかだけでも確認したほうが望ましい
  const needsRuntimeCheck = isRuntimeCheckNeeded(command);

  const runtime = useRuntimeByCommand(command);

  // use hookを使用して非同期処理を同期的に扱う
  const isInstalledPromise = runtime?.isInstalled()
  console.log('use isInstalledPromise:', isInstalledPromise);
  const isInstalled = isInstalledPromise ? use(isInstalledPromise) : false;
  console.log('used isInstalledPromise');

  // インストール済みの場合は表示しない（スキップする）
  return !needsRuntimeCheck || !isInstalled;
}
