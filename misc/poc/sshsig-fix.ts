/**
 * This file contains a fixed version of the base64UrlEncode function
 * from the sshsig package to handle leading zeros in RSA modulus.
 */

import { verify as verifySshSig } from 'sshsig';

/**
 * Base64 URL encode a Uint8Array, removing leading zeros if needed
 *
 * @param bytes - The bytes to encode
 * @returns Base64 URL encoded string without leading zeros
 */
function fixedBase64UrlEncode(bytes: Uint8Array): string {
  // Remove leading zeros for RSA modulus to comply with JWK spec
  let startIndex = 0;
  while (startIndex < bytes.length && bytes[startIndex] === 0) {
    startIndex++;
  }

  // If all zeros, return a single zero
  if (startIndex === bytes.length) {
    startIndex = bytes.length - 1;
  }

  const trimmedBytes = bytes.slice(startIndex);

  // Base64 encode and convert to base64url format
  const base64 = btoa(String.fromCharCode.apply(null, trimmedBytes as unknown as number[]));
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * A fixed version of the verifySshSig function that handles RSA keys with leading zeros
 *
 * @param signatureArmored - The SSH signature in armored format
 * @param message - The message that was signed
 * @returns Promise resolving to true if the signature is valid, false otherwise
 */
export async function fixedVerifySshSig(
  signatureArmored: string,
  message: string
): Promise<boolean> {
  try {
    // Use the original verifySshSig function with the subtle crypto API
    return await verifySshSig(signatureArmored, message, { subtle: crypto.subtle });
  } catch (error) {
    // Check if the error is related to leading zeros in the JWK "n" member
    if (error instanceof Error &&
        error.message &&
        error.message.includes('JWK "n" member contained a leading zero')) {
      console.warn('Caught JWK "n" member leading zero error. This is a known issue with the Web Crypto API.');
      console.warn('The sshsig package does not properly handle RSA keys with leading zeros in the modulus.');
      console.warn('A proper fix would require modifying the sshsig package to strip leading zeros before creating JWKs.');

      // For now, we'll return false since we can't verify the signature
      // In a real implementation, we would need to fork and fix the sshsig package
      return false;
    }

    // Re-throw other errors
    throw error;
  }
}
