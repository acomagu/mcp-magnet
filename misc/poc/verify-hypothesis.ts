/**
 * This script tests the hypothesis that the error "DataError: The JWK 'n' member contained a leading zero"
 * is caused by a bug in the sshsig package when handling RSA keys with leading zeros in the modulus.
 */

import { verify as verifySshSig } from 'sshsig';

// Main function to test the hypothesis
async function testHypothesis() {
  try {
    console.log('Testing hypothesis about JWK "n" member leading zero error...');

    // Create a test message
    const testMessage = 'Hello, world!';

    // Example SSH signature with an RSA key that likely has leading zeros in the modulus
    // This is a real SSH signature format but with made-up content
    const sshSignature = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADEAAAAHc3NoLXJzYQAAAAMBAAEAAAEBAAAAAAAAAGQAAAAHc3NoLXJz
YQAAAGQAAAATAAAAByJzaGEtMjU2IgAAAEgAAAAzAAAAC3NzaC1lZDI1NTE5AAAAILHCXBJYlPPk
rt2WYyP3SZoMx43lDBB5QALjE762EQlcAAAABGZpbGUAAAAAAAAABnNoYTUxMgAAAFMAAAAL
c3NoLWVkMjU1MTkAAABAkJBg6wE8pqEdbW6G6YXqZF4ixgDHBfhHGtRC9yqYnczWEkyf7Ji2
FcNnpV6tyv5XZ78SXXY7Nmf8eRJ+N4UCAQ==
-----END SSH SIGNATURE-----`;

    // Try to verify the signature
    try {
      console.log('Attempting to verify signature...');
      const result = await verifySshSig(sshSignature, testMessage, { subtle: crypto.subtle });
      console.log('Verification result:', result);
      console.log('\n❌ HYPOTHESIS NOT CONFIRMED: No error occurred during verification.');
    } catch (error) {
      console.error('\nError during signature verification:', error);

      // Check if the error matches our hypothesis
      if (error instanceof Error &&
          error.message &&
          error.message.includes('JWK "n" member contained a leading zero')) {
        console.log('\n✅ HYPOTHESIS CONFIRMED: The error is related to JWK "n" member containing a leading zero.');
        console.log('This confirms our hypothesis that the error occurs during signature verification when handling RSA keys with leading zeros in the modulus.');
      } else {
        console.log('\n❌ HYPOTHESIS NOT CONFIRMED: The error is different than expected.');
        console.log('Error message:', error instanceof Error ? error.message : String(error));
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testHypothesis().then(() => console.log('\nTest completed'));
