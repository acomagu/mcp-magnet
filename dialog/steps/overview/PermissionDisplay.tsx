import './PermissionDisplay.css';
import type { PermissionInfo } from '../../runtime';

interface PermissionDisplayProps {
  permissionInfo: PermissionInfo | undefined;
  label?: string;
}

// Denoで利用可能なすべての権限
const ALL_DENO_PERMISSIONS = [
  'read', // ファイルシステム読み取り
  'write', // ファイルシステム書き込み
  'net', // ネットワークアクセス
  'env', // 環境変数
  'run', // サブプロセス実行
  'ffi', // 外部ライブラリ
  'hrtime', // 高精度タイマー
  'sys' // システム情報
];

export function PermissionDisplay({
  permissionInfo,
  label = 'パーミッション：'
}: PermissionDisplayProps) {
  const getPermissionClass = (permission: string): string => {
    // Use consolidated badge classes
    if (permission.includes('すべての権限')) return 'badge-high';
    if (permission.includes('サブプロセス実行') || permission.includes('外部ライブラリ')) return 'badge-high';
    if (permission.includes('ファイル書き込み')) return 'badge-medium';
    return 'badge-standard';
  };


  if (!permissionInfo) return null;

  // 許可されていない権限を特定
  const deniedPermissions = ALL_DENO_PERMISSIONS.filter(perm => {
    // すべての権限が許可されている場合は空配列を返す
    if (permissionInfo.allowAll) {
      return false;
    }

    // 各権限が許可されているかチェック
    return !permissionInfo.permissions.some(p => p.includes(perm));
  });

  return (
    // Keep specific section class if needed, or remove if container handles margin
    <div className="permissions-section">
      {/* Use form-label if consistent */}
      {label && <div className="form-label">{label}</div>}
      {/* Use consolidated panel/card class */}
      <div className="panel permission-container">
        {/* Use consolidated panel-title class */}
        <h4 className="panel-title permission-title">{permissionInfo.title}</h4>
        {permissionInfo.allowAll ? (
          <div className="permission-badges">
            <div className="badge badge-high">
              <span className="permission-text">⚠️ すべての権限</span>
            </div>
          </div>
        ) : permissionInfo.permissions.length > 0 ? (
          <div className="permission-badges">
            {permissionInfo.permissions.map((perm, index) => (
              // Use consolidated badge classes
              <div
                key={index}
                className={`badge ${getPermissionClass(perm)}`}
              >
                <span className="permission-text">{perm}</span>
              </div>
            ))}
          </div>
        ) : (
          // Use consolidated text-muted class
          <p className="text-muted permission-note">個別のパーミッション指定なし</p>
        )}
        {permissionInfo.allowAll && (
          <p className="permission-description">
            すべての権限が付与されます。ファイルシステム、ネットワーク、環境変数など、あらゆるシステムリソースにアクセス可能です。
          </p>
        )}



        {deniedPermissions.length > 0 && (
          <details className="denied-permissions">
            <summary>許可されていない権限 ({deniedPermissions.length})</summary>
            <div className="denied-permissions-content">
              <div className="permission-badges">
                {deniedPermissions.map((perm, index) => (
                  // Use consolidated badge classes + specific denied class
                  <div
                    key={index}
                    className="badge permission-denied"
                  >
                    <span className="permission-text">🚫 {perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
