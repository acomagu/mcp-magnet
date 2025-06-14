import React from 'react';
import { type GitHubKeysFetcher, githubKeysFetcherContext } from '@mcp-magnet/dialog';
import { getKeys } from './githubKeysFetcher.server';

class WebGitHubKeysFetcher implements GitHubKeysFetcher {
  private keyCache: Map<string, string[]> = new Map();
  async fetchGitHubKeys(username: string): Promise<string[]> {
    if (this.keyCache.has(username)) {
      return this.keyCache.get(username)!;
    }

    const keys = await getKeys(username);
    this.keyCache.set(username, keys);
    return keys;
  }
}

export function WebGithubKeysFetcherProvider({ children }: { children: React.ReactNode }) {
  const fetcher = new WebGitHubKeysFetcher();
  return <githubKeysFetcherContext.Provider value={fetcher}>
    {children}
  </githubKeysFetcherContext.Provider>;
}
