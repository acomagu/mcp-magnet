use mcp_magnet_shell_commands::{SHELL_COMMANDS, ShellCommand};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub fn get_shell_command(name: &str) -> Option<&'static ShellCommand> {
    SHELL_COMMANDS.iter().find(|cmd| cmd.name.as_ref() == name)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult {
    pub code: i32,
    pub stdout: String,
    pub stderr: String,
}

/// Execute a shell command by name
#[tauri::command]
pub async fn execute_shell_command(
    app_handle: AppHandle,
    name: &str,
) -> Result<CommandResult, String> {
    let cmd = get_shell_command(name).ok_or_else(|| format!("Command '{}' not found", name))?;

    let shell = app_handle.shell();
    let output = shell
        .command(cmd.command.as_ref()) // Convert Cow<str> to &str which implements AsRef<OsStr>
        .args(cmd.args.iter().map(|arg| arg.as_ref())) // Convert each Cow<str> to &str
        .output()
        .await
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    Ok(CommandResult {
        code: output.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
    })
}

/// Shell command event types for streaming
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum ShellCommandEvent {
    #[serde(rename_all = "camelCase")]
    Started { command: String, args: Vec<String> },
    #[serde(rename_all = "camelCase")]
    Stdout { line: String },
    #[serde(rename_all = "camelCase")]
    Stderr { line: String },
    #[serde(rename_all = "camelCase")]
    Finished { code: i32 },
    #[serde(rename_all = "camelCase")]
    Error { message: String },
}

// /// Get a shell command by name from the predefined list.
// #[tauri::command]
// pub fn get_shell_command(name: &str) -> Option<ShellCommand> {
//     get_command(name).cloned()
// }

/// Execute a shell command by name with streaming output via channel
#[tauri::command]
pub async fn execute_shell_command_with_channel(
    app_handle: AppHandle,
    name: String,
    on_event: tauri::ipc::Channel<ShellCommandEvent>,
) -> Result<(), String> {
    let cmd = get_shell_command(&name).ok_or_else(|| format!("Command '{}' not found", name))?;

    // Send started event
    on_event
        .send(ShellCommandEvent::Started {
            command: cmd.command.to_string(),
            args: cmd.args.iter().map(|arg| arg.to_string()).collect(),
        })
        .map_err(|e| format!("Failed to send event: {}", e))?;

    let shell = app_handle.shell();

    // Create and spawn the command with event listener
    let (mut rx, _child) = shell
        .command(cmd.command.as_ref()) // Convert Cow<str> to &str
        .args(cmd.args.iter().map(|arg| arg.as_ref())) // Convert each Cow<str> to &str
        .spawn()
        .map_err(|e| format!("Failed to spawn command: {}", e))?;

    // Process command events - wait for all events before returning
    // This ensures the channel stays alive while events are being processed
    while let Some(event) = rx.recv().await {
        match event {
            tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                let line_str = String::from_utf8_lossy(&line).to_string();
                if !line_str.is_empty() {
                    println!("Sending stdout event: {}", line_str);
                    if let Err(e) = on_event.send(ShellCommandEvent::Stdout { line: line_str }) {
                        eprintln!("Failed to send stdout event: {}", e);
                    }
                }
            }
            tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                let line_str = String::from_utf8_lossy(&line).to_string();
                if !line_str.is_empty() {
                    println!("Sending stderr event: {}", line_str);
                    if let Err(e) = on_event.send(ShellCommandEvent::Stderr { line: line_str }) {
                        eprintln!("Failed to send stderr event: {}", e);
                    }
                }
            }
            tauri_plugin_shell::process::CommandEvent::Terminated(status) => {
                let code = status.code.unwrap_or(-1);
                println!("Sending finished event with code: {}", code);
                if let Err(e) = on_event.send(ShellCommandEvent::Finished { code }) {
                    eprintln!("Failed to send finished event: {}", e);
                }
                // Break the loop when the command terminates
                break;
            }
            tauri_plugin_shell::process::CommandEvent::Error(err) => {
                println!("Sending error event: {}", err);
                if let Err(e) = on_event.send(ShellCommandEvent::Error { message: err }) {
                    eprintln!("Failed to send error event: {}", e);
                }
                // Break the loop on error
                break;
            }
            _ => {}
        }
    }

    println!("Command execution completed");

    Ok(())
}
