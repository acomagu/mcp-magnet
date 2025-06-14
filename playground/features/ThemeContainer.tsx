import React from 'react';
import '@mcp-magnet/styles/global.css';
import '@mcp-magnet/styles/components.css';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContainerProps {
  themeMode?: ThemeMode;
  className?: string;
  children: React.ReactNode;
}

/**
 * A container component that applies theme classes based on the selected theme mode
 */
export const ThemeContainer: React.FC<ThemeContainerProps> = ({
  themeMode = 'system',
  className = '',
  children
}) => {
  const themeClass =
    themeMode === 'dark' ? 'theme-dark' :
    themeMode === 'light' ? 'theme-light' :
    'theme-system';

  return (
    <div className={`theme-container ${className} ${themeClass}`}>
      {children}
    </div>
  );
};
