'use server';

import type { MCPManifest } from '@mcp-magnet/dialog';
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

const envConfigMapSchema = z.record(z.string(), envConfigSchema);
export type EnvConfigMap = z.infer<typeof envConfigMapSchema>;

const envValueMapSchema = z.record(z.string(), z.string());
export type EnvValueMap = z.infer<typeof envValueMapSchema>;

/**
 * MCPマニフェストのスキーマ定義
 */
const mcpManifestSchema = z.object({
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

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

export async function generateManifestFromDescription(
  description: string,
): Promise<MCPManifest> {
  // プロンプト生成
  const prompt = `
You are an expert at creating MCP (Model Context Protocol) manifest configurations.
Based on the following description, generate a valid MCP manifest JSON object.

Description: ${description}

The manifest should include:
- name: A unique identifier (lowercase, hyphen-separated)
- displayName: A human-readable name
- command: The command to execute (e.g., "node", "python", "deno", "docker")
- args: An array of command arguments
- manifestVersion: Set to "1.0.0"
- env (optional): Environment variables configuration if needed

For env variables, use the following format:
{
  "ENV_VAR_NAME": {
    "type": "text" | "boolean" | "select",
    "description": "Description of the variable",
    "required": true | false,
    "options": [{ "value": "val1", "label": "Label 1" }] // only for "select" type
  }
}
`;


  const model = 'gemini-2.0-flash';
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      body: JSON.stringify({
        contents: [{
          parts: { text: prompt },
        }],
        generation_config: {
          response_mime_type: 'application/json',
          response_json_schema: z.toJSONSchema(mcpManifestSchema, { target: 'draft-7' }),
        },
      }),
    });
    const resp = await response.json();
    console.log('Response from Gemini API:', resp);
    const text: string = resp.candidates[0].content.parts.map((part: any) => part.text).join('');

    const manifest = z.safeParse(mcpManifestSchema, JSON.parse(text));
    if (!manifest.success) {
      throw new Error(`Invalid manifest format: ${manifest.error.message}`);
    }

    return manifest.data;
  } catch (err) {
    console.error('Error generating manifest:', err);
    throw new Error('Failed to generate manifest from description');
  }
}

