import * as openpgp from 'openpgp';
import { fixedVerifySshSig } from './sshsig-fix';

/**
 * Parameters for GitHub signature verification
 */
export interface VerifyGithubSignatureParams {
  /** GitHub username */
  user: string;
  /** The payload that was signed (usually a JSON string) */
  payload: string;
  /** The signature to verify (SSH or GPG armored format) */
  signatureArmored: string;
}

/**
 * Utility functions for fetching GitHub keys
 */
const getText = (r: Response) => r.ok ? r.text() : '';

/**
 * Fetch SSH public keys for a GitHub user
 *
 * @param user - GitHub username
 * @returns Promise resolving to a string containing the user's SSH public keys
 */
export const githubKeys = (user: string): Promise<string> =>
  fetch(`https://github.com/${user}.keys`).then(getText);

/**
 * Fetch GPG public keys for a GitHub user
 *
 * @param user - GitHub username
 * @returns Promise resolving to a string containing the user's GPG public keys
 */
export const githubGpg = (user: string): Promise<string> =>
  fetch(`https://github.com/${user}.gpg`).then(getText)
    .then(t => t || fetch(`https://api.github.com/users/${user}/gpg_keys`)
      .then(r => r.json()).then(js => js.map((k: any) => k.raw_key).join('\n')));

/**
 * Verifies an SSH signature against a GitHub user's public keys
 *
 * @param user - GitHub username
 * @param json - The payload that was signed
 * @param signatureArmored - The SSH signature to verify
 * @returns True if signature is valid, false otherwise
 */
export async function verifySsh({ user, json, signatureArmored }: {
  user: string;
  json: string;
  signatureArmored: string;
}): Promise<boolean> {
  // Get the user's public keys from GitHub
  const userKeysString = await githubKeys(user);
  const userKeys = userKeysString.trim().split('\n');

  if (userKeys.length === 0 || (userKeys.length === 1 && userKeys[0] === '')) {
    throw new Error(`No SSH keys found for GitHub user: ${user}`);
  }

  // Use our fixed version of verifySshSig that handles RSA keys with leading zeros
  return await fixedVerifySshSig(signatureArmored, json);
}

/**
 * Verifies a GPG signature against a GitHub user's public keys
 *
 * @param user - GitHub username
 * @param json - The payload that was signed
 * @param signatureAsc - The GPG signature to verify
 * @returns True if signature is valid, false otherwise
 */
export async function verifyGpg({ user, json, signatureAsc }: {
  user: string;
  json: string;
  signatureAsc: string;
}): Promise<boolean> {
  try {
    // Get the user's public keys from GitHub
    const armored = await githubGpg(user);

    if (!armored) {
      console.error('No GPG keys found for GitHub user:', user);
      return false;
    }

    // Read the public keys
    const keys = await openpgp.readKeys({ armoredKeys: armored });

    // Create message & signature
    const [message, signature] = await Promise.all([
      openpgp.createMessage({ text: json }),
      openpgp.readSignature({ armoredSignature: signatureAsc })
    ]);

    // Verify the signature
    const res = await openpgp.verify({ message, signature, verificationKeys: keys });

    // Check if any signature is valid
    for (const sig of res.signatures) {
      if (await sig.verified) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('GPG signature verification error:', error);
    return false;
  }
}

/**
 * Verifies a signature against a GitHub user's public keys
 *
 * @param params - Parameters for verification
 * @returns True if signature is valid, false otherwise
 */
export async function verifyGithubSignature({ user, payload, signatureArmored }: VerifyGithubSignatureParams): Promise<boolean> {
  // Determine signature type based on the armored signature format
  if (signatureArmored.includes('-----BEGIN SSH SIGNATURE-----')) {
    return await verifySsh({ user, json: payload, signatureArmored });
  } else if (signatureArmored.includes('-----BEGIN PGP SIGNATURE-----')) {
    return await verifyGpg({ user, json: payload, signatureAsc: signatureArmored });
  } else {
    console.error('Unknown signature format');
    return false;
  }
}
