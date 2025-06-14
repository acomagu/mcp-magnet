import React, { useState, useEffect } from 'react';
import '@mcp-magnet/styles/components.css';
import { type EnvConfigMap, type EnvValueMap, isSelectEnvConfig, isBooleanEnvConfig, isTextEnvConfig } from '../../mcpConfigManager';

interface EnvConfigFormProps {
  envConfig: EnvConfigMap;
  onSubmit: (values: EnvValueMap) => void;
  initialValues?: EnvValueMap;
}

const EnvConfigForm: React.FC<EnvConfigFormProps> = ({
  envConfig,
  onSubmit,
  initialValues = {}
}) => {
  // フォームの値を管理するステート
  const [values, setValues] = useState<EnvValueMap>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期値をセット
  useEffect(() => {
    const defaultValues: EnvValueMap = {};

    // 各環境変数に対して初期値を設定
    Object.entries(envConfig).forEach(([key, config]) => {
      // すでに値が与えられている場合はそれを使用
      if (initialValues && initialValues[key] !== undefined) {
        defaultValues[key] = initialValues[key];
      }
      // 選択型の場合は最初の選択肢をデフォルト値として使用
      else if (isSelectEnvConfig(config) && config.options.length > 0) {
        defaultValues[key] = config.options[0]?.value ?? '';
      }
      // ブール型の場合はfalseをデフォルト値として使用
      else if (isBooleanEnvConfig(config)) {
        defaultValues[key] = 'false';
      }
      // テキスト型の場合は空文字列をデフォルト値として使用
      else {
        defaultValues[key] = '';
      }
    });

    setValues(defaultValues);
  }, [envConfig, initialValues]);

  // フォーム入力値の変更ハンドラ
  const handleChange = (key: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));

    // エラーがあれば消去
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションを実行
    const newErrors: Record<string, string> = {};

    Object.entries(envConfig).forEach(([key, config]) => {
      // 必須項目のチェック
      if (config.required && (!values[key] || values[key].trim() === '')) {
        newErrors[key] = 'この項目は必須です';
      }
    });

    // エラーがあれば表示して中断
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // フォームから空の値を除外
    const filteredValues = Object.entries(values).reduce<EnvValueMap>((acc, [key, value]) => {
      if (value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // 送信
    onSubmit(filteredValues);
  };

  // 環境変数が存在しない場合
  if (!envConfig || Object.keys(envConfig).length === 0) {
    return (
      <div className="card">
        <p className="env-config-form-empty">環境変数の設定はありません</p>
      </div>
    );
  }

  return (
    <form className="env-config-form" onSubmit={handleSubmit} id="env-config-form">
      <p className="form-description mb-3">
        MCP サーバーに渡す環境変数を設定してください
      </p>

      <div className="env-config-form-fields">
        {Object.entries(envConfig).map(([key, config]) => (
          <div className="form-group" key={key}>
            <label className="form-label">
              {key}
              {config.required && <span className="required-mark">*</span>}
            </label>
            <p className="form-description">{config.description}</p>

            {/* テキスト入力型フィールド */}
            {isTextEnvConfig(config) && (
              <input
                type="text"
                className="form-control"
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                required={config.required}
              />
            )}

            {/* 選択型フィールド */}
            {isSelectEnvConfig(config) && (
              <select
                className="form-control"
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                required={config.required}
              >
                {config.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* ブール型フィールド */}
            {isBooleanEnvConfig(config) && (
              <div className="form-check-group">
                <label className="form-check">
                  <input
                    type="radio"
                    name={key}
                    value="true"
                    checked={values[key] === 'true'}
                    onChange={() => handleChange(key, 'true')}
                    required={config.required}
                    className="form-check-input"
                  />
                  <span className="form-check-label">ON</span>
                </label>
                <label className="form-check">
                  <input
                    type="radio"
                    name={key}
                    value="false"
                    checked={values[key] === 'false'}
                    onChange={() => handleChange(key, 'false')}
                    required={config.required}
                    className="form-check-input"
                  />
                  <span className="form-check-label">OFF</span>
                </label>
              </div>
            )}

            {/* エラーメッセージ */}
            {errors[key] && (
              <p className="form-error">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </form>
  );
};

export default EnvConfigForm;
