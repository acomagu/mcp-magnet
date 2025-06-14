import type { CommandName } from "@mcp-magnet/shell-commands";
import type { ShellExecutorService } from "../shellExecutor";
import type { DenoPermissionInfo } from "../runtimes/DenoRuntime";
import { type MCPManifest, mcpManifestSchema } from "../mcpConfigManager";

/**
 * Base64文字列をデコードする万能デコーダ関数
 * URL-safe変種、パディング不足、空白/改行/%エスケープ、その他の問題に対応
 *
 * @param input デコードするBase64文字列
 * @param label エラーメッセージ用のラベル
 * @returns デコードされた文字列またはエラー
 */
export function decodeBase64(
  input: string,
  label = "base64"
): string | Error {
  // 0) 前処理: URL-safe 変種を標準形へ
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");

  // 1) 半角 %xx が混じっていたら decodeURIComponent しておく
  try {
    b64 = decodeURIComponent(b64);
  } catch { /* 無視: % で始まらない場合 */ }

  // 2) Base64 フォーマットをざっくり検証
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64) || b64.length % 4 === 1) {
    return new Error(`${label} が無効です`);
  }

  // 3) パディング不足を補完
  if (b64.length % 4) b64 += "=".repeat(4 - (b64.length % 4));

  // 4) デコード
  try {
    const bin = atob(b64);
    const text = new TextDecoder().decode(
      Uint8Array.from(bin, c => c.charCodeAt(0))
    );
    return text;
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * MCP Magnetのディープリンク用URLをパースする
 *
 * @param urlStr パースするURL文字列
 * @returns パースされたURLオブジェクトまたはエラー
 */
export function parseMagnetUrl(urlStr: string): URL | Error {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "mcp-magnet:" || url.hostname !== "install") {
      return new Error(
        `Invalid protocol/host: ${url.protocol}//${url.hostname}`
      );
    }
    return url;
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * マニフェストJSONをパースして検証する
 *
 * @param jsonStr マニフェストのJSON文字列
 * @returns 検証済みマニフェストオブジェクトまたはエラー
 */
export function parseManifestJson(jsonStr: string): MCPManifest | Error {
  try {
    const data = JSON.parse(jsonStr);
    const { success, error, data: manifest } = mcpManifestSchema.safeParse(data);

    if (!success) {
      return new Error(`マニフェストが無効です: ${error}`);
    }

    // 追加検証
    if (!manifest || typeof manifest !== 'object' || !manifest.command || !Array.isArray(manifest.args)) {
      return new Error('マニフェストの構造が不正です');
    }

    return manifest;
  } catch (e) {
    return e instanceof Error ? e : new Error(`マニフェストのJSONパースエラー: ${String(e)}`);
  }
}

/**
 * Parses an MCP deep link URL and extracts the manifest.
 * @param url The deep link URL string.
 * @returns MCPManifest object or Error
 */
export function parseMcpDeepLink(url: string): MCPManifest | Error {
  console.log('Parsing deep link:', url);

  // URLをパース
  const parsedUrl = parseMagnetUrl(url);
  if (parsedUrl instanceof Error) {
    return parsedUrl;
  }

  // manifestパラメータを取得
  const manifestParam = parsedUrl.searchParams.get('manifest');
  if (!manifestParam) {
    return new Error("manifest パラメータがありません");
  }

  // Base64デコード
  const decodedManifest = decodeBase64(manifestParam, "manifest");
  if (decodedManifest instanceof Error) {
    return decodedManifest;
  }

  // JSONパース＆検証
  const manifest = parseManifestJson(decodedManifest);
  if (manifest instanceof Error) {
    return manifest;
  }

  console.log('Parsed MCP Manifest:', manifest);
  return manifest;
}

/**
 * Generates Deno permission information based on arguments.
 * Placeholder implementation.
 * @param args List of arguments passed to the Deno command.
 * @returns DenoPermissionInfo object.
 */
export function generateDenoPermissionInfo(args: string[]): DenoPermissionInfo {
  console.log('Generating Deno permissions (placeholder):', args);
  // TODO: Implement actual logic to parse Deno flags like --allow-net, --allow-read, etc.
  const permissions: string[] = [];
  let title = "Deno Permissions";

  // 全権限フラグの検出 (-A または --allow-all)
  const hasAllPermissions = args.some(arg => arg === '-A' || arg === '--allow-all');

  if (hasAllPermissions) {
    permissions.push('すべての権限');
  } else {
    args.forEach(arg => {
      if (arg.startsWith('--allow-')) {
        permissions.push(arg.substring(8)); // Extract permission name
      }
      // Add more specific parsing if needed
    });
  }

  return {
    title: title,
    permissions: permissions.length > 0 ? permissions : ["Default (No specific permissions requested)"],
    allowAll: hasAllPermissions,
    description: hasAllPermissions ?
      "警告: すべての権限が付与されます。ファイルシステム、ネットワーク、環境変数など、あらゆるシステムリソースにアクセス可能です。" :
      "Permissions requested by the Deno script."
  };
}

/**
 * コマンドの実行が成功するかチェックする関数
 * @param commandName シェルコマンドの名前
 * @param shellExecutor Service instance to execute the command
 * @returns コマンドの実行が成功した場合はtrue、そうでない場合はfalse
 */
async function checkCommandSuccess(commandName: CommandName, shellExecutor: ShellExecutorService): Promise<boolean> {
  try {
    // Use the injected executor
    const output = await shellExecutor.execute(commandName);
    return output.code === 0;
  } catch (error) {
    console.error(`Error executing ${commandName}:`, error);
    return false;
  }
}

/**
 * wingetがインストールされているかチェックする関数
 * @param shellExecutor Service instance to execute the command
 */
export async function isWingetInstalled(shellExecutor: ShellExecutorService): Promise<boolean> {
  // Pass the executor to the internal check function
  return checkCommandSuccess('winget_version_check', shellExecutor);
}

/**
 * Homebrewがインストールされているかチェックする関数
 * @param shellExecutor Service instance to execute the command
 */
export async function isHomebrewInstalled(shellExecutor: ShellExecutorService): Promise<boolean> {
  // Pass the executor to the internal check function
  return checkCommandSuccess('homebrew_version_check', shellExecutor);
}
