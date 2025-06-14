import * as z from '@zod/mini';

export const installerConfigSchema = z.object({
  enabledClients: z.record(z.string(), z.boolean()), // Removed .default({})
  lastUpdated: z.optional(z.string()),
});

export type InstallerConfig = z.infer<typeof installerConfigSchema>;

export interface InstallerConfigService {
  loadConfig(): Promise<InstallerConfig>;
  saveConfig(config: InstallerConfig): Promise<void>;
}
