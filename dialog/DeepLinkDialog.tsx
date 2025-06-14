import '@mcp-magnet/styles/components.css';
import { useEffect, useState } from 'react';
import { useMCPConfigManagers, type EnvValueMap, type MCPConfig, type MCPManifest } from './mcpConfigManager';
import { useRuntimeByCommand } from './runtime';
import { AppSelector, CompletionStep, MCPConfigConfirmation, MCPServerOverview, ReviewPermissionAndEnvConfig, RuntimeCheckStep, useShouldShowRuntimeCheckStep } from './steps';

interface DeepLinkDialogProps {
  manifest: MCPManifest,
  onClose: () => void;
}

export function DeepLinkDialog({
  manifest: mcpManifest,
  onClose,
}: DeepLinkDialogProps) {
  const [step, setStep] = useState<'overview' | 'env_config' | 'app_selection' | 'runtime_check' | 'config_confirmation' | 'completion'>('overview');
  const [installs, setInstalls] = useState<{ app: string, projectPath?: string }[]>([]);
  const [env, setEnv] = useState<EnvValueMap>({});
  const configManagers = useMCPConfigManagers();
  const [configFilePaths, setConfigFilePaths] = useState<Promise<string[]>>(Promise.resolve([]));

  const getConfigManagerForApp = (appId: string) => configManagers.find(manager => manager.getClientInfo().id === appId);

  // Calculate initial env values and permission info
  let initialEnvValues: EnvValueMap = {};

  // Get permission info from runtime if available
  const runtime = useRuntimeByCommand(mcpManifest.command);
  const permissionInfo = runtime?.getPermissionInfo?.(mcpManifest.args);

  const shouldShowRuntimeCheck = useShouldShowRuntimeCheckStep(mcpManifest);

  const handleEnvConfigured = (values: EnvValueMap) => {
    console.log('AppSelector submitted values:', values);
    setEnv(values); // Store collected env vars

    console.log('Proceeding to Location Selection step');
    setStep('app_selection');
  };

  const handleOverviewNext = () => {
    // ReviewPermissionAndEnvConfig.shouldSkip が実装されているものとして使用
    if (ReviewPermissionAndEnvConfig.shouldSkip(mcpManifest)) {
      console.log('Skipping env_config step as no environment variables are required');
      setEnv({});
      setStep('app_selection');
    } else {
      setStep('env_config');
    }
  };

  const handleAppSelect = async () => {
    if (shouldShowRuntimeCheck) {
      setStep('runtime_check');
    } else {
      console.log(`Skipping runtime_check step for ${mcpManifest.command}`);
      setStep('config_confirmation');
    }
  }

  // ランタイムチェックステップの完了ハンドラー
  const handleRuntimeCheckComplete = () => {
    setStep('config_confirmation');
  }

  const handleConfirm = async () => {
    let envExtra;
    if (mcpManifest.manifestVersion != undefined && mcpManifest.manifestAuthor != undefined) {
      envExtra = { __MCP_SERVER_MANIFEST: `${mcpManifest.manifestAuthor}/${mcpManifest.name}@${mcpManifest.manifestVersion}` };
    }

    const config: MCPConfig = {
      command: mcpManifest.command,
      args: mcpManifest.args,
      env: { ...env, ...envExtra },
    };

    for (const { app, projectPath } of installs ?? []) {
      const configManager = getConfigManagerForApp(app);
      if (!configManager) {
        console.error('Unsupported app selected:', app);
        return;
      }

      if (projectPath != undefined) {
        if (!configManager.getProject) throw new Error('No configManager.getProject');
        const projectConfigManager = configManager.getProject(projectPath);

        await projectConfigManager.upsert(mcpManifest.name, config);
      } else {
        await configManager.upsert(mcpManifest.name, config);
      }
    }

    console.log("handleSubmitEnv complete - window closing disabled");
    setStep('completion');
  };

  const handleClose = () => {
    console.log('handleClose called in DeepLinkDialog');
    setStep('overview');
    setEnv({});
    onClose();
  };

  const goToPreviousStep = (currentStep: 'overview' | 'env_config' | 'app_selection' | 'runtime_check' | 'config_confirmation' | 'completion') => {
    switch (currentStep) {
      case 'env_config':
        setStep('overview');
        break;
      case 'app_selection':
        // env_config をスキップした場合は overview に戻る
        if (ReviewPermissionAndEnvConfig.shouldSkip(mcpManifest)) {
          setStep('overview');
        } else {
          setStep('env_config');
        }
        break;
      case 'runtime_check':
        setStep('app_selection');
        break;
      case 'config_confirmation':
        // runtime_check をスキップした場合は app_selection に戻る
        // コンポーネントのトップレベルで計算されたshouldShowRuntimeCheckを使用
        if (!shouldShowRuntimeCheck) {
          setStep('app_selection');
        } else {
          setStep('runtime_check');
        }
        break;
      case 'completion':
        setStep('config_confirmation');
        break;
      default:
        setStep('overview');
    }
  };

  useEffect(() => { // TODO: Find more elegant way
    setConfigFilePaths(Promise.all(installs?.map(({ app, projectPath }) => {
      const configManager = getConfigManagerForApp(app);
      if (!configManager) throw new Error(`Unsupported app selected: ${app}`);

      if (projectPath != undefined) {
        if (!configManager.getProject) throw new Error('Project path is not supported for this config manager');
        const projectConfigManager = configManager.getProject(projectPath);
        return projectConfigManager.getConfigFilePath();
      } else {
        return configManager.getConfigFilePath();
      }
    }) ?? []));
  }, [installs]);

  // リフレッシュ可能なアプリの情報を作成
  const getAppsWithRefreshInfo = () =>
    installs?.map(({ app }) => {
      // Get the config manager for this app ID
      const configManager = getConfigManagerForApp(app);
      if (!configManager) {
        console.error('Unsupported app:', app);
        return {
          name: app,
          canRefresh: false,
          refreshInstrument: undefined
        };
      }

      // refresh メソッドが定義されているかどうかを確認
      const canRefresh = typeof configManager.refresh === 'function';
      const appName = configManager.getClientInfo().name;
      const refreshInstrument = configManager.refreshInstrument;

      return {
        name: appName,
        canRefresh,
        refreshInstrument
      };
    }) ?? [];

  // アプリリフレッシュハンドラー
  const handleRefreshApp = async (appName: string) => {
    if (!installs) return;

    // アプリに対応するアプリIDを見つける
    const appItem = installs.find(item => {
      const appId = item.app;
      const manager = getConfigManagerForApp(appId);
      return manager?.getClientInfo().name === appName;
    });

    if (!appItem) {
      console.error('App not found:', appName);
      return;
    }

    // Get the config manager for this app ID
    const configManager = getConfigManagerForApp(appItem.app);
    if (!configManager) {
      console.error('Unsupported app:', appItem.app);
      return;
    }

    // refresh メソッドが定義されていれば実行
    if (configManager.refresh) {
      await configManager.refresh();
    }
  };

  switch (step) {
    case 'overview':
      return <MCPServerOverview
        manifest={mcpManifest}
        permissionInfo={permissionInfo}
        onClose={handleClose}
        onSubmit={handleOverviewNext}
      />;
    case 'env_config':
      return <ReviewPermissionAndEnvConfig
        manifest={mcpManifest}
        initialValues={initialEnvValues}
        onClose={handleClose}
        onSubmitEnv={handleEnvConfigured}
      />;
    case 'app_selection':
      return <AppSelector
        installs={installs}
        setInstalls={setInstalls}
        onSubmit={handleAppSelect}
        onBack={() => goToPreviousStep('app_selection')}
      />;
    case 'runtime_check':
      return <RuntimeCheckStep
        command={mcpManifest.command}
        onBack={() => goToPreviousStep('runtime_check')}
        onComplete={handleRuntimeCheckComplete}
      />;
    case 'config_confirmation':
      return <MCPConfigConfirmation
        manifest={mcpManifest}
        env={env}
        configFilePaths={configFilePaths}
        permissionInfo={permissionInfo}
        onBack={() => goToPreviousStep('config_confirmation')}
        onConfirm={handleConfirm}
      />;
    case 'completion':
      return <CompletionStep
        onClose={handleClose}
        appsWithRefresh={getAppsWithRefreshInfo()}
        onRefreshApp={handleRefreshApp}
      />;
  }
}
