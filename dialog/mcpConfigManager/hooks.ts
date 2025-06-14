import { useMemo } from 'react';
import type { MCPConfigManager } from './manager';
import { useInstallerConfig } from '../installerConfig/hooks';
import { useMCPConfigManagerContext } from './context';

/**
 * MCPコンフィグマネージャーを取得するカスタムフック
 * Contextからマネージャーを取得し、インストーラー設定に基づいてフィルタリングする
 *
 * @returns {MCPConfigManager[]} 利用可能で有効なMCPコンフィグマネージャーの配列
 */
export function useMCPConfigManagers(): MCPConfigManager[] {
  const allManagers = useMCPConfigManagerContext();
  console.log({ allManagers });
  const { config } = useInstallerConfig();

  // 設定ファイルで有効なマネージャーのみをフィルタリング
  const filteredManagers = useMemo(() => {
    const enabledClients = config?.enabledClients;
    return allManagers.filter(manager => {
      const clientId = manager.getClientInfo().id;
      // enabledClients が未定義、または対象サーバーIDがfalseでない場合にtrue
      return !enabledClients || enabledClients[clientId] !== false;
    });
  }, [allManagers, config?.enabledClients]);

  return filteredManagers;
}
