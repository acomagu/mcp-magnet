import type { EnvConfig, TextEnvConfig, SelectEnvConfig, BooleanEnvConfig } from './manager';

// テキスト型かどうか - type フィールドを使用して判別
export function isTextEnvConfig(config: EnvConfig): config is TextEnvConfig {
  return config.type === 'text';
}

// 選択型かどうか - type フィールドを使用して判別
export function isSelectEnvConfig(config: EnvConfig): config is SelectEnvConfig {
  return config.type === 'select';
}

// ブール型かどうか - type フィールドを使用して判別
export function isBooleanEnvConfig(config: EnvConfig): config is BooleanEnvConfig {
  return config.type === 'boolean';
}
