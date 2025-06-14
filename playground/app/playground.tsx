'use client';

import { UrlHandler, useGithubSignatureVerifier, type EnvConfigMap, type MCPManifest } from '@mcp-magnet/dialog';
import { IconSunMoon, IconSun, IconMoon } from '@tabler/icons-react';
import '@mcp-magnet/styles/app.css';
import '@mcp-magnet/styles/components.css';
import React, { useState } from 'react';
import { ThemeContainer } from '../features/ThemeContainer';
import { getKeys } from '../providers/githubKeysFetcher.server';
import { useRuntimeInstallation } from '../providers/shell';
import { generateManifestFromDescription } from './actions';
import './playground.css';

// Define default presets for manifest data
const presetManifests: MCPManifest[] = [
  { // Preset 1: deno-allow-all
    name: "deno-allow-all",
    displayName: "Deno Allow All",
    command: "deno",
    args: ["-A", "https://deno.land/std@0.224.0/examples/welcome.ts"],
    manifestVersion: "1.0.0"
  },
  { // Preset 2: deno-specific-perms
    name: "deno-specific-perms",
    displayName: "Deno Specific Permissions",
    command: "deno",
    args: ["--allow-read=/tmp", "--allow-net=deno.land", "https://deno.land/std@0.224.0/examples/curl.ts", "https://deno.land/"],
    manifestVersion: "1.0.0"
  },
  { // Preset 3: env-test-deno
    name: "env-test-deno",
    displayName: "Env Test Deno",
    command: "deno",
    args: ["-A", "script.js"],
    manifestVersion: "1.0.0",
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
  },
  { // Slack
    "name": "slack",
    "displayName": "Slack",
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "mcp/slack"
    ],
    "env": {
      "SLACK_BOT_TOKEN": {
        "type": "text",
        "description": "Slack Bot Token (starts with xoxb-)",
        "required": true
      },
      "SLACK_TEAM_ID": {
        "type": "text",
        "description": "Slack Team ID (starts with T)",
        "required": true
      }
    },
    "manifestVersion": "1.0.0"
  }
];

type EnvVarItem = {
  key: string;
  type: string;
  description: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

// Helper function to encode string to base64 (handling Unicode characters)
const encodeToBase64 = (str: string): string => {
  // First encode the string as UTF-8
  const utf8Encoder = new TextEncoder();
  const utf8Bytes = utf8Encoder.encode(str);

  // Convert bytes to base64
  return btoa(
    Array.from(utf8Bytes)
      .map(byte => String.fromCharCode(byte))
      .join('')
  );
};

// Helper function to create URL from manifest data
const createManifestUrl = (manifestData: MCPManifest): string => {
  const jsonString = JSON.stringify(manifestData);
  const encodedJson = encodeToBase64(jsonString);
  return `mcp-magnet://install?manifest=${encodedJson}`;
};

// Initialize env vars from a manifest
const getEnvVarsFromManifest = (manifest: MCPManifest): EnvVarItem[] => {
  if (!manifest.env) return [];

  return Object.entries(manifest.env).map(([key, config]) => ({
    key,
    type: config.type,
    description: config.description,
    required: config.required || false,
    options: 'options' in config ? config.options : undefined
  }));
};

export function Playground() {
  const githubSignatureVerifier = useGithubSignatureVerifier();

  // Current selected preset
  const [currentPreset, setCurrentPreset] = useState<number>(0);

  // Tab state
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'ai'>('form');

  // Dark mode state (default: system)
  const [isDarkMode, setIsDarkMode] = useState<boolean | undefined>(undefined);

  // Runtime installation states using the hook
  const [runtimeState, setRuntimeState] = useRuntimeInstallation();

  const defaultPresetManifest = presetManifests[0];
  if (!defaultPresetManifest) throw new Error("Default preset manifest not found");

  // Basic form fields
  const [name, setName] = useState<string>(() => defaultPresetManifest.name);
  const [displayName, setDisplayName] = useState<string>(() => defaultPresetManifest.displayName || "");
  const [command, setCommand] = useState<string>(() => defaultPresetManifest.command);
  const [args, setArgs] = useState<readonly string[]>(() => defaultPresetManifest.args);
  const [version, setVersion] = useState<string>(() => defaultPresetManifest.manifestVersion || "1.0.0");

  // Environment variables
  const [envVars, setEnvVars] = useState<EnvVarItem[]>(
    () => getEnvVarsFromManifest(defaultPresetManifest)
  );

  // Drag state
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // New env var form fields
  const [newEnvKey, setNewEnvKey] = useState<string>('');
  const [newEnvType, setNewEnvType] = useState<string>('text');
  const [newEnvDesc, setNewEnvDesc] = useState<string>('');
  const [newEnvRequired, setNewEnvRequired] = useState<boolean>(false);
  const [newEnvOptions, setNewEnvOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [newOptionValue, setNewOptionValue] = useState<string>('');
  const [newOptionLabel, setNewOptionLabel] = useState<string>('');

  // Signature state
  const [isSigningEnabled, setIsSigningEnabled] = useState<boolean>(false);
  const [signingMethod, setSigningMethod] = useState<'gpg' | 'ssh'>('gpg');
  const [githubAccountName, setGithubAccountName] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // AI generation state
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Get current manifest data from form fields
  const getCurrentManifestData = (): MCPManifest => {
    // Always use form data
    const envMap: EnvConfigMap = {};

    if (envVars.length > 0) {
      envVars.forEach(env => {
        // 型に応じて適切なオブジェクトを作成
        if (env.type === 'text') {
          envMap[env.key] = {
            type: 'text' as const,
            description: env.description,
            required: env.required,
            options: env.options
          };
        } else if (env.type === 'select') {
          envMap[env.key] = {
            type: 'select' as const,
            description: env.description,
            required: env.required,
            options: env.options || []
          };
        } else if (env.type === 'boolean') {
          envMap[env.key] = {
            type: 'boolean' as const,
            description: env.description,
            required: env.required
          };
        }
      });
    }

    // Include manifestAuthor only when signature verification is successful
    const manifestData: MCPManifest = {
      name,
      displayName,
      command,
      args: args.filter(arg => arg !== ''),
      env: envVars.length > 0 ? envMap : undefined,
      manifestVersion: version
    };

    // Add manifestAuthor only when signature verification is successful
    if (isSigningEnabled) {
      manifestData.manifestAuthor = `github:${githubAccountName}`;
    }

    return manifestData;
  };

  // JSON display value (read-only)
  const jsonValue = React.useMemo(() => {
    return JSON.stringify(getCurrentManifestData(), null, 2);
  }, [name, displayName, command, args, version, envVars, isSigningEnabled, verificationStatus, githubAccountName]);

  // Get current URL from manifest data
  const getCurrentUrl = (): string => {
    const manifestData = getCurrentManifestData();
    let url = createManifestUrl(manifestData);
    if (isSigningEnabled && signature) {
      // Check if the URL already has query parameters
      if (url.includes('?')) {
        url += `&signature=${encodeURIComponent(signature)}`;
      } else {
        // This case shouldn't happen with mcp-magnet, but handle defensively
        url += `?signature=${encodeURIComponent(signature)}`;
      }
    }
    return url;
  };

  // Handler for AI generation
  const handleAiGenerate = async () => {
    if (aiDescription.trim() === '') return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const generatedManifest = await generateManifestFromDescription(aiDescription);

      // Set the generated manifest values to the form
      setName(generatedManifest.name);
      setDisplayName(generatedManifest.displayName || '');
      setCommand(generatedManifest.command);
      setArgs([...generatedManifest.args]);
      setVersion(generatedManifest.manifestVersion || '1.0.0');

      // Set environment variables if any
      if (generatedManifest.env) {
        const envVarItems = getEnvVarsFromManifest(generatedManifest);
        setEnvVars(envVarItems);
      } else {
        setEnvVars([]);
      }

      // Switch to form tab to show the generated content
      setActiveTab('form');

      // Clear the AI description
      setAiDescription('');
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate manifest');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for dialog close
  const handleDialogClose = () => {
    console.log("Dialog closed");
  };

  // Handler for preset selection
  const handlePresetSelect = (index: number) => {
    const preset = presetManifests[index];
    setCurrentPreset(index);
    setName(preset.name);
    setDisplayName(preset.displayName || "");
    setCommand(preset.command);
    setArgs([...preset.args]);
    setVersion(preset.manifestVersion || "1.0.0");
    setEnvVars(getEnvVarsFromManifest(preset));
  };

  // No JSON changes handler as it's read-only now

  // Handler for adding a new option to select-type env var
  const handleAddOption = () => {
    if (newOptionValue.trim() === '' || newOptionLabel.trim() === '') return;

    setNewEnvOptions([...newEnvOptions, {
      value: newOptionValue,
      label: newOptionLabel
    }]);

    // Reset option input fields
    setNewOptionValue('');
    setNewOptionLabel('');
  };

  // Handler for removing an option
  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...newEnvOptions];
    updatedOptions.splice(index, 1);
    setNewEnvOptions(updatedOptions);
  };

  // Handler for adding a new environment variable
  const handleAddEnvVar = () => {
    if (newEnvKey.trim() === '') return;

    setEnvVars([...envVars, {
      key: newEnvKey,
      type: newEnvType,
      description: newEnvDesc,
      required: newEnvRequired,
      options: newEnvType === 'select' ? [...newEnvOptions] : undefined
    }]);

    // Reset input fields
    setNewEnvKey('');
    setNewEnvType('text');
    setNewEnvDesc('');
    setNewEnvRequired(false);
    setNewEnvOptions([]);
  };

  // Handler for removing an environment variable
  const handleRemoveEnvVar = (index: number) => {
    const updatedEnvVars = [...envVars];
    updatedEnvVars.splice(index, 1);
    setEnvVars(updatedEnvVars);
  };

  // Generate command examples
  const getCommandExample = (): string => {
    const manifestJson = JSON.stringify(getCurrentManifestData());
    // Encode the manifest JSON to base64
    const base64Manifest = encodeToBase64(manifestJson);
    // Escape single quotes in the base64 string for the shell command
    const escapedBase64Manifest = base64Manifest.replace(/'/g, "'\\''");

    if (signingMethod === 'gpg') {
      // Note: GPG signing usually takes data via stdin, but the exact command might vary.
      // This example assumes signing the manifest JSON string directly.
      // Users might need to adjust based on their specific GPG setup.
      // Using --clear-sign might be more common for text data.
      // Using --detach-sign creates a separate signature file. Let's use detach-sign.
      return `echo -n '${escapedBase64Manifest}' | gpg --armor --detach-sign -u <key-id>`;
    } else { // ssh
      return `echo -n '${escapedBase64Manifest}' | ssh-keygen -Y sign -f ~/.ssh/id_ed25519 -n file`;
    }
  };

  // Real signature verification effect
  React.useEffect(() => {
    // Only run verification if signing is enabled, user is set, and signature is present
    if (isSigningEnabled && githubAccountName && signature) {
      const verifySig = async () => {
        setVerificationStatus('verifying');
        setVerificationError(null);
        console.log(`Verifying signature for user ${githubAccountName}...`);

        try {
          // Get the current manifest data and stringify it for the payload
          const manifestData = getCurrentManifestData();
          const manifestJson = JSON.stringify(manifestData);
          const payload = encodeToBase64(manifestJson); // Base64 encode the JSON string

          const publicKeys = await getKeys(githubAccountName);

          const isValid = await githubSignatureVerifier({
            publicKeys,
            payload,
            signatureArmored: signature,
          });

          if (isValid) {
            setVerificationStatus('success');
            console.log("Verification successful.");
          } else {
            setVerificationStatus('error');
            setVerificationError('Verification failed. Signature is invalid or no matching key found.');
            console.log("Verification failed.");
          }
        } catch (error) {
          setVerificationStatus('error');
          const errorMessage = error instanceof Error ? error.message : String(error);
          setVerificationError(`Verification error: ${errorMessage}`);
          console.error("Verification error:", error);
        }
      };

      verifySig(); // Call the async verification function

      // No cleanup needed unless verifyGithubSignature becomes cancellable
    } else {
      setVerificationStatus('idle'); // Reset status if conditions aren't met
      setVerificationError(null);
    }
    // Dependencies: Re-run when signing is toggled, user changes, signature changes,
    // or any state affecting getCurrentManifestData changes.
    // Listing all dependencies of getCurrentManifestData explicitly is complex.
    // A simpler approach for this playground is to re-verify whenever the signature, user, or signing status changes.
    // If manifest data changes while signature exists, user needs to re-sign/re-paste.
  }, [signature, isSigningEnabled, githubAccountName]); // Add githubAccountName dependency


  // Reset signature and verification when signing is disabled
  React.useEffect(() => {
    if (!isSigningEnabled) {
      setSignature('');
      setGithubAccountName('');
      setVerificationStatus('idle');
      setVerificationError(null);
    }
  }, [isSigningEnabled]);

  return (
    <ThemeContainer
      className="playground-container"
      themeMode={isDarkMode === true ? 'dark' : isDarkMode === false ? 'light' : 'system'}
    >
      <div className="playground-header">
        <h1 className="text-center mb-1">MCP Link Generator</h1>

        {/* Theme toggle button in top bar */}
        <button
          type="button"
          onClick={() => {
            setIsDarkMode(prev => {
              if (prev === undefined) return true;
              if (prev === true) return false;
              return undefined;
            });
          }}
          className="btn button-secondary theme-toggle-btn"
        >
          {isDarkMode === undefined ? <IconSunMoon /> :
            isDarkMode === true ? <IconMoon /> : <IconSun />}
        </button>
      </div>

      {/* 左ペイン: Manifest設定フォームとURL Link */}
      <div className="web-demo-pane left-pane">
        <div className="pane-header">
          <div className="pane-header-content">
            <h2 className="pane-title">マニフェスト設定</h2>

            <div className="mode-switch">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`switch-button ${activeTab === 'form' ? 'active' : ''}`}
              >
                フォーム
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`switch-button ${activeTab === 'json' ? 'active' : ''}`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`switch-button ${activeTab === 'ai' ? 'active' : ''}`}
              >
                AI生成
              </button>
            </div>
          </div>
        </div>

        <div className="pane-content">

          {/* プリセット選択 */}
          <div className="mb-3">
            <h3 className="mb-2">プリセット選択</h3>
            <div className="preset-buttons-container">
              {presetManifests.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePresetSelect(index)}
                  className={`preset-button ${currentPreset === index ? 'active' : ''}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* JSON 表示 (読み取り専用) */}
          {activeTab === 'json' && (
            <div className="mb-3">
              <textarea
                value={jsonValue}
                readOnly
                className="json-editor"
              />
            </div>
          )}

          {/* AI生成 */}
          {activeTab === 'ai' && (
            <div className="mb-3">
              <div className="form-group">
                <label htmlFor="aiDescription" className="form-label">
                  マニフェストの説明を入力/貼り付けしてください:
                </label>
                <textarea
                  id="aiDescription"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  className="form-control"
                  rows={8}
                  placeholder="例: Pythonで動作するSlackボットのMCPサーバー。BOT_TOKENとTEAM_IDの環境変数が必要です。"
                  disabled={isGenerating}
                />
              </div>

              {generationError && (
                <div className="form-error mb-3">
                  {generationError}
                </div>
              )}

              <button
                type="button"
                onClick={handleAiGenerate}
                className="btn button-primary full-width-btn"
                disabled={isGenerating || aiDescription.trim() === ''}
              >
                {isGenerating ? 'AIが生成中...' : 'マニフェストを生成'}
              </button>

              <div className="form-description mt-3">
                <p>LLMがあなたの説明に基づいてMCPマニフェストを自動生成します。</p>
                <p>既存のMCPサーバーの説明文をコピペすることで簡易にインストールする為にも使えます。</p>
              </div>
            </div>
          )}

          {/* マニフェスト編集フォーム */}
          {activeTab === 'form' && (
            <form className="playground-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">名前 (ID):</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName" className="form-label">表示名:</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="command" className="form-label">コマンド:</label>
                <input
                  id="command"
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="version" className="form-label">バージョン:</label>
                <input
                  id="version"
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">引数:</label>
                <div className="args-container">
                  {args.map((arg, index) => (
                    <div
                      key={index}
                      className={`arg-item ${draggedItemIndex === index ? 'dragged' : ''}`}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedItemIndex(index);
                        // Required for Firefox
                        e.dataTransfer.setData('text/plain', index.toString());
                        // Make the drag image transparent
                        const dragImage = document.createElement('div');
                        dragImage.style.opacity = '0';
                        document.body.appendChild(dragImage);
                        e.dataTransfer.setDragImage(dragImage, 0, 0);
                        setTimeout(() => document.body.removeChild(dragImage), 0);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderTop =
                          draggedItemIndex !== null && index < draggedItemIndex
                            ? '2px solid var(--color-primary)'
                            : '1px solid transparent';
                        e.currentTarget.style.borderBottom =
                          draggedItemIndex !== null && index > draggedItemIndex
                            ? '2px solid var(--color-primary)'
                            : '1px solid transparent';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderTop = '1px solid transparent';
                        e.currentTarget.style.borderBottom = '1px solid transparent';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderTop = '1px solid transparent';
                        e.currentTarget.style.borderBottom = '1px solid transparent';

                        if (draggedItemIndex === null) return;

                        // Reorder the arguments
                        const newArgs = [...args];
                        const draggedItem = newArgs[draggedItemIndex];

                        // Remove the dragged item
                        newArgs.splice(draggedItemIndex, 1);

                        // Insert at the new position
                        newArgs.splice(index, 0, draggedItem);

                        setArgs(newArgs);
                        setDraggedItemIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedItemIndex(null);
                      }}
                    >
                      <div className="drag-handle">
                        ⋮⋮
                      </div>
                      <input
                        type="text"
                        value={arg}
                        onChange={(e) => {
                          const newArgs = [...args];
                          newArgs[index] = e.target.value;
                          setArgs(newArgs);
                        }}
                        className="form-control flex-input"
                        placeholder={`引数 ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newArgs = [...args];
                          newArgs.splice(index, 1);
                          setArgs(newArgs);
                        }}
                        className="btn button-secondary"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setArgs([...args, ''])}
                    className="btn button-primary align-start"
                  >
                    引数を追加
                  </button>
                </div>
              </div>

              {/* 環境変数の設定 */}
              <div className="form-group">
                <h3 className="mb-2">環境変数</h3>

                {/* 既存の環境変数リスト */}
                {envVars.length > 0 && (
                  <div className="mb-3">
                    {envVars.map((env, index) => (
                      <div key={index} className="card mb-2">
                        <div className="env-var-item">
                          <div>
                            <strong>{env.key}</strong> ({env.type})
                            <p className="form-description mt-1">{env.description}</p>
                            {env.required && <span className="badge badge-high">必須</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEnvVar(index)}
                            className="btn button-secondary small-font-btn"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 新しい環境変数追加フォーム */}
                <div className="panel bg-tertiary">
                  <h4 className="mb-2">新しい環境変数を追加</h4>
                  <div className="input-container">
                    <input
                      type="text"
                      placeholder="変数名"
                      value={newEnvKey}
                      onChange={(e) => setNewEnvKey(e.target.value)}
                      className="form-control flex-input-2"
                    />
                    <select
                      value={newEnvType}
                      onChange={(e) => setNewEnvType(e.target.value)}
                      className="form-control flex-input"
                    >
                      <option value="text">テキスト</option>
                      <option value="boolean">ブール値</option>
                      <option value="select">選択肢</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="説明"
                    value={newEnvDesc}
                    onChange={(e) => setNewEnvDesc(e.target.value)}
                    className="form-control mb-2"
                  />

                  <div className="form-check mb-2">
                    <input
                      id="requiredCheck"
                      type="checkbox"
                      checked={newEnvRequired}
                      onChange={(e) => setNewEnvRequired(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="requiredCheck" className="form-check-label">必須項目</label>
                  </div>

                  {/* 選択肢タイプの場合のオプション設定 */}
                  {newEnvType === 'select' && (
                    <div className="mb-3">
                      <h5 className="mb-2">選択肢の設定</h5>

                      {/* 既存の選択肢リスト */}
                      {newEnvOptions.length > 0 && (
                        <div className="mb-2">
                          {newEnvOptions.map((option, index) => (
                            <div key={index} className="card mb-1 p-xs">
                              <div className="env-var-item">
                                <div>
                                  <strong>{option.label}</strong> ({option.value})
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="btn button-secondary small-font-btn"
                                >
                                  削除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 新しい選択肢追加フォーム */}
                      <div className="input-container">
                        <input
                          type="text"
                          placeholder="値 (value)"
                          value={newOptionValue}
                          onChange={(e) => setNewOptionValue(e.target.value)}
                          className="form-control flex-input"
                        />
                        <input
                          type="text"
                          placeholder="ラベル (label)"
                          value={newOptionLabel}
                          onChange={(e) => setNewOptionLabel(e.target.value)}
                          className="form-control flex-input"
                        />
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="btn button-secondary"
                          disabled={newOptionValue.trim() === '' || newOptionLabel.trim() === ''}
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddEnvVar}
                    className="btn button-primary full-width-btn"
                    disabled={newEnvKey.trim() === ''}
                  >
                    追加
                  </button>
                </div>
              </div>

              {/* Signature Section */}
              <div className="form-group">
                <h3 className="mb-2">署名</h3>
                <div className="panel bg-tertiary">
                  <div className="form-description mb-3" style={{ color: 'var(--color-warning)' }}>
                    ※ Manifestが変更されると署名は自動的に削除されます。すべての設定が完了した後に署名してください。
                  </div>

                  <div className="form-check mb-2">
                    <input
                      type="radio"
                      id="sign-disabled"
                      name="signingOption"
                      checked={!isSigningEnabled}
                      onChange={() => setIsSigningEnabled(false)}
                      className="form-check-input"
                    />
                    <label htmlFor="sign-disabled" className="form-check-label">署名しない</label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      type="radio"
                      id="sign-enabled"
                      name="signingOption"
                      checked={isSigningEnabled}
                      onChange={() => setIsSigningEnabled(true)}
                      className="form-check-input"
                    />
                    <label htmlFor="sign-enabled" className="form-check-label">GitHub アカウントの鍵で署名</label>
                  </div>

                  {isSigningEnabled && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="githubAccount" className="form-label small-label">GitHub アカウント名:</label>
                        <input
                          id="githubAccount"
                          type="text"
                          value={githubAccountName}
                          onChange={(e) => setGithubAccountName(e.target.value)}
                          className="form-control"
                          placeholder="例: octocat"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small-label">署名方法:</label>
                        <div className="input-container">
                          <div className="form-check form-check-inline">
                            <input
                              type="radio"
                              id="sign-gpg"
                              name="signingMethod"
                              value="gpg"
                              checked={signingMethod === 'gpg'}
                              onChange={() => setSigningMethod('gpg')}
                              className="form-check-input"
                            />
                            <label htmlFor="sign-gpg" className="form-check-label">GPG</label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              type="radio"
                              id="sign-ssh"
                              name="signingMethod"
                              value="ssh"
                              checked={signingMethod === 'ssh'}
                              onChange={() => setSigningMethod('ssh')}
                              className="form-check-input"
                            />
                            <label htmlFor="sign-ssh" className="form-check-label">SSH</label>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small-label">コマンド例:</label>
                        <div style={{ position: 'relative' }}>
                          <pre className="command-preview"><code>{getCommandExample()}</code></pre>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(getCommandExample())}
                            className="btn button-secondary"
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              padding: '2px 8px',
                              fontSize: 'var(--font-size-sm)'
                            }}
                          >
                            コピー
                          </button>
                        </div>
                        {signingMethod === 'ssh' && (
                          <p className="form-description mt-1">
                            注意: <code>~/.ssh/id_ed25519</code> を実際の秘密鍵のパスに置き換えてください。
                            また、GitHubに登録されている公開鍵に対応するものである必要があります。
                          </p>
                        )}
                        {signingMethod === 'gpg' && (
                          <p className="form-description mt-1">
                            注意: <code>&lt;key-id&gt;</code> を実際のGPGキーIDに置き換えてください。
                            また、GitHubに登録されている公開鍵に対応するものである必要があります。
                          </p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="signatureInput" className="form-label small-label">コマンド実行結果 (署名):</label>
                        <textarea
                          id="signatureInput"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="form-control signature-input"
                          placeholder={signingMethod === 'gpg' ? '-----BEGIN PGP SIGNATURE-----\n...\n-----END PGP SIGNATURE-----' : 'ssh-ed25519-sig ...'}
                          rows={5}
                        />
                      </div>

                      {/* Verification Status */}
                      <div className="verification-status">
                        {verificationStatus === 'verifying' && (
                          <p className="status-verifying">検証中...</p>
                        )}
                        {verificationStatus === 'success' && (
                          <p className="status-success">✅ 検証に成功しました。</p>
                        )}
                        {verificationStatus === 'error' && (
                          <p className="status-error">❌ 検証に失敗しました: {verificationError}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* URL display removed from here - now in fixed bar at bottom */}
            </form>
          )}

        </div> {/* Close pane-content */}
      </div> {/* Close left-pane */}

      {/* 右ペイン: DeepLinkDialog */}
      <div className="web-demo-pane right-pane">
        <div className="pane-header">
          <div className="pane-header-content">
            <h2 className="pane-title">インストールダイアログのプレビュー</h2>
            <button
              type="button"
              id="settings-button"
              popoverTarget="runtime-settings-popover"
              popoverTargetAction="toggle"
              className="btn button-secondary"
              aria-haspopup="true"
            >
              設定
            </button>
          </div>
        </div>
        <div
          id="runtime-settings-popover"
          popover="auto"
          className="card"
          style={{
            position: 'absolute',
            minWidth: '250px',
            top: 'anchor(bottom)',
            right: 'anchor(end)',
            zIndex: 100
          }}
        >
          <button
            className="notification-close"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            popoverTarget="runtime-settings-popover"
            popoverTargetAction="hide"
          >
            ✕
          </button>
          <div className="panel-header">
            <h3 className="panel-title">インストール済みランタイム</h3>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={runtimeState.python}
                onChange={(e) => setRuntimeState(prev => ({
                  ...prev,
                  python: e.target.checked
                }))}
              />
              <span className="form-check-label">Python インストール済み</span>
            </label>
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={runtimeState.deno}
                onChange={(e) => setRuntimeState(prev => ({
                  ...prev,
                  deno: e.target.checked
                }))}
              />
              <span className="form-check-label">Deno インストール済み</span>
            </label>
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={runtimeState.node}
                onChange={(e) => setRuntimeState(prev => ({
                  ...prev,
                  node: e.target.checked
                }))}
              />
              <span className="form-check-label">Node.js インストール済み</span>
            </label>
          </div>
        </div>
        <div className="card dialog-container">
          <UrlHandler url={getCurrentUrl()} onClose={handleDialogClose} />
        </div>
      </div>

      {/* 固定URL表示バー - moved outside of web-demo-layout */}
      <div className="fixed-url-bar">
        <div className="url-container">
          <div className="url-label">作成された URL:</div>
          <a
            href={getCurrentUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-url url-link"
          >
            {getCurrentUrl()}
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(getCurrentUrl())}
            className="btn button-secondary"
          >
            コピー
          </button>
        </div>
      </div>
    </ThemeContainer>
  );
}
