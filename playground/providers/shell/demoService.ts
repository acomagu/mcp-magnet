import { type CommandResult, type ShellCommandEvent, type ShellExecutorService } from '@mcp-magnet/dialog';
import { type CommandName, type ShellCommand, getShellCommand as getLocalShellCommand } from '@mcp-magnet/shell-commands';
import { getMockVersionCheckResult, type RuntimeInstallationState } from './mockResults';

export class DemoShellExecutorService implements ShellExecutorService {
  private runtimeState: RuntimeInstallationState;
  constructor(runtimeState: RuntimeInstallationState) {
    this.runtimeState = runtimeState;
  }

  getRuntimeState(): RuntimeInstallationState {
    return this.runtimeState;
  }

  async execute(commandName: CommandName): Promise<CommandResult> {
    console.log(`[DemoShell] execute called for command: '${commandName}' (simulating ${this.getCommandSuccessStatus(commandName)})`);
    const result = getMockVersionCheckResult(commandName, this.runtimeState);
    return Promise.resolve(result);
  }

  async executeWithStream(commandName: CommandName, listener: (event: ShellCommandEvent) => void): Promise<void> {
    console.log(`[DemoShell] executeWithStream called for command: '${commandName}' (simulating ${this.getCommandSuccessStatus(commandName)})`);
    const commandDetails = this.getCommandDetails(commandName);
    const result = getMockVersionCheckResult(commandName, this.runtimeState);

    try {
      listener({ event: 'started', data: { command: commandDetails?.command || commandName, args: commandDetails?.args || [] } });

      // If the command is successful
      if (result.code === 0) {
        listener({ event: 'stdout', data: { line: `Starting simulated execution of ${commandName}...` } });
        await new Promise(resolve => setTimeout(resolve, 100));
        listener({ event: 'stdout', data: { line: `... doing simulated work ...` } });
        await new Promise(resolve => setTimeout(resolve, 200));

        // Add the mock result output
        if (result.stdout) {
          listener({ event: 'stdout', data: { line: result.stdout } });
        }

        listener({ event: 'stdout', data: { line: `... simulation complete.` } });
        listener({ event: 'finished', data: { code: 0 } });
      } else {
        // If the command fails
        if (result.stderr) {
          listener({ event: 'stderr', data: { line: result.stderr } });
        }
        listener({ event: 'finished', data: { code: 1 } });
      }

      return Promise.resolve();
    } catch (error) {
      console.error(`[DemoShell] Unexpected error during stream simulation for '${commandName}':`, error);
      listener({ event: 'error', data: { message: `Simulation setup error: ${error}` } });
      return Promise.reject(error);
    }
  }

  getCommandDetails(name: CommandName): ShellCommand | undefined {
    return getLocalShellCommand(name);
  }

  private getCommandSuccessStatus(commandName: CommandName): string {
    const result = getMockVersionCheckResult(commandName, this.runtimeState);
    return result.code === 0 ? 'success' : 'failure';
  }
}
