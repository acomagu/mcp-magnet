import "@mcp-magnet/styles/components.css";
import React, { Suspense, useState } from "react";
import Notification from '../Notification';
import DeepLinkTester from "./DeepLinkTester";
import "./page.css";

/**
 * DeepLinkTesterPage - 開発時のみ使用するディープリンクテスト用の専用ページ
 *
 * このページは開発環境でのディープリンクテストのために設計されており、
 * 本番環境では使用されません。
 */
function DeepLinkTesterPage() {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // テスターからのディープリンクを処理する関数
  const handleTestDeepLink = async (url: string) => {
    console.log("Test deep link:", url);
    try {
      // Tauriコマンドをインポート
      const { invoke } = await import('@tauri-apps/api/core');

      // Rustの関数を呼び出して新しいウィンドウを開く
      await invoke('open_deeplink_dialog', {
        deeplink_url: url // Pass only the URL, target is optional in Rust
      });

      // 通知を表示
      showNotification('ディープリンクダイアログを開きました', 'info');
    } catch (error) {
      console.error('Failed to open deep link dialog from tester:', error);
      showNotification('ディープリンクの処理に失敗しました', 'error');
    }
  };

  // 通知を表示する関数
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  // 通知を閉じる関数
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <Suspense fallback="Loading...">
      {/* Use consolidated container class */}
      <main className="container deeplink-tester-container">
        <h1>ディープリンクテスター</h1>
        {/* Keep global description class */}
        <p className="description">
          開発環境で使用するディープリンクテスト用ツールです。様々なディープリンクパターンをテストできます。
        </p>

        {/* ディープリンクテスターコンポーネント */}
        {/* Use consolidated panel class */}
        <div className="panel tester-wrapper">
          <DeepLinkTester onTestDeepLink={handleTestDeepLink} />
        </div>

        {/* 通知コンポーネント */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </main>
    </Suspense>
  );
}

export default DeepLinkTesterPage;
