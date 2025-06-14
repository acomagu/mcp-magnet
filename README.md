# MCP Magnet

[日本語版はこちら](README_ja.md)

MCP Magnet is a local application that makes it easy to install and manage Model Context Protocol (MCP) servers.

<p align="center">
  <a href="https://github.com/acomagu/mcp-magnet/releases/latest">
    <img src="logo.png" alt="MCP Magnet logo" width="200" />
    <br />
    <i>Download Now!</i>
  </a>
</p>

## What is MCP Magnet?

MCP Magnet lets you install, configure, and manage an MCP server without ever editing a JSON file by hand. Its key features include:

- **One-click install** – Quickly install an MCP server via a deep link
- **Custom manifests** – Anyone can create and share links — **[Link Generator](https://playground.mcpmagnet.app)**
- **Permission overview** – Check what permissions a local MCP server requires (currently Deno only)
- **Runtime auto-install** – Detects and, with your confirmation, installs the runtime needed to run the MCP server (currently Deno only)
- **Fully local operation** – Works entirely on your machine with no calls to proprietary servers[^1]

[^1]: When you follow a magnet link you may be routed through the gateway page (open.mcpmagnet.app). This happens for two reasons: (1) GitHub and the VS Code Marketplace README views don’t support custom-scheme links, and (2) users who don’t have MCP Magnet installed need installation guidance. The gateway page never collects any user data.

### Features in development

- Automatic download of MCP server binaries
- Management UI for already-installed MCP servers
- Runtime Modifier – Choose your favourite container/runner for the MCP server (Docker / Deno / sandbox-exec, etc.)
- Cross-device sync – Sync MCP server settings across devices (e.g. via Google Drive)
- Update notifications when a new MCP server version is released
- Support for additional runtimes / container technologies

### Concept

- Make it effortless for users to install an MCP server
- Make distribution of MCP servers easy for developers
- Surface security and privacy information
- No lock-in – Stabilise the manifest spec so other installers can implement it too

## Try-it-out links

After [installing MCP Magnet](https://github.com/acomagu/mcp-magnet/releases/latest), click any of the links below to open an installation dialog for an MCP server:

- [Google Drive](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ29vZ2xlLWRyaXZlIiwiZGlzcGxheU5hbWUiOiJHb29nbGUgRHJpdmUiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2RyaXZlIl0sImVudiI6eyJHRFJJVkVfQ1JFREVOVElBTFNfUEFUSCI6eyJ0eXBlIjoidGV4dCIsImRlc2NyaXB0aW9uIjoiUGF0aCB0byBzYXZlZCBPQXV0aCBjcmVkZW50aWFscyBKU09OIiwicmVxdWlyZWQiOnRydWV9LCJHRFJJVkVfT0FVVEhfUEFUSCI6eyJ0eXBlIjoidGV4dCIsImRlc2NyaXB0aW9uIjoiUGF0aCB0byBHb29nbGUgT0F1dGgga2V5cyBKU09OIiwicmVxdWlyZWQiOnRydWV9fSwiZGVzY3JpcHRpb24iOiJTZWFyY2ggYW5kIGFjY2VzcyBHb29nbGUgRHJpdmUgZmlsZXMgaW4gcmVhZC1vbmx5IG1vZGUuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLWdkcml2ZSJ9)
- [Google Maps](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ29vZ2xlLW1hcHMiLCJkaXNwbGF5TmFtZSI6Ikdvb2dsZSBNYXBzIiwiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLWdvb2dsZS1tYXBzIl0sImVudiI6eyJHT09HTEVfTUFQU19BUElfS0VZIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJHb29nbGUgTWFwcyBBUEkga2V5IiwicmVxdWlyZWQiOnRydWV9fSwiZGVzY3JpcHRpb24iOiJHZW9jb2RpbmcsIHBsYWNlIHNlYXJjaCwgZGlyZWN0aW9ucyB2aWEgR29vZ2xlIE1hcHMgQVBJLiIsIm1hbmlmZXN0VmVyc2lvbiI6IjEuMCIsIm1hbmlmZXN0QXV0aG9yIjoiQW50aHJvcGljIiwidXJsIjoiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvQG1vZGVsY29udGV4dHByb3RvY29sL3NlcnZlci1nb29nbGUtbWFwcyJ9)
- [GitHub](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ2l0aHViIiwiZGlzcGxheU5hbWUiOiJHaXRIdWIiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2l0aHViIl0sImVudiI6eyJHSVRIVUJfUEVSU09OQUxfQUNDRVNTX1RPS0VOIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJHaXRIdWIgUGVyc29uYWwgQWNjZXNzIFRva2VuIHdpdGggcmVwbyBzY29wZSIsInJlcXVpcmVkIjp0cnVlfX0sImRlc2NyaXB0aW9uIjoiTWFuYWdlIHJlcG9zaXRvcmllcywgaXNzdWVzLCBhbmQgZmlsZXMgdmlhIEdpdEh1YiBBUEkuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJHaXRIdWIiLCJ1cmwiOiJodHRwczovL2dpdGh1Yi5jb20vZ2l0aHViL2dpdGh1Yi1tY3Atc2VydmVyIn0=)
- [GitLab](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ2l0bGFiIiwiZGlzcGxheU5hbWUiOiJHaXRMYWIiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2l0bGFiIl0sImVudiI6eyJHSVRMQUJfUEVSU09OQUxfQUNDRVNTX1RPS0VOIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJHaXRMYWIgUGVyc29uYWwgQWNjZXNzIFRva2VuIiwicmVxdWlyZWQiOnRydWV9LCJHSVRMQUJfQVBJX1VSTCI6eyJ0eXBlIjoidGV4dCIsImRlc2NyaXB0aW9uIjoiR2l0TGFiIEFQSSBVUkwgKGRlZmF1bHQgaHR0cHM6Ly9naXRsYWIuY29tL2FwaS92NCkiLCJyZXF1aXJlZCI6ZmFsc2V9fSwiZGVzY3JpcHRpb24iOiJQcm9qZWN0IGFuZCByZXBvIG9wZXJhdGlvbnMgdGhyb3VnaCB0aGUgR2l0TGFiIEFQSS4iLCJtYW5pZmVzdFZlcnNpb24iOiIxLjAiLCJtYW5pZmVzdEF1dGhvciI6IkFudGhyb3BpYyIsInVybCI6Imh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL0Btb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItZ2l0bGFiIn0=)
- [PostgreSQL](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoicG9zdGdyZXMiLCJkaXNwbGF5TmFtZSI6IlBvc3RncmVTUUwiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItcG9zdGdyZXMiLCJwb3N0Z3Jlc3FsOi8vbG9jYWxob3N0L215ZGIiXSwiZGVzY3JpcHRpb24iOiJSZWFkLW9ubHkgU1FMIGFjY2VzcyB0byBhIFBvc3RncmVTUUwgZGF0YWJhc2UuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXBvc3RncmVzIn0=)
- [Redis](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoicmVkaXMiLCJkaXNwbGF5TmFtZSI6IlJlZGlzIiwiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXJlZGlzIiwicmVkaXM6Ly9sb2NhbGhvc3Q6NjM3OSJdLCJlbnYiOnsiUkVESVNfVVJMIjp7InR5cGUiOiJ0ZXh0IiwiZGVzY3JpcHRpb24iOiJSZWRpcyBjb25uZWN0aW9uIFVSTCAoZS5nLiByZWRpczovL2xvY2FsaG9zdDo2Mzc5KSIsInJlcXVpcmVkIjpmYWxzZX19LCJkZXNjcmlwdGlvbiI6IktleS12YWx1ZSBvcGVyYXRpb25zIG9uIGEgUmVkaXMgZGF0YWJhc2UuIiwibWFuaWZlc3RWZXJzaW9uIjoiMS4wIiwibWFuaWZlc3RBdXRob3IiOiJBbnRocm9waWMiLCJ1cmwiOiJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9AbW9kZWxjb250ZXh0cHJvdG9jb2wvc2VydmVyLXJlZGlzIn0=)
- [Puppeteer](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoicHVwcGV0ZWVyIiwiZGlzcGxheU5hbWUiOiJQdXBwZXRlZXIiLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXItcHVwcGV0ZWVyIl0sImVudiI6eyJQVVBQRVRFRVJfTEFVTkNIX09QVElPTlMiOnsidHlwZSI6InRleHQiLCJkZXNjcmlwdGlvbiI6IkpTT04gc3RyaW5nIG9mIFB1cHBldGVlciBsYXVuY2ggb3B0aW9ucyIsInJlcXVpcmVkIjpmYWxzZX0sIkFMTE9XX0RBTkdFUk9VUyI6eyJ0eXBlIjoiYm9vbGVhbiIsImRlc2NyaXB0aW9uIjoiUGVybWl0IHBvdGVudGlhbGx5IHVuc2FmZSBsYXVuY2ggZmxhZ3MiLCJyZXF1aXJlZCI6ZmFsc2V9fSwiZGVzY3JpcHRpb24iOiJIZWFkbGVzcy1DaHJvbWUgYXV0b21hdGlvbiBhbmQgd2ViIHNjcmFwaW5nLiIsIm1hbmlmZXN0VmVyc2lvbiI6IjEuMCIsIm1hbmlmZXN0QXV0aG9yIjoiQW50aHJvcGljIiwidXJsIjoiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvQG1vZGVsY29udGV4dHByb3RvY29sL3NlcnZlci1wdXBwZXRlZXIifQ==)
- [Git](https://open.mcpmagnet.app/install?manifest=eyJuYW1lIjoiZ2l0IiwiZGlzcGxheU5hbWUiOiJHaXQiLCJjb21tYW5kIjoidXZ4IiwiYXJncyI6WyJtY3Atc2VydmVyLWdpdCIsIi0tcmVwb3NpdG9yeSIsIi9wYXRoL3RvL2dpdC9yZXBvIl0sImRlc2NyaXB0aW9uIjoiU2VhcmNoIGFuZCBtb2RpZnkgbG9jYWwgR2l0IHJlcG9zaXRvcmllcy4iLCJtYW5pZmVzdFZlcnNpb24iOiIxLjAiLCJtYW5pZmVzdEF1dGhvciI6IkFudGhyb3BpYyIsInVybCI6Imh0dHBzOi8vZ2l0aHViLmNvbS9tb2RlbGNvbnRleHRwcm90b2NvbC9zZXJ2ZXJzL3RyZWUvbWFpbi9zcmMvZ2l0In0=)

## Create your own MCP Magnet link

**Use the [MCP Link Generator](https://playground.mcpmagnet.app)**.

*The manifest schema is still in alpha and may change without notice.*

## Supported MCP clients

- Claude Desktop
- Claude Code
- Cursor

[Request an addition](https://github.com/acomagu/mcp-magnet/issues/new)

## Community & support

- **[GitHub Issues](https://github.com/acomagu/mcp-magnet/issues)** – Bug reports and feature requests
- **[Discussions](https://github.com/acomagu/mcp-magnet/discussions)** – Questions and ideas

## License

Released under the [MIT License](LICENSE).
