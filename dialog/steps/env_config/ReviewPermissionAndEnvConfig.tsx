import { type MCPManifest, type EnvValueMap, type EnvConfigMap, envConfigMapSchema } from "../../mcpConfigManager";
import EnvConfigForm from "./EnvConfigForm";
import { type MCPConfig } from "../../mcpConfigManager";

interface ReviewPermissionAndEnvConfigProps {
  manifest: MCPManifest;
  initialValues?: EnvValueMap;
  onClose?: () => void;
  onSubmitEnv: (values: EnvValueMap) => void;
}

export function ReviewPermissionAndEnvConfig({
  manifest,
  initialValues,
  onClose,
  onSubmitEnv
}: ReviewPermissionAndEnvConfigProps) {
  let envConfigMap: EnvConfigMap | null = null;
  if (manifest.env && typeof manifest.env === 'object') {
    console.log(manifest.env);
    const parsed = envConfigMapSchema.safeParse(manifest.env);
    if (parsed.success) {
      envConfigMap = parsed.data;
    } else {
      console.error(parsed.error);
    }
  }
  const hasEnvConfig = !!envConfigMap;

  const handleFormSubmit = (values: EnvValueMap) => {
    console.log("EnvConfigForm submitted in AppSelector:", values);
    onSubmitEnv(values);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>環境変数の設定</h2>
      </div>

      <div className="step-content">
        {hasEnvConfig && envConfigMap ? (
          <EnvConfigForm
            envConfig={envConfigMap}
            initialValues={initialValues}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <p className="env-config-form-empty">No environment variables required for this configuration.</p>
        )}
      </div>

      <div className="step-footer">
        <button type="button" className="button btn-secondary" onClick={onClose}>
          キャンセル
        </button>
        {hasEnvConfig && envConfigMap ? (
          <button
            type="submit"
            className="button btn-primary"
            form="env-config-form"
          >
            進む
          </button>
        ) : (
          <button
            type="button"
            className="button btn-primary"
            onClick={() => onSubmitEnv({})}
          >
            進む
          </button>
        )}
      </div>
    </div>
  );
}

// 環境変数設定をスキップするかどうかを判断するための静的メソッド
ReviewPermissionAndEnvConfig.shouldSkip = (manifest: MCPManifest): boolean => {
  // 環境変数が存在するかチェック
  if (!manifest.env || typeof manifest.env !== 'object') {
    return true; // 環境変数がない場合はスキップ
  }

  // 環境変数の設定が必要かどうかをチェック
  const hasEnvConfig = Object.values(manifest.env).some(
    (value) => value !== null && typeof value === 'object' && 'description' in value
  );

  // 環境変数の設定が必要ない場合はスキップ
  return !hasEnvConfig;
};
