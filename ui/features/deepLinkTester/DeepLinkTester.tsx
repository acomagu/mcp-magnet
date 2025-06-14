import React, { useState } from 'react';
import './DeepLinkTester.css'; // 修正: 適切なCSSをインポート

interface DeepLinkTesterProps {
  onTestDeepLink: (url: string) => void;
}

/**
 * ディープリンクをテストするためのUIコンポーネント
 * テスト環境ではディープリンクを直接呼び出せないため、この
 * コンポーネントを使用してテスト用のURLを入力し処理をシミュレートします。
 */
function DeepLinkTester({ onTestDeepLink }: DeepLinkTesterProps) {
  // Helper to create the deep link URL
  const createManifestUrl = (manifestData: object): string => {
    const jsonString = JSON.stringify(manifestData);
    const encodedJson = encodeURIComponent(jsonString);
    return `mcp-magnet://install?manifest=${encodedJson}`;
  };

  // Define preset manifest data
  const presetManifests = [
    { // Preset 1: deno-allow-all
      name: "deno-allow-all",
      command: "deno",
      args: ["-A", "https://deno.land/std@0.224.0/examples/welcome.ts"]
    },
    { // Preset 2: deno-specific-perms
      name: "deno-specific-perms",
      command: "deno",
      args: ["--allow-read=/tmp", "--allow-net=deno.land", "https://deno.land/std@0.224.0/examples/curl.ts", "https://deno.land/"]
    },
    { // Preset 3: env-test-deno
      name: "env-test-deno",
      command: "deno",
      args: ["-A", "script.js"], // Assuming a local script.js for testing env vars
      env: {
        "FOO_ENV": {
          type: "text",
          description: "Set foo value.",
          required: false
        },
        "BAR_ENV": {
          type: "select",
          description: "Choose your No.1 favorite fruit.",
          options: [
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" }
          ]
        },
        "HOGE_ENV": {
          type: "boolean",
          description: "Just select on or off."
        }
      }
    }
  ];

  // Generate preset URLs from manifest data
  const presetUrls = presetManifests.map(createManifestUrl);

  // Default URL state using the first preset
  const [testUrl, setTestUrl] = useState<string>(presetUrls[0]);
  // Removed stray bracket ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testUrl.trim()) {
      try {
        // Tauriコマンドをインポート
        const { invoke } = await import('@tauri-apps/api/core');

        // Rustの関数を呼び出して新しいウィンドウを開く
        // target='claude' をデフォルトとして設定
        await invoke('open_deeplink_dialog', {
          deeplinkUrl: testUrl,
          target: 'claude'
        });
      } catch (error) {
        console.error('Failed to open deep link dialog:', error);
        // エラーが発生した場合は親コンポーネントに通知
        onTestDeepLink(testUrl);
      }
    }
  };

  return (
    <div className="deep-link-tester theme-system">
      <div className="deep-link-tester-content tester-content">
        <h2>Deep Link Tester</h2>
        <p className="deep-link-tester-description tester-description">テスト用のディープリンクURLを入力または選択してください。</p>

        <form onSubmit={handleSubmit} className="deep-link-tester-form tester-form">
          <div className="form-group deep-link-tester-form-group">
            <label htmlFor="testUrlInput">ディープリンクURL:</label>
            <input
              id="testUrlInput"
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="deep-link-tester-input tester-input"
            />
          </div>

          <div className="form-group deep-link-tester-form-group">
            <label>プリセットURL:</label>
            <div className="deep-link-tester-preset-buttons preset-buttons">
              {presetUrls.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTestUrl(url)}
                  className="deep-link-tester-preset preset"
                >
                  プリセット {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="deep-link-tester-button tester-button button">
              テストを実行
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeepLinkTester;
