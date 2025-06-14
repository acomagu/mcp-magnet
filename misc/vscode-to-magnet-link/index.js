/**
 * convert-vscode-to-mcp.js
 *
 * 使い方:
 *   node convert-vscode-to-mcp.js "<https://insiders.vscode.dev/redirect/mcp/install?...>"
 *
 * 出力:
 *   mcp-magnet://install?manifest=...
 */

const { URL } = require('url');

// ────────────────────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────────────────────
const typeMap = {
  promptString: 'text',
  promptBoolean: 'boolean',
  pickString:   'select',
};

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const toBase64Url = (buf) =>
  buf.toString('base64')
     .replace(/\+/g, '-')
     .replace(/\//g, '_')
     .replace(/=+$/, '');   // padding 無し

// ────────────────────────────────────────────────────────────
// 本体
// ────────────────────────────────────────────────────────────
if (process.argv.length < 3) {
  console.error('Usage: node convert-vscode-to-mcp.js "<url>"');
  process.exit(1);
}

const src = process.argv[2];
const u   = new URL(src);

// 1) 基本パラメータを取得
const name   = u.searchParams.get('name')   ?? 'app';
const inputs = JSON.parse(u.searchParams.get('inputs') ?? '[]');
const config = JSON.parse(u.searchParams.get('config') ?? '{}');

// 2) env 定義を組み立て
const env = {};
for (const [key, val] of Object.entries(config.env ?? {})) {
  const m = /input:([^}\s]+)/.exec(val);
  if (!m) continue;                    // 文字列置換でなければそのままスキップ

  const inputId   = m[1];
  const inputSpec = inputs.find((i) => i.id === inputId);
  if (!inputSpec) continue;            // 対応する入力が無ければスキップ

  const spec = {
    type:        typeMap[inputSpec.type] ?? 'text',
    description: inputSpec.description  ?? '',
    required:    !!inputSpec.required,
  };

  // pickString → options 配列を変換
  if (spec.type === 'select' && Array.isArray(inputSpec.options)) {
    spec.options = inputSpec.options.map((o) =>
      typeof o === 'string' ? { label: o, value: o } : o
    );
  }

  env[key] = spec;
}

// 3) マニフェストを作成
const manifest = {
  name,
  displayName: titleCase(name),
  command: config.command,
  args:    config.args ?? [],
  env,
  manifestVersion: '1.0.0',
};

// 4) URL-safe Base64 にエンコードして出力
const encoded = toBase64Url(Buffer.from(JSON.stringify(manifest)));
console.log(`mcp-magnet://install?manifest=${encoded}`);
