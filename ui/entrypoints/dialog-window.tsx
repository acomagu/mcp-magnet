import { UrlHandler } from '@mcp-magnet/dialog';
import '@mcp-magnet/styles/app.css';
import * as tauriWindow from '@tauri-apps/api/window';
import '@mcp-magnet/styles/components.css';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { DialogServiceProvider } from '../providers/dialogService';
import { GithubKeysFetcherProvider } from '../providers/githubKeysFetcher';
import { InstallerConfigProvider } from '../providers/installerConfig';
import { MCPConfigManagerProvider } from '../providers/mcpConfigManagers';
import { PlatformProvider } from '../providers/platform';
import { ShellExecutorProvider } from '../providers/shell';
import { GithubSignatureVerifierProvider } from '../providers/githubSignatureVerifier';

function DialogWindow() {
  // State to hold the URL passed from query params
  const [url, setUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message

  useEffect(() => {
    // URLからパラメータを取得
    const searchParams = new URLSearchParams(window.location.search);
    const deepLinkUrl = searchParams.get('url'); // Read from query param 'url'

    if (deepLinkUrl) {
      // Decode the URL parameter
      try {
        const decodedUrl = decodeURIComponent(deepLinkUrl);
        setUrl(decodedUrl);
        setErrorMessage(null); // Clear any previous error
      } catch (e) {
        const errorMsg = `Error: Failed to decode URL parameter: ${e}`;
        console.error(errorMsg);
        setErrorMessage(errorMsg);
        // window.close(); // Keep commented out
      }
    } else {
      const errorMsg = 'Error: No URL query parameter provided';
      console.error(errorMsg);
      setErrorMessage(errorMsg);
      // window.close(); // Keep commented out
    }
  }, []); // Run only once on mount

  // ダイアログを閉じるときの処理
  const handleClose = useCallback(() => {
    console.log("handleClose called - window closing disabled");
    const w = tauriWindow.getCurrentWindow();
    w.close();
  }, []);

  // 環境変数フォーム送信時の処理

  if (errorMessage) {
    console.error(errorMessage);
    return <span style={{ color: 'red', padding: '10px', display: 'block' }}>{errorMessage}</span>;
  }

  return url ? (
    <UrlHandler url={url} onClose={handleClose} />
  ) : (
    <span>Loading deep link...</span> // Show loading message if no URL and no error
  );
}

// DOMが読み込まれた後にレンダリング
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('dialog-root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Suspense fallback={<div>Loading...</div>}>
          <ShellExecutorProvider>
            <GithubSignatureVerifierProvider>
              <GithubKeysFetcherProvider>
                <MCPConfigManagerProvider>
                  <InstallerConfigProvider>
                    <DialogServiceProvider>
                      <PlatformProvider>
                        <div className="theme-container theme-system">
                          <DialogWindow />
                        </div>
                      </PlatformProvider>
                    </DialogServiceProvider>
                  </InstallerConfigProvider>
                </MCPConfigManagerProvider>
              </GithubKeysFetcherProvider>
            </GithubSignatureVerifierProvider>
          </ShellExecutorProvider>
        </Suspense>
      </React.StrictMode>
    );
  }
});
