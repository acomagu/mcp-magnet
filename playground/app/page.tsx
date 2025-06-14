'use client';

import { DemoPlatformProvider } from '@mcp-magnet/dialog';
import '@mcp-magnet/styles/app.css';
import '@mcp-magnet/styles/components.css';
import { Suspense } from 'react';
import { DemoDialogServiceProvider } from '../providers/dialogService';
import { WebGithubKeysFetcherProvider } from '../providers/githubKeysFetcher';
import { GithubSignatureVerifierProvider } from '../providers/githubSignatureVerifier';
import { DemoInstallerConfigProvider } from '../providers/installerConfig';
import { DemoMCPConfigManagerProvider } from '../providers/mcpConfigManagers';
import { DemoShellExecutorProvider } from '../providers/shell';
import { Playground } from './playground';
import './playground.css';

export default function Home() {
  return <Suspense fallback={<div>Loading...</div>}>
    <DemoPlatformProvider>
      <WebGithubKeysFetcherProvider>
        <GithubSignatureVerifierProvider>
          <DemoShellExecutorProvider>
            <DemoMCPConfigManagerProvider>
              <DemoInstallerConfigProvider>
                <DemoDialogServiceProvider>
                  <Playground />
                </DemoDialogServiceProvider>
              </DemoInstallerConfigProvider>
            </DemoMCPConfigManagerProvider>
          </DemoShellExecutorProvider>
        </GithubSignatureVerifierProvider>
      </WebGithubKeysFetcherProvider>
    </DemoPlatformProvider>
  </Suspense>
}
