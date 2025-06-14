import * as path from '@tauri-apps/api/path';
import * as fs from '@tauri-apps/plugin-fs';
import * as z from '@zod/mini';

export async function readJSONFile<T extends z.ZodMiniType>(schema: T, filePath: string, fallback: z.infer<T>): Promise<z.infer<T>> {
  if (await fs.exists(filePath)) {
    const content = await fs.readTextFile(filePath);
    const obj = JSON.parse(content);
    const { data, error } = schema.safeParse(obj);
    if (error) throw new Error(`Unexpected form of config content: ${error}`);
    return data;
  }
  return fallback;
}

export async function writeJSONFile<T extends z.ZodMiniType>(schema: T, filePath: string, data: z.infer<T>): Promise<void> {
  try {
    const { error } = schema.safeParse(data);
    if (error) throw error;

    const dir = await path.dirname(filePath);
    if (!await fs.exists(dir)) {
      await fs.mkdir(dir);
    }

    await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing JSON file:', error);
    throw error;
  }
}
