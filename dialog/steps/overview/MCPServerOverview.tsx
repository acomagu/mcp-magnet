import type { MCPManifest } from '../../mcpConfigManager';
import type { PermissionInfo } from '../../runtime';
import { PermissionDisplay } from './PermissionDisplay';

interface MCPServerOverviewProps {
  manifest: MCPManifest;
  permissionInfo: PermissionInfo | undefined;
  onClose: () => void;
  onSubmit: () => void;
}

export function MCPServerOverview({
  manifest,
  permissionInfo,
  onClose,
  onSubmit,
}: MCPServerOverviewProps) {
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>{manifest.displayName || manifest.name} のインストール</h2>
      </div>
      <div className="step-content">
        <div className="card">
          <h4>
            {manifest.displayName || manifest.name || manifest.command}
            {manifest.manifestVersion && (
              <span className="badge badge-standard" style={{ marginLeft: '8px', fontSize: '0.7em' }}>
                v{manifest.manifestVersion}
              </span>
            )}
          </h4>

          {manifest.description && (
            <p className="text-muted mb-3">{manifest.description}</p>
          )}

          <div className="form-group">
            <label className="form-label">Command</label>
            <code className="command-preview">
              {manifest.command} {manifest.args.join(' ')}
            </code>
          </div>

          {manifest.manifestAuthor && (
            <div className="form-group">
              <label className="form-label">Author</label>
              <div>{manifest.manifestAuthor}</div>
            </div>
          )}
        </div>

        <h4>権限情報</h4>
        <div className="mt-2">
          {permissionInfo ? (
            <PermissionDisplay permissionInfo={permissionInfo} label="" />
          ) : (
            <div className="card permission-section">
              <span className="permission-text">権限情報がありません</span>

              <p className="permission-description">
                すべての権限が付与される可能性があります。
              </p>
            </div>
          )}
        </div>

        <div className="step-footer">
          <button type="button" className="button btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button type="button" className="button btn-primary" onClick={onSubmit}>
            進む
          </button>
        </div>
      </div>
    </div>
  );
}
