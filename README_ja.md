# MCP Magnet

[English version here](README.md)

MCP Magnetは、Model Context Protocol(MCP)サーバーのインストールと管理を容易にするローカルアプリケーションです。

<p align="center">
  <a href="https://github.com/acomagu/mcp-magnet/releases/latest">
    <img src="logo.png" alt="MCP Magnetロゴ" width="200" />
    <br />
    <i>Download Now!</i>
  </a>
</p>

## MCP Magnetとは？

MCP Magnetは、ユーザーがJSONファイルを直接編集することなく、MCPサーバーを簡単にインストール、設定、管理できるアプリケーションです。特に以下のような機能を提供します：

- **1クリックインストール** - Deep Linkにより、MCPサーバーを簡単にインストール
- **カスタムマニフェスト** - 誰でもリンクを作成して共有可能 - **[Link Generator](https://playground.mcpmagnet.app)**
- **パーミッション情報の表示** - ローカルで動作するMCPサーバーのパーミッション情報を簡単に確認(現在Denoのみ対応)
- **ランタイムの自動インストール** - MCPサーバーの実行に必要なランタイムを自動で確認/可能であれば(ユーザーに確認後)自動でインストール(現在Denoのみ対応)
- **完全ローカル動作** - 独自のサーバーと通信せず、単純にローカルで動作[^1]

[^1]: Magnet Linkを踏むとゲートウェイページ(open.mcpmagnet.app)を経由することがありますが、これは「GitHubやVSCode MarketplaceのREADMEがカスタムスキーマリンクをサポートしない」「MCP Magnetをインストールしていないユーザーにインストールの案内をするため」の2点の理由によるものです。このページがユーザーデータを収集することはありません。

下記は今後対応予定の機能です:

- バイナリの自動ダウンロード: MCPサーバーのバイナリを自動でダウンロード
- インストール済みのMCPサーバーの管理
- Runtime Modifier: MCPサーバーの実行に好きなコンテナ技術を選択可能にする(Docker / Deno / sandbox-execなど)
- クロスデバイス同期: MCPサーバーの設定を複数のデバイス間で同期(Google Driveなどのクラウドストレージを使用)
- MCPサーバーのアップデート通知: 新しいバージョンがリリースされた際に通知
- 各種ランタイム/コンテナ技術のサポート

### コンセプト

- ユーザーが簡単にMCPサーバーをインストール可能にする
- 開発者がMCPサーバーの配布を容易にする
- セキュリティ/プライバシー情報を可視化する
- ロックイン無し - Manifest仕様を安定化し、MCP Magnet以外でもインストール可能にする

## お試し用リンク

[MCP Magnetをインストール](https://github.com/acomagu/mcp-magnet/releases/latest)した状態で、下記のリンクをクリックすると、MCPサーバーをインストールするためのダイアログが表示されます:

- [Slack](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoic2xhY2siLCJkaXNwbGF5TmFtZSI6IlNsYWNrIiwiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXNsYWNrIl0sImVudiI6eyJTTEFDS19CT1RfVE9LRU4iOnsidHlwZSI6InRleHQiLCJkZXNjcmlwdGlvbiI6IlNsYWNrIEJvdCBVc2VyIE9BdXRoIFRva2VuIChzdGFydHMgd2l0aCB4b3hiLSkiLCJyZXF1aXJlZCI6dHJ1ZX0sIlNMQUNLX1RFQU1fSUQiOnsidHlwZSI6InRleHQiLCJkZXNjcmlwdGlvbiI6IlNsYWNrIHdvcmtzcGFjZSBJRCAoc3RhcnRzIHdpdGggVCkiLCJyZXF1aXJlZCI6dHJ1ZX0sIlNMQUNLX0NIQU5ORUxfSURTIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJDb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBjaGFubmVsIElEcyB0byBsaW1pdCBhY2Nlc3MiLCJyZXF1aXJlZCI6ZmFsc2V9fSwiZGVzY3JpcHRpb24iOiJJbnRlcmFjdCB3aXRoIFNsYWNrIHdvcmtzcGFjZXMgdmlhIHRoZSBTbGFjayBBUEkuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXNsYWNrIn0=)
- [Google Drive](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ29vZ2xlLWRyaXZlIiwiZGlzcGxheU5hbWUiOiJHb29nbGUgRHJpdmUiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2RyaXZlIl0sImVudiI6eyJHRFJJVkVfQ1JFREVOVElBTFNfUEFUSCI6eyJ0eXBlIjoidGV4dCIsImRlc2NyaXB0aW9uIjoiUGF0aCB0byBzYXZlZCBPQXV0aCBjcmVkZW50aWFscyBKU09OIiwicmVxdWlyZWQiOnRydWV9LCJHRFJJVkVfT0FVVEhfUEFUSCI6eyJ0eXBlIjoidGV4dCIsImRlc2NyaXB0aW9uIjoiUGF0aCB0byBHb29nbGUgT0F1dGgga2V5cyBKU09OIiwicmVxdWlyZWQiOnRydWV9fSwiZGVzY3JpcHRpb24iOiJTZWFyY2ggYW5kIGFjY2VzcyBHb29nbGUgRHJpdmUgZmlsZXMgaW4gcmVhZC1vbmx5IG1vZGUuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLWdkcml2ZSJ9)
- [Google Maps](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ29vZ2xlLW1hcHMiLCJkaXNwbGF5TmFtZSI6Ikdvb2dsZSBNYXBzIiwiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLWdvb2dsZS1tYXBzIl0sImVudiI6eyJHT09HTEVfTUFQU19BUElfS0VZIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJHb29nbGUgTWFwcyBBUEkga2V5IiwicmVxdWlyZWQiOnRydWV9fSwiZGVzY3JpcHRpb24iOiJHZW9jb2RpbmcsIHBsYWNlIHNlYXJjaCwgZGlyZWN0aW9ucyB2aWEgR29vZ2xlIE1hcHMgQVBJLiIsIm1hbmlmZXN0VmVyc2lvbiI6IjEuMCIsIm1hbmlmZXN0QXV0aG9yIjoiQW50aHJvcGljIiwidXJsIjoiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvQG1vZGVsY29udGV4dHByb3RvY29sL3NlcnZlci1nb29nbGUtbWFwcyJ9)
- [GitHub](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ2l0aHViIiwiZGlzcGxheU5hbWUiOiJHaXRIdWIiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2l0aHViIl0sImVudiI6eyJHSVRIVUJfUEVSU09OQUxfQUNDRVNTX1RPS0VOIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJHaXRIdWIgUGVyc29uYWwgQWNjZXNzIFRva2VuIHdpdGggcmVwbyBzY29wZSIsInJlcXVpcmVkIjp0cnVlfX0sImRlc2NyaXB0aW9uIjoiTWFuYWdlIHJlcG9zaXRvcmllcywgaXNzdWVzLCBhbmQgZmlsZXMgdmlhIEdpdEh1YiBBUEkuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJHaXRIdWIiLCJ1cmwiOiJodHRwczovL2dpdGh1Yi5jb20vZ2l0aHViL2dpdGh1Yi1tY3Atc2VydmVyIn0=)
- [GitLab](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ2l0bGFiIiwiZGlzcGxheU5hbWUiOiJHaXRMYWIiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2l0bGFiIl0sImVudiI6eyJHSVRMQUJfUEVSU09OQUxfQUNDRVNTX1RPS0VOIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJHaXRMYWIgUGVyc29uYWwgQWNjZXNzIFRva2VuIiwicmVxdWlyZWQiOnRydWV9LCJHSVRMQUJfQVBJX1VSTCI6eyJ0eXBlIjoidGV4dCIsImRlc2NyaXB0aW9uIjoiR2l0TGFiIEFQSSBVUkwgKGRlZmF1bHQgaHR0cHM6Ly9naXRsYWIuY29tL2FwaS92NCkiLCJyZXF1aXJlZCI6ZmFsc2V9fSwiZGVzY3JpcHRpb24iOiJQcm9qZWN0IGFuZCByZXBvIG9wZXJhdGlvbnMgdGhyb3VnaCB0aGUgR2l0TGFiIEFQSS4iLCJtYW5pZmVzdFZlcnNpb24iOiIxLjAiLCJtYW5pZmVzdEF1dGhvciI6IkFudGhyb3BpYyIsInVybCI6Imh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL0Btb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2l0bGFiIn0=)
- [PostgreSQL](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoicG9zdGdyZXMiLCJkaXNwbGF5TmFtZSI6IlBvc3RncmVTUUwiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItcG9zdGdyZXMiLCJwb3N0Z3Jlc3FsOi8vbG9jYWxob3N0L215ZGIiXSwiZGVzY3JpcHRpb24iOiJSZWFkLW9ubHkgU1FMIGFjY2VzcyB0byBhIFBvc3RncmVTUUwgZGF0YWJhc2UuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXBvc3RncmVzIn0=)
- [Redis](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoicmVkaXMiLCJkaXNwbGF5TmFtZSI6IlJlZGlzIiwiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXJlZGlzIiwicmVkaXM6Ly9sb2NhbGhvc3Q6NjM3OSJdLCJlbnYiOnsiUkVESVNfVVJMIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJSZWRpcyBjb25uZWN0aW9uIFVSTCAoZS5nLiByZWRpczovL2xvY2FsaG9zdDo2Mzc5KSIsInJlcXVpcmVkIjpmYWxzZX19LCJkZXNjcmlwdGlvbiI6IktleS12YWx1ZSBvcGVyYXRpb25zIG9uIGEgUmVkaXMgZGF0YWJhc2UuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXJlZGlzIn0=)
- [Puppeteer](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoicHVwcGV0ZWVyIiwiZGlzcGxheU5hbWUiOiJQdXBwZXRlZXIiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItcHVwcGV0ZWVyIl0sImVudiI6eyJQVVBQRVRFRVJfTEFVTkNIX09QVElPTlMiOnsidHlwZSI6InRleHQiLCJkZXNjcmlwdGlvbiI6IkpTT04gc3RyaW5nIG9mIFB1cHBldGVlciBsYXVuY2ggb3B0aW9ucyIsInJlcXVpcmVkIjpmYWxzZX0sIkFMTE9XX0RBTkdFUk9VUyI6eyJ0eXBlIjoiYm9vbGVhbiIsImRlc2NyaXB0aW9uIjoiUGVybWl0IHBvdGVudGlhbGx5IHVuc2FmZSBsYXVuY2ggZmxhZ3MiLCJyZXF1aXJlZCI6ZmFsc2V9fSwiZGVzY3JpcHRpb24iOiJIZWFkbGVzcy1DaHJvbWUgYXV0b21hdGlvbiBhbmQgd2ViIHNjcmFwaW5nLiIsIm1hbmlmZXN0VmVyc2lvbiI6IjEuMCIsIm1hbmlmZXN0QXV0aG9yIjoiQW50aHJvcGljIiwidXJsIjoiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvQG1vZGVsY29udGV4dHByb3RvY29sL3NlcnZlci1wdXBwZXRlZXIifQ==)
- [Git](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ2l0IiwiZGlzcGxheU5hbWUiOiJHaXQiLCJjb21tYW5kIjoidXZ4IiwiYXJncyI6WyJtY3Atc2VydmVyLWdpdCIsIi0tcmVwb3NpdG9yeSIsIi9wYXRoL3RvL2dpdC9yZXBvIl0sImRlc2NyaXB0aW9uIjoiU2VhcmNoIGFuZCBtb2RpZnkgbG9jYWwgR2l0IHJlcG9zaXRvcmllcy4iLCJtYW5pZmVzdFZlcnNpb24iOiIxLjAiLCJtYW5pZmVzdEF1dGhvciI6IkFudGhyb3BpYyIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9tb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXJzL3RyZWUvbWFpbi9zcmMvZ2l0In0=)

## 独自のMCP Magnetリンクの作成

**[MCP Link Generator](https://playground.mcpmagnet.app)をご利用ください。**

*現在Alpha版のため、Manifestのスキーマは安定していません。安定版のリリースまで変更される可能性があります。*

## サポートされているMCPクライアント

- Claude Desktop
- Claude Code
- Cursor

[追加をリクエスト](https://github.com/acomagu/mcp-magnet/issues/new)

## コミュニティとサポート

- [GitHub Issues](https://github.com/acomagu/mcp-magnet/issues) - バグ報告や機能リクエスト
- [Discussions](https://github.com/acomagu/mcp-magnet/discussions) - 質問やアイデアの共有

## ライセンス

[MITライセンス](LICENSE)
