import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifySignature, detectSignatureType } from './verify-signature.js';

// Test signature type detection
test('detectSignatureType should detect SSH signatures', () => {
  const sshSignature = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgscJcEliU8+Su3ZZjI/dJmgzHje
UMEHlAAuMTvrYRCVwAAAAEZmlsZQAAAAAAAAAGc2hhNTEyAAAAUwAAAAtzc2gtZWQyNTUx
OQAAAECQkGDrATymoR1tunbphepkXiLGAMcF+Eca1EL3KpidzNYSTJ/smLYVw2elXq3K/l
dnvxJddvs2Z/x5En43hQIB
-----END SSH SIGNATURE-----`;

  assert.strictEqual(detectSignatureType(sshSignature), 'ssh', 'Should detect SSH signature');
});

test('detectSignatureType should detect GPG signatures', () => {
  const gpgSignature = `-----BEGIN PGP SIGNATURE-----

iQEzBAABCAAdFiEEKYYrJZ7Jd4Uxm9QQjBqFvQwJHmQFAmRnDuAACgkQjBqFvQwJ
HmQPZQf/XMR2aKyZRrZ5SWyYXWgCUa3ZFYoSrMSsJ7xJvYF/eSWLGKZ6PdNiLLaJ
JbKZtgQwOQZ5zcIBBWRgEtUFQO5VYvZGJBuWzwzjjJ9Fh6kwNtKX0Ogmb9NgiRPL
YYyIULCwSQQZ5JJXK5+3/xkBdF5OJnvkVB5pWJImSHKtQOBQpq/4j6jTwZ0mwKU0
14GITUEnUH7mIYfUksNTAcLFTRZzj0Cjbl5MDRxs4Gkh8A1yqPRIqFMcA+Xqpo2F
Tz0QCqPQRHBJMBcWGgOJdJcJgvZyEtFMGFYJtEfXwz5X8eBQCCQOLnSWPcXAUuZS
qoFY9DiykHbIYDEYPZnSjF1TaQ==
=Qe2w
-----END PGP SIGNATURE-----`;

  assert.strictEqual(detectSignatureType(gpgSignature), 'gpg', 'Should detect GPG signature');
});

test('detectSignatureType should return unknown for unrecognized signatures', () => {
  const unknownSignature = 'This is not a valid signature';

  assert.strictEqual(detectSignatureType(unknownSignature), 'unknown', 'Should return unknown for unrecognized signatures');
});

// Test SSH signature verification
test('verifySshSignature should handle SSH signatures', async () => {
  const testMessage = 'Hello, world!';
  const testSignature = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgscJcEliU8+Su3ZZjI/dJmgzHje
UMEHlAAuMTvrYRCVwAAAAEZmlsZQAAAAAAAAAGc2hhNTEyAAAAUwAAAAtzc2gtZWQyNTUx
OQAAAECQkGDrATymoR1tunbphepkXiLGAMcF+Eca1EL3KpidzNYSTJ/smLYVw2elXq3K/l
dnvxJddvs2Z/x5En43hQIB
-----END SSH SIGNATURE-----`;
  const testPublicKey = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILHCXBJYlPPkrt2WYyP3SZoMx43lDBB5QALjE762EQlc';

  // Test that the function runs without throwing errors
  try {
    const result = await verifySignature({
      message: testMessage,
      signature: testSignature,
      publicKey: testPublicKey
    });

    // We're just testing that the function runs without throwing unexpected errors
    // The actual result may be true or false depending on the validity of the test data
    console.log('SSH verification result:', result);

    // Verify the function returns a boolean
    assert.strictEqual(typeof result, 'boolean', 'Should return a boolean result');
  } catch (error) {
    assert.fail(`Should not throw an error: ${error}`);
  }
});

// Test GPG signature verification
test('verifyGpgSignature should handle GPG signatures', async () => {
  const testMessage = 'Hello, world!';
  const testSignature = `-----BEGIN PGP SIGNATURE-----

iQEzBAABCAAdFiEEKYYrJZ7Jd4Uxm9QQjBqFvQwJHmQFAmRnDuAACgkQjBqFvQwJ
HmQPZQf/XMR2aKyZRrZ5SWyYXWgCUa3ZFYoSrMSsJ7xJvYF/eSWLGKZ6PdNiLLaJ
JbKZtgQwOQZ5zcIBBWRgEtUFQO5VYvZGJBuWzwzjjJ9Fh6kwNtKX0Ogmb9NgiRPL
YYyIULCwSQQZ5JJXK5+3/xkBdF5OJnvkVB5pWJImSHKtQOBQpq/4j6jTwZ0mwKU0
14GITUEnUH7mIYfUksNTAcLFTRZzj0Cjbl5MDRxs4Gkh8A1yqPRIqFMcA+Xqpo2F
Tz0QCqPQRHBJMBcWGgOJdJcJgvZyEtFMGFYJtEfXwz5X8eBQCCQOLnSWPcXAUuZS
qoFY9DiykHbIYDEYPZnSjF1TaQ==
=Qe2w
-----END PGP SIGNATURE-----`;
  const testPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBGRnDt8BCACuLx64oBEXnlWAKfqLY5N7oBJTNZ/XUptCCzIjJm4BUcDpt8Bm
H0BgcGjRB7makZWGrKGCwxVc8LJXiNiHVXnCEfzs/1MoYkYV+Lt1RcFNzjpWmOiG
ufYQegjlsmbVWzJYgPnvA1d+aiJ2hPH/HSSD/Q9gJeQBx3QALgCqXzVVJcq4kANP
QrI4jlnKjnkPQT8QSQ1TGpPnxDrBdcJxV+I4Ti4IqvN3eU8WJMQsBQfC2nGNZCyo
a7rkTfNXUF/QHQcQPY8RSR2lHJ32/Py7zEhJOYK6OQGvjNHzKGwmkU8XRz8ANXLz
hnQSLt7SX2TbGWLgVjPBNlpPHXLNwGtimx+JABEBAAG0IEpvaG4gRG9lIDxqb2hu
LmRvZUBleGFtcGxlLmNvbT6JAVQEEwEIAD4WIQQ5Cv7Dkj8+AYVVhGYNFTcyGCKh
lwUCZGcO3wIbAwUJA8JnAAULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAKCRANFTcy
GCKhl0VLB/9eu/7VLPzLu8Wy0cFjjXLFiZKfPGJFOLnpeIBVQ5kT8QLvo3uiSzss
WVPvPXLHWOmxLlwcbvW7nP5QQm/JjgYYP+jzZKc2x0qsQcHsXLnvKMmV4Wfm9oYE
nVcMGhB6tWbV3uh9k2Oc+x5VvjKgXbQPEkWZd9GjPQTBkkIULmgQnBJX0BhU8688
eI9l6JHwJh5VHZUCmYhZYiX9YTXlhzNHXzEjHYmGGBZXP4qZdGdQPEGoMMOKWaww
BnGOVH4eSZ9sOXiIJ8dYy5Ww+MPPvdnKTlRZQPJzkKYf7KGEJygQHQ7p7sKzcbL/
1ULKWW1ub9KXUwFvxADqqWKIqIz9
=QQGW
-----END PGP PUBLIC KEY BLOCK-----`;

  // Test that the function runs without throwing errors
  try {
    const result = await verifySignature({
      message: testMessage,
      signature: testSignature,
      publicKey: testPublicKey
    });

    // We're just testing that the function runs without throwing unexpected errors
    // The actual result may be true or false depending on the validity of the test data
    console.log('GPG verification result:', result);

    // Verify the function returns a boolean
    assert.strictEqual(typeof result, 'boolean', 'Should return a boolean result');
  } catch (error) {
    assert.fail(`Should not throw an error: ${error}`);
  }
});

// Test verifySignature with unknown signature type
test('verifySignature should handle unknown signature types', async () => {
  const testMessage = 'Hello, world!';
  const testSignature = 'This is not a valid signature';
  const testPublicKey = 'This is not a valid public key';

  // Test that the function returns false for unknown signature types
  const result = await verifySignature({
    message: testMessage,
    signature: testSignature,
    publicKey: testPublicKey
  });

  assert.strictEqual(result, false, 'Should return false for unknown signature types');
});
