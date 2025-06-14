'use server';

export async function getKeys(username: string) {
  const result: string[] = [];

  // 1) SSH keys (.keys) — 1 行に 1 鍵
  try {
    const sshUrl = `https://github.com/${username}.keys`;
    const resp = await fetch(sshUrl);
    if (resp.ok) {
      const text = await resp.text();
      text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('ssh-') || line.length > 0)
        .forEach(line => {
          if (line) result.push(line);
        });
    }
  } catch (e) {
    console.warn(`fetch SSH keys error for ${username}:`, e);
  }

  // 2) GPG keys (.gpg) — 一つのアーマーに複数キーがまとまっている可能性あり
  try {
    const gpgUrl = `https://github.com/${username}.gpg`;
    const resp = await fetch(gpgUrl);
    if (resp.ok) {
      const armoredAll = await resp.text();
      result.push(armoredAll);
    }
  } catch (e) {
    console.warn(`fetch GPG keys error for ${username}:`, e);
  }

  return result;
}
