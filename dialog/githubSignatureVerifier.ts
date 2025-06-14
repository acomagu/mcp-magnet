import { createContext, useContext } from 'react';

export type GithubSignatureVerifier = (params: {
  publicKeys: string[],
  payload: string;
  signatureArmored: string;
}) => Promise<boolean>;

export const GithubSignatureVerifierContext = createContext<GithubSignatureVerifier | undefined>(undefined);

export function useGithubSignatureVerifier(): GithubSignatureVerifier {
  const context = useContext(GithubSignatureVerifierContext);
  if (!context) {
    throw new Error('useGithubSignatureVerifier must be used within an GithubSignatureVerifierProvider');
  }
  return context;
}
