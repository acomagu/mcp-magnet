import { type CommandName } from '@mcp-magnet/shell-commands';

// Define the runtime installation state interface
export interface RuntimeInstallationState {
  python: boolean;
  deno: boolean;
  node: boolean;
}

// Mock results for version check commands
export function getMockVersionCheckResult(commandName: CommandName, runtimeState: RuntimeInstallationState): { code: number; stdout: string; stderr: string } {
  // Default success result
  const successResult = { code: 0, stdout: '', stderr: '' };

  // Default failure result
  const failureResult = { code: 1, stdout: '', stderr: 'Command not found' };

  switch (commandName) {
    case 'python_version_check':
    case 'python3_version_check':
      if (runtimeState.python) {
        successResult.stdout = 'Python 3.10.0';
        return successResult;
      }
      return failureResult;

    case 'deno_version_check':
      if (runtimeState.deno) {
        successResult.stdout = 'deno 1.37.0';
        return successResult;
      }
      return failureResult;

    case 'node_version_check':
      if (runtimeState.node) {
        successResult.stdout = 'v18.16.0';
        return successResult;
      }
      return failureResult;

    default:
      // For other commands, return success by default
      successResult.stdout = `Mock output for ${commandName}`;
      return successResult;
  }
}
