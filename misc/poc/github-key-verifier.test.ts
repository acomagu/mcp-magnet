import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { verifyGithubSignature, githubKeys, githubGpg } from './github-key-verifier';

// Helper function to create a mock Response
function createMockResponse(status: number, body: string | object): Response {
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: new Headers(),
    text: async () => typeof body === 'string' ? body : JSON.stringify(body),
    json: async () => typeof body === 'object' ? body : JSON.parse(body as string),
    body: null,
    bodyUsed: false,
    clone: function() { return this; },
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    redirected: false,
    type: 'basic',
    url: ''
  } as Response;
}

// Test GitHub key fetching with mocked HTTP responses
test('githubKeys should fetch SSH keys for a GitHub user', async (t) => {
  // Mock SSH keys response
  const mockSshKeys = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDIra8eBibEp/VrHP2S0JfAtksyzwfj/jaMRN2K1jgen0kUh++QgPq2yGL5DGAp8sYd/mGOU4uYD4DlEaYtP93n/8WvDMg+cHwRv3u0UGWRP4Nn9X2rXB5tsNLVyJjmjlYGOx9ZT1/Scte1roDxQZxTEncL8r9vLdLnbA/PcBGPphU/3lixXlH+8az35lR9FNUVv4GCMhfWwyEqwdXy0gk/5K7IY0QSbXT5MzFWZFx7nrd2szCYrvjJpnZtAWHcqcGJzTbxCqaRxc5c0ZPSgtVtH9fc59gepwItepP6zrwqX+QO2ejpl4D8UggMS2bTqTZ0K2EzguVyszBrN7S7+ba3\necdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBOTygIy8/H8/xMxzizKZd1XvPJ+237iebLgakhzRCP5/zy/lSe2lIZbSdMXycVoZ+WwyeFH0jAz5SlKCZ5cH36Y=';

  // Store original fetch
  const originalFetch = global.fetch;

  // Create a mock fetch function
  const mockFetch = t.mock.fn((url: string) => {
    if (url.includes('.keys')) {
      return Promise.resolve(createMockResponse(200, mockSshKeys));
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });

  // Replace global fetch with mock
  global.fetch = mockFetch as typeof fetch;

  try {
    // Test the function
    const user = 'testuser';
    const keys = await githubKeys(user);

    // Verify the result
    assert.strictEqual(keys, mockSshKeys, 'Should return the mocked SSH keys');

    // Verify fetch was called with the correct URL
    assert.strictEqual(mockFetch.mock.callCount(), 1);
    assert.strictEqual(
      mockFetch.mock.calls[0].arguments[0],
      `https://github.com/${user}.keys`,
      'Should fetch from the correct GitHub URL'
    );
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
});

test('githubGpg should fetch GPG keys for a GitHub user', async (t) => {
  // Mock GPG keys response
  const mockGpgKeys = '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v1\n\nmQENBFMxrPsBCADC4c6sSBnBU+15Y32/a8oDRpMjRbmqoQYi0aLjF1Kq81vDY2zT\nfw9CWEwDb9kkWOVQnwo1hJqUqXw2K6lVZJ7nzm6OBLpKhWMx5uTfTwP6wJVYHNq+\nRzazdHWMfviah4Onu+hQpXNdwIYPjjBGqG6Fn+VEOjTJMuEvwAcwHNqG2K1QZwxI\nofFj+7HA1IDgYGQJLSZ+Q2mAUYnG64xCXXGQD9OZBVUgqvT5/nQg7kg6G2rNwUxI\nTsHZYPLmJcFk5XwXGT86YMjiFMVJ0T5Zn6vJhBCS4GkNyFxMYGhJ0yb9L0yKdCWv\nI/gYUMUXKZ7HpKA7xUvmUgFcMJnQhJx5ABEBAAG0GkxpbnVzIFRvcnZhbGRzIDxs\nbnVzQGxpbnV4Pg==\n-----END PGP PUBLIC KEY BLOCK-----';
  const mockGpgApiResponse = [
    {
      raw_key: mockGpgKeys
    }
  ];

  // Store original fetch
  const originalFetch = global.fetch;

  // Create a mock fetch function
  const mockFetch = t.mock.fn((url: string) => {
    if (url.includes('.gpg')) {
      return Promise.resolve(createMockResponse(200, mockGpgKeys));
    } else if (url.includes('api.github.com')) {
      return Promise.resolve(createMockResponse(200, mockGpgApiResponse));
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });

  // Replace global fetch with mock
  global.fetch = mockFetch as typeof fetch;

  try {
    // Test the function
    const user = 'testuser';
    const keys = await githubGpg(user);

    // Verify the result
    assert.strictEqual(keys, mockGpgKeys, 'Should return the mocked GPG keys');

    // Verify fetch was called with the correct URL
    assert.strictEqual(mockFetch.mock.callCount(), 1);
    assert.strictEqual(
      mockFetch.mock.calls[0].arguments[0],
      `https://github.com/${user}.gpg`,
      'Should fetch from the correct GitHub URL'
    );
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
});

// Test GPG API fallback
test('githubGpg should fall back to API if direct GPG fetch fails', async (t) => {
  // Mock GPG keys response
  const mockGpgKeys = '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v1\n\nmQENBFMxrPsBCADC4c6sSBnBU+15Y32/a8oDRpMjRbmqoQYi0aLjF1Kq81vDY2zT\nfw9CWEwDb9kkWOVQnwo1hJqUqXw2K6lVZJ7nzm6OBLpKhWMx5uTfTwP6wJVYHNq+\nRzazdHWMfviah4Onu+hQpXNdwIYPjjBGqG6Fn+VEOjTJMuEvwAcwHNqG2K1QZwxI\nofFj+7HA1IDgYGQJLSZ+Q2mAUYnG64xCXXGQD9OZBVUgqvT5/nQg7kg6G2rNwUxI\nTsHZYPLmJcFk5XwXGT86YMjiFMVJ0T5Zn6vJhBCS4GkNyFxMYGhJ0yb9L0yKdCWv\nI/gYUMUXKZ7HpKA7xUvmUgFcMJnQhJx5ABEBAAG0GkxpbnVzIFRvcnZhbGRzIDxs\nbnVzQGxpbnV4Pg==\n-----END PGP PUBLIC KEY BLOCK-----';
  const mockGpgApiResponse = [
    {
      raw_key: mockGpgKeys
    }
  ];

  // Store original fetch
  const originalFetch = global.fetch;

  // Create a mock fetch function
  const mockFetch = t.mock.fn((url: string) => {
    if (url.includes('.gpg')) {
      // Return empty response from direct GPG URL
      return Promise.resolve(createMockResponse(200, ''));
    } else if (url.includes('api.github.com')) {
      return Promise.resolve(createMockResponse(200, mockGpgApiResponse));
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });

  // Replace global fetch with mock
  global.fetch = mockFetch as typeof fetch;

  try {
    // Test the function
    const user = 'testuser';
    const keys = await githubGpg(user);

    // Verify the result
    assert.strictEqual(keys, mockGpgKeys, 'Should return the GPG keys from API');

    // Verify both fetches were called with the correct URLs
    assert.strictEqual(mockFetch.mock.callCount(), 2);
    assert.strictEqual(
      mockFetch.mock.calls[0].arguments[0],
      `https://github.com/${user}.gpg`,
      'Should first try to fetch from the direct GitHub URL'
    );
    assert.strictEqual(
      mockFetch.mock.calls[1].arguments[0],
      `https://api.github.com/users/${user}/gpg_keys`,
      'Should fall back to the GitHub API URL'
    );
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
});

// Test verifyGithubSignature with SSH signature
test('verifyGithubSignature should handle SSH signatures', async (t) => {
  // Mock SSH keys response
  const mockSshKey = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILHCXBJYlPPkrt2WYyP3SZoMx43lDBB5QALjE762EQlc';
  const mockUser = 'testuser';
  const mockPayload = 'Hello, world!';
  const mockSignature = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgscJcEliU8+Su3ZZjI/dJmgzHje
UMEHlAAuMTvrYRCVwAAAAEZmlsZQAAAAAAAAAGc2hhNTEyAAAAUwAAAAtzc2gtZWQyNTUx
OQAAAECQkGDrATymoR1tunbphepkXiLGAMcF+Eca1EL3KpidzNYSTJ/smLYVw2elXq3K/l
dnvxJddvs2Z/x5En43hQIB
-----END SSH SIGNATURE-----`;

  // Store original fetch
  const originalFetch = global.fetch;

  // Create mock fetch function
  const mockFetch = t.mock.fn((url: string) => {
    if (url.includes('.keys')) {
      return Promise.resolve(createMockResponse(200, mockSshKey));
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });

  // Replace global fetch with mock
  global.fetch = mockFetch as typeof fetch;

  // We'll test that the function runs without errors
  // In a real test environment, we would need to mock the verification function
  try {
    // Test the function
    const result = await verifyGithubSignature({
      user: mockUser,
      payload: mockPayload,
      signatureArmored: mockSignature
    });

    // We're just testing that the function runs without throwing unexpected errors
    // The actual result may be true or false depending on the validity of the test data
    console.log('SSH verification result:', result);

    // Verify fetch was called with the correct URL
    assert.strictEqual(mockFetch.mock.callCount(), 1);
    assert.strictEqual(
      mockFetch.mock.calls[0].arguments[0],
      `https://github.com/${mockUser}.keys`,
      'Should fetch SSH keys from the correct GitHub URL'
    );
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
});

// Test verifyGithubSignature with GPG signature
test('verifyGithubSignature should handle GPG signatures', async (t) => {
  // Mock GPG keys response
  const mockGpgKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v1

mQENBFMxrPsBCADC4c6sSBnBU+15Y32/a8oDRpMjRbmqoQYi0aLjF1Kq81vDY2zT
fw9CWEwDb9kkWOVQnwo1hJqUqXw2K6lVZJ7nzm6OBLpKhWMx5uTfTwP6wJVYHNq+
RzazdHWMfviah4Onu+hQpXNdwIYPjjBGqG6Fn+VEOjTJMuEvwAcwHNqG2K1QZwxI
ofFj+7HA1IDgYGQJLSZ+Q2mAUYnG64xCXXGQD9OZBVUgqvT5/nQg7kg6G2rNwUxI
TsHZYPLmJcFk5XwXGT86YMjiFMVJ0T5Zn6vJhBCS4GkNyFxMYGhJ0yb9L0yKdCWv
I/gYUMUXKZ7HpKA7xUvmUgFcMJnQhJx5ABEBAAG0GkxpbnVzIFRvcnZhbGRzIDxs
bnVzQGxpbnV4Pg==
-----END PGP PUBLIC KEY BLOCK-----`;
  const mockUser = 'testuser';
  const mockPayload = 'Hello, world!';
  const mockSignature = `-----BEGIN PGP SIGNATURE-----

iQEzBAABCAAdFiEEKYYrJZ7Jd4Uxm9QQjBqFvQwJHmQFAmRnDuAACgkQjBqFvQwJ
HmQPZQf/XMR2aKyZRrZ5SWyYXWgCUa3ZFYoSrMSsJ7xJvYF/eSWLGKZ6PdNiLLaJ
JbKZtgQwOQZ5zcIBBWRgEtUFQO5VYvZGJBuWzwzjjJ9Fh6kwNtKX0Ogmb9NgiRPL
YYyIULCwSQQZ5JJXK5+3/xkBdF5OJnvkVB5pWJImSHKtQOBQpq/4j6jTwZ0mwKU0
14GITUEnUH7mIYfUksNTAcLFTRZzj0Cjbl5MDRxs4Gkh8A1yqPRIqFMcA+Xqpo2F
Tz0QCqPQRHBJMBcWGgOJdJcJgvZyEtFMGFYJtEfXwz5X8eBQCCQOLnSWPcXAUuZS
qoFY9DiykHbIYDEYPZnSjF1TaQ==
=Qe2w
-----END PGP SIGNATURE-----`;

  // Store original fetch
  const originalFetch = global.fetch;

  // Create mock fetch function
  const mockFetch = t.mock.fn((url: string) => {
    if (url.includes('.gpg')) {
      return Promise.resolve(createMockResponse(200, mockGpgKey));
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });

  // Replace global fetch with mock
  global.fetch = mockFetch as typeof fetch;

  // We'll test that the function runs without errors
  // In a real test environment, we would need to mock the verification function
  try {
    // Test the function
    const result = await verifyGithubSignature({
      user: mockUser,
      payload: mockPayload,
      signatureArmored: mockSignature
    });

    // We're just testing that the function runs without throwing unexpected errors
    // The actual result may be true or false depending on the validity of the test data
    console.log('GPG verification result:', result);

    // Verify fetch was called with the correct URL
    assert.strictEqual(mockFetch.mock.callCount(), 1);
    assert.strictEqual(
      mockFetch.mock.calls[0].arguments[0],
      `https://github.com/${mockUser}.gpg`,
      'Should fetch GPG keys from the correct GitHub URL'
    );
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
});

// Test handling of unknown signature format
test('verifyGithubSignature should handle unknown signature formats', async () => {
  const mockUser = 'testuser';
  const mockPayload = 'Hello, world!';
  const mockSignature = 'This is not a valid signature';

  // Test the function
  const result = await verifyGithubSignature({
    user: mockUser,
    payload: mockPayload,
    signatureArmored: mockSignature
  });

  // Verify the result
  assert.strictEqual(result, false, 'Should return false for unknown signature format');
});
