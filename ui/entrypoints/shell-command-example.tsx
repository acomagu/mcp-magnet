import '@mcp-magnet/styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ShellCommandExample } from '../features/ShellCommandExample';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: '20px' }}>
      <h1>Shell Command Example</h1>
      <p>This page demonstrates the shell command execution with streaming output.</p>

      <h2>Deno Version Check</h2>
      <ShellCommandExample commandName="deno_version_check" />

      <h2>Node Version Check</h2>
      <ShellCommandExample commandName="node_version_check" />

      <h2>Python Version Check</h2>
      <ShellCommandExample commandName="python_version_check" />

      <h2>Windows Winget</h2>
      <ShellCommandExample commandName="deno_install_windows_winget" />

      <h2>Stream Test</h2>
      <ShellCommandExample commandName="stream_test" />
    </div>
  </React.StrictMode>,
);
