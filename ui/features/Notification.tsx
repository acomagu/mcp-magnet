import { useEffect } from "react";
// Notification.cssは削除し、共通コンポーネントスタイルを使用

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    // 5秒後に自動的に閉じる
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  );
}

export default Notification;
