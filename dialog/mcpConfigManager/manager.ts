// Combined MCPTypes.ts and manager.ts
import * as z from '@zod/mini';

// --- ManifestTypes ---

/**
 * EnvConfigスキーマ定義
 */
const envOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const textEnvConfigSchema = z.object({
  type: z.literal('text'),
  description: z.string(),
  required: z.optional(z.boolean()),
  options: z.optional(z.array(envOptionSchema)),
});

export type TextEnvConfig = z.infer<typeof textEnvConfigSchema>;

const selectEnvConfigSchema = z.object({
  type: z.literal('select'),
  description: z.string(),
  required: z.optional(z.boolean()),
  options: z.array(envOptionSchema),
});

export type SelectEnvConfig = z.infer<typeof selectEnvConfigSchema>;

const booleanEnvConfigSchema = z.object({
  type: z.literal('boolean'),
  description: z.string(),
  required: z.optional(z.boolean()),
});

export type BooleanEnvConfig = z.infer<typeof booleanEnvConfigSchema>;

// discriminated union を使用して型を区別
const envConfigSchema = z.discriminatedUnion([
  textEnvConfigSchema,
  selectEnvConfigSchema,
  booleanEnvConfigSchema
]);

export type EnvConfig = z.infer<typeof envConfigSchema>;

export const envConfigMapSchema = z.record(z.string(), envConfigSchema);
export type EnvConfigMap = z.infer<typeof envConfigMapSchema>;

const envValueMapSchema = z.record(z.string(), z.string());
export type EnvValueMap = z.infer<typeof envValueMapSchema>;

/**
 * MCPマニフェストのスキーマ定義
 */
export const mcpManifestSchema = z.object({
  name: z.string().check(z.minLength(3), z.regex(/[a-zA-Z0-9\-_]+/)), // name をIDとして使用
  displayName: z.optional(z.string()), // 表示用の名前を追加
  command: z.string().check(z.minLength(1)),
  args: z.array(z.string()),
  env: z.optional(envConfigMapSchema),
  description: z.optional(z.string()),
  manifestVersion: z.string(), // manifest version
  manifestAuthor: z.optional(z.string()),
  url: z.optional(z.string()),
});

/**
 * MCPマニフェストの型定義
 */
export type MCPManifest = z.infer<typeof mcpManifestSchema>;

// --- MCPConfig ---

export interface MCPConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface ProjectMCPConfigManager {
  upsert(name: string, config: MCPConfig): Promise<void>;
  getConfigFilePath(): Promise<string>;
  // getConfig(name: string): Promise<MCPConfig | null>;
  // deleteConfig(name: string): Promise<void>;
  // listConfigs(): Promise<MCPConfig[]>;
}

export interface MCPClientInfo {
  id: string;
  name: string;
  iconColor: string;
  supportsProjects: boolean;
}

export interface MCPConfigManager extends ProjectMCPConfigManager {
  getProject?(projectPath: string): ProjectMCPConfigManager;
  getClientInfo(): MCPClientInfo;
  refresh?(): Promise<void>;
  refreshInstrument?: string;
}
