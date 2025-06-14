import { MCPConfigManagerProvider } from "../providers/mcpConfigManagers";
import "@mcp-magnet/styles/global.css"; // Assuming global styles are needed
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from '../features/main/page';
import { DialogServiceProvider } from '../providers/dialogService';
import { InstallerConfigProvider } from '../providers/installerConfig';
import { PlatformProvider } from "../providers/platform";
import { ShellExecutorProvider } from "../providers/shell";
import { GithubKeysFetcherProvider } from '../providers/githubKeysFetcher';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <GithubKeysFetcherProvider>
        <ShellExecutorProvider>
          <MCPConfigManagerProvider>
            <InstallerConfigProvider>
              <DialogServiceProvider>
                <PlatformProvider>
                  <App />
                </PlatformProvider>
              </DialogServiceProvider>
            </InstallerConfigProvider>
          </MCPConfigManagerProvider>
        </ShellExecutorProvider>
      </GithubKeysFetcherProvider>
    </Suspense>
  </React.StrictMode>,
);
