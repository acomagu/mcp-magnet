import { type ShellCommandEvent, useShellExecutor } from '@mcp-magnet/dialog';
import { CommandName } from '@mcp-magnet/shell-commands';
import '@mcp-magnet/styles/components.css';
import React, { useEffect, useState } from 'react';

interface ShellCommandExampleProps {
  commandName: CommandName;
}

export function ShellCommandExample({ commandName }: ShellCommandExampleProps) {
  const shellExecutor = useShellExecutor();
  const [command, setCommand] = useState<{ name: CommandName; command: string; args: string[] } | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the command details when the component mounts
  useEffect(() => {
    async function fetchCommand() {
      try {
        const cmd = shellExecutor.getCommandDetails(commandName);
        if (cmd) {
          // Create a new command object with the correct types
          setCommand({
            name: commandName,
            command: cmd.command,
            args: cmd.args
          });
        } else {
          setError(`Command '${commandName}' not found`);
        }
      } catch (err) {
        setError(`Error fetching command: ${err}`);
      }
    }

    fetchCommand();
  }, [commandName]);

  // Execute the command without streaming
  const runCommand = async () => {
    if (!command) return;

    setOutput([]);
    setError(null);

    try {
      const result = await shellExecutor.execute(command.name);
      setOutput([
        `Exit code: ${result.code}`,
        '--- STDOUT ---',
        result.stdout,
        '--- STDERR ---',
        result.stderr
      ]);
    } catch (err) {
      setError(`Error executing command: ${err}`);
    }
  };

  // Execute the command with streaming output
  const runCommandWithStream = async () => {
    if (!command) return;

    setOutput([]);
    setError(null);
    setIsRunning(true);

    try {
      console.log("Starting executeWithStream");
      await shellExecutor.executeWithStream(command.name, (event: ShellCommandEvent) => {
        console.log("Received event:", event);
        switch (event.event) {
          case 'started':
            console.log("Started event:", event.data);
            setOutput(prev => [...prev, `Starting command: ${event.data.command} ${event.data.args.join(' ')}`]);
            break;
          case 'stdout':
            console.log("Stdout event:", event.data);
            setOutput(prev => [...prev, `[STDOUT] ${event.data.line}`]);
            break;
          case 'stderr':
            console.log("Stderr event:", event.data);
            setOutput(prev => [...prev, `[STDERR] ${event.data.line}`]);
            break;
          case 'finished':
            console.log("Finished event:", event.data);
            setOutput(prev => [...prev, `Command finished with exit code: ${event.data.code}`]);
            setIsRunning(false);
            break;
          case 'error':
            console.log("Error event:", event.data);
            setError(event.data.message);
            setIsRunning(false);
            break;
        }
      });
      console.log("executeShellCommandWithStream completed");
    } catch (err) {
      setError(`Error executing command: ${err}`);
      setIsRunning(false);
    }
  };

  if (error) {
    return <div className="notification notification-error">{error}</div>;
  }

  if (!command) {
    return <div className="text-center">Loading command...</div>;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Shell Command: {command.name}</h3>
        <div className="dialog-url">
          {command.command} {command.args.join(' ')}
        </div>
      </div>

      <div className="mt-3">
        <button
          className="button button-primary"
          onClick={runCommand}
          disabled={isRunning}
          style={{ marginRight: '10px' }}
        >
          Run Command
        </button>

        <button
          className="button button-secondary"
          onClick={runCommandWithStream}
          disabled={isRunning}
        >
          Run With Streaming
        </button>
      </div>

      {isRunning && <div className="mt-2 text-muted">Running command...</div>}

      {output.length > 0 && (
        <div className="card mt-3 p-3" style={{ fontFamily: 'monospace', maxHeight: '400px', overflow: 'auto' }}>
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
