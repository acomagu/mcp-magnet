import { useSyncExternalStore } from 'react';
import { useMemo } from 'react';
import type { InstallerConfig, InstallerConfigService } from './service';
import { useInstallerConfigService } from './context';

class Store {
  config: InstallerConfig | undefined;
  listeners: (() => void)[] = [];
  installerConfigService: InstallerConfigService;
  constructor(installerConfigService: InstallerConfigService) {
    this.installerConfigService = installerConfigService;
  }
  async init() {
    this.config = await this.installerConfigService.loadConfig();
    this.notifyListeners();
    return this.config;
  }
  async setConfig(updater: (prev: InstallerConfig | null) => InstallerConfig) {
    if (!this.config) await this.init();

    const newConfig = updater(this.config!);

    await this.installerConfigService.saveConfig(newConfig);

    this.config = newConfig;

    this.notifyListeners();
  }
  subscribe(listener: () => void) {
    console.log('abaaba', this);
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export function useInstallerConfig() {
  const installerConfigService = useInstallerConfigService();
  const store = useMemo(() => new Store(installerConfigService), [installerConfigService]);

  const config = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.config,
    () => store.config, // Need for SSR
  );

  return {
    config,
    setConfig: store.setConfig.bind(store)
  };
}
