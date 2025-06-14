//! Shell commands used in the application.
//! This module defines all shell commands that are executed from TypeScript code.

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

/// Represents a shell command with its name, command, and arguments.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellCommand {
    pub name: Cow<'static, str>,
    pub command: Cow<'static, str>,
    pub args: Vec<Cow<'static, str>>,
}

/// JSON definition of shell commands.
const COMMANDS_JSON: &str = include_str!("../commands.json");

pub static SHELL_COMMANDS: Lazy<Vec<ShellCommand>> =
    Lazy::new(|| serde_json::from_str(COMMANDS_JSON).expect("Failed to parse commands.json"));
