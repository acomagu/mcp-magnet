import React from 'react';

export interface GitHubKeysFetcher {
  fetchGitHubKeys(username: string): Promise<string[]>;
}

export const githubKeysFetcherContext = React.createContext<GitHubKeysFetcher | undefined>(undefined);

export function useGitHubKeysFetcher(): GitHubKeysFetcher {
  const context = React.useContext(githubKeysFetcherContext);
  if (!context) {
    throw new Error('useGitHubKeysFetcher must be used within a GitHubKeysFetcherProvider');
  }
  return context;
}
