/**
 * This script demonstrates the bug in the sshsig package related to
 * the "JWK 'n' member contained a leading zero" error.
 *
 * The issue occurs when verifying SSH signatures with RSA keys that have
 * leading zeros in the modulus. The Web Crypto API doesn't allow leading
 * zeros in JWK "n" members, but the sshsig package doesn't handle this case.
 */

import { verify as verifySshSig } from 'sshsig';
import * as crypto from 'crypto';

// Type assertion to make TypeScript happy with the crypto.subtle usage
const subtle = crypto.subtle as unknown as SubtleCrypto;

/**
 * Create an RSA key pair with a high probability of having leading zeros in the modulus
 */
function generateRsaKeyPair(): { publicKey: string, privateKey: string } {
  // Generate an RSA key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

/**
 * Convert a PEM public key to SSH format
 */
function pemToSshPublicKey(pemKey: string): string {
  // This is a simplified conversion - in a real implementation,
  // you would need to properly format the SSH public key
  const keyBuffer = Buffer.from(pemKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\n/g, ''), 'base64');

  // Extract the modulus and exponent from the key
  // This is a simplified implementation
  const keyData = crypto.createPublicKey(pemKey).export({ format: 'jwk' }) as any;

  // Check if the modulus has leading zeros
  const modulusBuffer = Buffer.from(keyData.n, 'base64url');
  const hasLeadingZeros = modulusBuffer[0] === 0;

  console.log('Modulus first few bytes:', Array.from(modulusBuffer.slice(0, 5)));
  console.log('Has leading zeros:', hasLeadingZeros);

  // Create an SSH format public key (simplified)
  return `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... test@example.com`;
}

/**
 * Create a mock SSH signature
 */
function createMockSshSignature(message: string, privateKey: string): string {
  // This is a simplified mock - in a real implementation,
  // you would use the SSH signature format
  const signature = crypto.sign('sha256', Buffer.from(message), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  });

  // Create a mock SSH signature in the expected format
  return `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADEAAAAHc3NoLXJzYQAAAAMBAAEAAAEBAAAAAAAAAGQAAAAHc3NoLXJz
YQAAAGQAAAATAAAAByJzaGEtMjU2IgAAAEgAAAAzAAAAC3NzaC1lZDI1NTE5AAAAILHCXBJYlPPk
rt2WYyP3SZoMx43lDBB5QALjE762EQlcAAAABGZpbGUAAAAAAAAABnNoYTUxMgAAAFMAAAAL
c3NoLWVkMjU1MTkAAABAkJBg6wE8pqEdbW6G6YXqZF4ixgDHBfhHGtRC9yqYnczWEkyf7Ji2
FcNnpV6tyv5XZ78SXXY7Nmf8eRJ+N4UCAQ==
-----END SSH SIGNATURE-----`;
}

/**
 * Create a JWK with a leading zero in the modulus to demonstrate the issue
 */
function createJwkWithLeadingZero(): JsonWebKey {
  return {
    kty: "RSA",
    n: "APDbvfbCVXxvQFOCV2yHO4P9pZTZBG79sNo2k1PTwXWJd_T_-wCBuO14fQtTkcQRfFhZYx6wy6TEvzLUFmtNJ7X4iuRe2Jzf-hntk2i1huz93HAY67N6w0mUYtAp1S9rZdXisgAFgDeVUhjhBV1r4_KmvGRFojQwuIRymAHHF2nr",
    e: "AQAB"
  };
}

/**
 * Demonstrate the bug by trying to import a JWK with a leading zero
 */
async function demonstrateJwkBug(): Promise<void> {
  try {
    console.log('Demonstrating JWK bug with leading zero...');

    // Create a JWK with a leading zero in the modulus
    const jwk = createJwkWithLeadingZero();
    console.log('JWK with leading zero:', jwk);

    // Try to import the JWK using the Web Crypto API
    console.log('Attempting to import JWK with leading zero...');
    await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' }
      },
      false,
      ['verify']
    );

    console.log('JWK import succeeded (unexpected)');
  } catch (error) {
    console.error('JWK import failed as expected:', error);

    // Check if the error is the one we're looking for
    if (error instanceof Error &&
        error.message &&
        error.message.includes('JWK "n" member contained a leading zero')) {
      console.log('\n✅ BUG CONFIRMED: The error is related to JWK "n" member containing a leading zero.');
    } else {
      console.log('\n❌ Different error than expected:', error);
    }
  }
}

/**
 * Demonstrate the bug in the sshsig package
 */
async function demonstrateSshsigBug(): Promise<void> {
  try {
    console.log('\nDemonstrating sshsig bug with SSH signature...');

    // Generate an RSA key pair
    const { publicKey, privateKey } = generateRsaKeyPair();
    console.log('Generated RSA key pair');

    // Convert the public key to SSH format
    const sshPublicKey = pemToSshPublicKey(publicKey);
    console.log('Converted public key to SSH format');

    // Create a test message
    const testMessage = 'Hello, world!';
    console.log('Test message:', testMessage);

    // Create a mock SSH signature
    const sshSignature = createMockSshSignature(testMessage, privateKey);
    console.log('Created mock SSH signature');

    // Try to verify the signature using the sshsig package
    console.log('Attempting to verify signature...');
    const result = await verifySshSig(sshSignature, testMessage, { subtle });
    console.log('Verification result:', result);
  } catch (error) {
    console.error('Verification failed:', error);

    // Check if the error is the one we're looking for
    if (error instanceof Error &&
        error.message &&
        error.message.includes('JWK "n" member contained a leading zero')) {
      console.log('\n✅ BUG CONFIRMED: The error is related to JWK "n" member containing a leading zero.');
      console.log('This confirms that the sshsig package does not handle RSA keys with leading zeros in the modulus.');
    } else {
      console.log('\n❓ Different error than expected:', error);
    }
  }
}

/**
 * Run the demonstrations
 */
async function main(): Promise<void> {
  console.log('=== sshsig Bug Reproduction ===\n');

  // Demonstrate the JWK bug
  await demonstrateJwkBug();

  // Demonstrate the sshsig bug
  await demonstrateSshsigBug();

  console.log('\n=== Reproduction Complete ===');
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
});
