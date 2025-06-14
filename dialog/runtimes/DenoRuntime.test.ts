import { describe, it, expect } from 'vitest';
import { DenoRuntime } from './DenoRuntime';

/**
 * Utility to create a DenoRuntime with minimal stubs.
 */
function makeRuntime() {
  const dummyExecutor = {
    // minimal stub that satisfies the ShellExecutorService interface
    execute: async () => ({ code: 0, stdout: '', stderr: '' })
  } as any;

  return new DenoRuntime('macos', dummyExecutor);
}

/**
 * Comprehensive behaviour‑driven tests for DenoRuntime#getPermissionInfo().
 *
 * These tests cover:
 *   1. No flags (default sandbox)
 *   2. Individual allow flags before the script name
 *   3. -A / --allow-all before the script name
 *   4. Flags placed *after* the script name must be ignored
 *   5. Scoped permissions with =value
 *   6. Comma‑separated scopes
 *   7. Non‑permission runtime flags should be ignored
 *   8. (TODO) deny‑* flags overriding allow‑* (requires implementation change)
 */

describe('DenoRuntime#getPermissionInfo', () => {
  it('returns default when no permission flags are provided', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo(['script.ts']);

    expect(info?.allowAll).toBe(false);
    expect(info?.permissions).toEqual([
      '🔒 Default (No specific permissions requested)'
    ]);
  });

  it('parses individual allow flags before the script name', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo([
      '--allow-read',
      '--allow-net=example.com',
      'script.ts'
    ]);

    expect(info?.allowAll).toBe(false);
    expect(info?.permissions).toEqual(
      expect.arrayContaining([
        '📂 ファイル読み取り',
        '🌐 ネットワーク: example.com'
      ])
    );
  });

  it('detects allow‑all when -A is placed before the script name', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo(['-A', 'script.ts']);

    expect(info?.allowAll).toBe(true);
  });

  it('ignores permission‑looking flags that appear after the script name', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo(['script.ts', '-A']);

    expect(info?.allowAll).toBe(false);
    expect(info?.permissions).toEqual([
      '🔒 Default (No specific permissions requested)'
    ]);
  });

  it('parses scoped permissions correctly', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo([
      '--allow-write=tmp',
      'script.ts'
    ]);

    expect(info?.permissions).toContain('💾 ファイル書き込み: tmp');
  });

  it('handles multiple comma‑separated scopes', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo([
      '--allow-net=example.com,api.example.com:443',
      'script.ts'
    ]);

    expect(info?.permissions).toEqual(
      expect.arrayContaining([
        '🌐 ネットワーク: example.com',
        '🌐 ネットワーク: api.example.com:443'
      ])
    );
  });

  it('ignores non‑permission runtime flags such as --watch', () => {
    const rt = makeRuntime();
    const info = rt.getPermissionInfo(['--watch', 'script.ts']);

    expect(info?.permissions).toEqual([
      '🔒 Default (No specific permissions requested)'
    ]);
  });

  it.todo('respects deny‑* flags overriding allow‑* (requires implementation)');
});
