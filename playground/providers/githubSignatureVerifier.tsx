import { GithubSignatureVerifier, GithubSignatureVerifierContext } from '@mcp-magnet/dialog';

/**
 * Verify a signature using a GitHub user's public keys
 * @param params - Verification parameters
 * @param params.publicKeys - public keys
 * @param params.payload - The data that was signed
 * @param params.signatureArmored - The signature to verify
 * @returns Promise that resolves to true if the signature is valid, false otherwise
 * @throws Error if the WASM module is not initialized
 */
const verifyGitHubSignature: GithubSignatureVerifier = async ({ publicKeys, payload, signatureArmored }): Promise<boolean> => {
  try {
    if (publicKeys.length === 0) {
      console.warn('No public keys given');
      return false;
    }

    const { verify } = await import('@mcp-magnet/sig-verify');

    // Try each key until we find one that verifies the signature
    for (const publicKey of publicKeys) {
      try {
        console.log('Verifying:', { publicKey, payload, signatureArmored });

        const isValid = verify(payload, signatureArmored, publicKey);
        if (isValid) {
          return true;
        }
      } catch (error) {
        // Continue to the next key if verification fails
        console.debug(`Verification failed with key: ${publicKey.substring(0, 20)}...; cause: ${error}`);
      }
    }

    // If we get here, none of the keys verified the signature
    return false;
  } catch (error) {
    console.error('GitHub signature verification error:', error);
    throw error;
  }
}

export function GithubSignatureVerifierProvider({ children }: { children: React.ReactNode }) {
  return <GithubSignatureVerifierContext.Provider value={verifyGitHubSignature}>
    {children}
  </GithubSignatureVerifierContext.Provider>
}
