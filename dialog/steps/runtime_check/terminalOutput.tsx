import React, { useEffect, useRef, useState } from 'react';
import './terminalOutput.css';

interface TerminalOutputProps {
  onStdout?: (callback: (data: string) => void) => void;
  onStderr?: (callback: (data: string) => void) => void;
  className?: string;
}

/**
 * ターミナル出力を表示するコンポーネント
 * onStdout/onStderr関数を受け取り、それぞれの出力を適切に表示します
 */
export function TerminalOutput({ onStdout, onStderr, className = '' }: TerminalOutputProps): React.ReactElement {
  const [lines, setLines] = useState<Array<{ text: string; type: 'stdout' | 'stderr' }>>([]);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // 標準出力のリスナーを登録
  useEffect(() => {
    if (onStdout) {
      onStdout((data) => {
        setLines(prev => [...prev, { text: data, type: 'stdout' }]);
      });
    }
  }, [onStdout]);

  // 標準エラー出力のリスナーを登録
  useEffect(() => {
    if (onStderr) {
      onStderr((data) => {
        setLines(prev => [...prev, { text: data, type: 'stderr' }]);
      });
    }
  }, [onStderr]);

  // 新しい出力があるときに自動的に下にスクロール
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines]);

  if (lines.length === 0) {
    return <div className={`terminal-output ${className} empty`} />;
  }

  return (
    <div className={`terminal-output ${className}`}>
      {lines.map((line, index) => (
        <div
          key={index}
          className={`terminal-line ${line.type === 'stderr' ? 'error' : ''}`}
        >
          {line.text}
        </div>
      ))}
      <div ref={outputEndRef} />
    </div>
  );
}
