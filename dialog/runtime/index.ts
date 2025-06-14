import { useShellExecutor, type ShellCommandEvent } from '../shellExecutor';
import { useRuntimes, type Runtime } from './runtime';

export * from './runtime';
export * from './utils';

/**
 * コマンド文字列に基づいてランタイムを取得
 */
export function useRuntimeByCommand(command: string): Runtime | undefined {
  const runtimes = useRuntimes();
  return runtimes.find(runtime => runtime.commands.includes(command));
}

/**
 * ランタイムをインストール（シェルサービスを使用して標準出力/標準エラーをストリーミング）
 * @param shellExecutor An instance of ShellExecutorService to use for execution.
 * @returns スポーンされたプロセスと、成功したかどうかを示すPromise
 */
export async function useSpawnInstallProcess(command: string): Promise<{
  child: any; // Keep for compatibility? Or remove if truly unused.
  promise: Promise<boolean>;
  onStdout: (callback: (data: string) => void) => void;
  onStderr: (callback: (data: string) => void) => void;
}> {
  const shellExecutor = useShellExecutor();
  const runtime = useRuntimeByCommand(command);
  if (!runtime || !runtime.installCommand) {
    throw new Error(`${command}のインストールをサポートしていません`);
  }

  // installCommandを実行（新しいAPIではコマンド名を返す）
  // No need to pass platform here if runtime uses this.platform internally
  const commandName = await runtime.installCommand();

  // 自動インストールができない場合
  if (!commandName) {
    throw new Error(`${command}の自動インストールはこの環境ではサポートされていません`);
  }

  // 標準出力/標準エラーハンドラ
  const stdoutHandlers: ((data: string) => void)[] = [];
  const stderrHandlers: ((data: string) => void)[] = [];

  // 成功/失敗を追跡するためのPromise
  let promiseResolve: (value: boolean) => void;
  const promise = new Promise<boolean>((resolve) => {
    promiseResolve = resolve;
  });

  // Use the injected shellExecutor service
  shellExecutor.executeWithStream(commandName, (event: ShellCommandEvent) => {
    switch (event.event) {
      case 'stdout':
        stdoutHandlers.forEach(handler => handler(event.data.line));
        break;
      case 'stderr':
        stderrHandlers.forEach(handler => handler(event.data.line));
        break;
      case 'finished':
        promiseResolve(event.data.code === 0);
        break;
      case 'error':
        stderrHandlers.forEach(handler => handler(event.data.message));
        promiseResolve(false);
        break;
    }
  }).catch((error: any) => { // Add type 'any' to error
    console.error(`Error executing command: ${error}`);
    stderrHandlers.forEach(handler => handler(String(error)));
    promiseResolve(false);
  });

  return {
    child: null, // 新しいAPIではchildオブジェクトは不要
    promise,
    onStdout: (callback) => stdoutHandlers.push(callback),
    onStderr: (callback) => stderrHandlers.push(callback)
  };
}
