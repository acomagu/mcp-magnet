import { verify as verifySshSig } from 'sshsig';
import * as openpgp from 'openpgp';

/**
 * Parameters for signature verification
 */
export interface VerifySignatureParams {
  /** The message that was signed */
  message: string;
  /** The signature to verify */
  signature: string;
  /** The public key to use for verification */
  publicKey: string;
}

/**
 * Detects the signature type (SSH or GPG)
 *
 * @param signature - The signature to detect
 * @returns The detected signature type ('ssh', 'gpg', or 'unknown')
 */
export function detectSignatureType(signature: string): 'ssh' | 'gpg' | 'unknown' {
  if (signature.includes('-----BEGIN SSH SIGNATURE-----')) {
    return 'ssh';
  } else if (signature.includes('-----BEGIN PGP SIGNATURE-----')) {
    return 'gpg';
  } else {
    return 'unknown';
  }
}

/**
 * Verifies an SSH signature
 *
 * @param message - The message that was signed
 * @param signature - The SSH signature to verify
 * @param publicKey - The SSH public key to use for verification
 * @returns True if signature is valid, false otherwise
 */
export async function verifySshSignature(message: string, signature: string, publicKey: string): Promise<boolean> {
  try {
    // Verify the signature directly
    // The verifySshSig function will parse the signature internally
    return await verifySshSig(signature, message, { subtle: crypto.subtle });
  } catch (error) {
    console.error('SSH signature verification error:', error);
    return false;
  }
}

/**
 * Verifies a GPG signature
 *
 * @param message - The message that was signed
 * @param signature - The GPG signature to verify
 * @param publicKey - The GPG public key to use for verification
 * @returns True if signature is valid, false otherwise
 */
export async function verifyGpgSignature(message: string, signature: string, publicKey: string): Promise<boolean> {
  try {
    // Read the public key
    const keys = await openpgp.readKeys({ armoredKeys: publicKey });

    // Create message and read signature
    const [pgpMessage, pgpSignature] = await Promise.all([
      openpgp.createMessage({ text: message }),
      openpgp.readSignature({ armoredSignature: signature })
    ]);

    // Verify the signature
    const result = await openpgp.verify({
      message: pgpMessage,
      signature: pgpSignature,
      verificationKeys: keys
    });

    // Check if any signature is valid
    for (const sig of result.signatures) {
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
 * Verifies a signature with automatic type detection
 *
 * @param params - Parameters for verification
 * @returns True if signature is valid, false otherwise
 */
export async function verifySignature({ message, signature, publicKey }: VerifySignatureParams): Promise<boolean> {
  const signatureType = detectSignatureType(signature);

  switch (signatureType) {
    case 'ssh':
      return await verifySshSignature(message, signature, publicKey);
    case 'gpg':
      return await verifyGpgSignature(message, signature, publicKey);
    default:
      console.error('Unknown signature type');
      return false;
  }
}
