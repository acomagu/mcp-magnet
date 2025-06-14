import React, { Suspense, useMemo } from 'react';
import { DeepLinkDialog } from './DeepLinkDialog';
import { useGitHubKeysFetcher } from './githubKeysFetcher';
import { useGithubSignatureVerifier } from './githubSignatureVerifier';
import type { MCPManifest } from './mcpConfigManager';
import { mcpManifestSchema } from './mcpConfigManager';

function decodeBase64(input: string): string | Error {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(input), c => c.charCodeAt(0)));
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

function parseUrl(urlStr: string): URL | Error {
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

function extractDataFromUrl(url: string) {
  // 1-1) URL 構文チェック
  const parsedUrl = parseUrl(url);
  if (parsedUrl instanceof Error) return parsedUrl;

  // 1-2) manifest パラメータ
  const manifestParam = parsedUrl.searchParams.get("manifest");
  if (!manifestParam) return new Error("manifest パラメータがありません");

  const decodedManifest = decodeBase64(manifestParam);
  if (decodedManifest instanceof Error) return decodedManifest;

  // 1-3) マニフェストのパースとバリデーション
  try {
    const { success, data: manifest, error } = mcpManifestSchema.safeParse(JSON.parse(decodedManifest));
    if (!success) return new Error(`マニフェストが無効です: ${error}`);

    // 署名情報を収集
    const signatureParam = parsedUrl.searchParams.get('signature');
    let signature;
    let githubUsername;

    if (signatureParam) {
      signature = decodeURIComponent(signatureParam);

      githubUsername = manifest.manifestAuthor?.startsWith("github:")
        ? manifest.manifestAuthor.slice("github:".length)
        : null;
      console.log({ signatureDecoded: signature, githubUsername });

      if (!githubUsername) {
        return new Error(`Unsupported manifest author: ${manifest.manifestAuthor}`);
      }
    }

    return {
      githubUsername,
      manifest,
      manifestParam,
      signature,
      signatureParam,
    };
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

function InstallerPage({ onClose, verifyPromise, manifest }: { onClose: () => void, verifyPromise: Promise<boolean | Error>, manifest: MCPManifest }) {
  const verified = React.use(verifyPromise);
  if (verified instanceof Error) return (
    <div className="error-message">
      <p>署名検証エラー: {verified.message}</p>
    </div>
  );
  if (!verified) return (
    <div className="error-message">
      <p>署名検証に失敗しました</p>
    </div>
  );

  return <DeepLinkDialog manifest={manifest} onClose={onClose} />;
}

export function UrlHandler({ url, onClose }: { url: string, onClose: () => void }) {
  const githubKeysFetcher = useGitHubKeysFetcher();
  const githubSignatureVerifier = useGithubSignatureVerifier();

  const urlData = useMemo(() => extractDataFromUrl(url), [url]);

  // useMemoをSuspense可能性のあるコンポーネント内で呼ぶと、useMemoを使っているにも関わらず
  // Suspense時毎回関数が実行されるので、Promiseを親コンポーネントで作成して子コンポーネントでuseする
  const verifyPromise = useMemo(async () => {
    if (urlData instanceof Error) return false;

    const { signatureParam, signature, manifestParam, githubUsername } = urlData;

    // 署名なしの場合は検証不要
    if (!signatureParam) return true;
    if (!signature || !githubUsername) return false;

    let publicKeys;
    try {
      publicKeys = await githubKeysFetcher.fetchGitHubKeys(githubUsername);
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e));
    }

    return githubSignatureVerifier({
      publicKeys,
      payload: manifestParam,
      signatureArmored: signature,
    });
  }, [urlData, githubKeysFetcher, githubSignatureVerifier]);

  if (urlData instanceof Error) {
    console.warn(urlData);
    return (
      <div className="error-message">
        <p>URLの解析エラー: {urlData.message}</p>
      </div>
    );
  }
  return (
    <Suspense fallback={<p>⌛ 検証中...</p>}>
      <InstallerPage onClose={onClose} verifyPromise={verifyPromise} manifest={urlData.manifest} />
    </Suspense>
  );
}
