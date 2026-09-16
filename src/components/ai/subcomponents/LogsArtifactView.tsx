'use client';

import React from 'react';

import type { AiExecutedAction } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface LogsArtifactViewProps {
  executionLogs: Array<string | AiExecutedAction>;
}

export const LogsArtifactView: React.FC<LogsArtifactViewProps> = ({ executionLogs }) => {
  return (
    <div className={styles.executionLogTerminal}>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.8125rem',
          color: '#10b981',
          marginBottom: '0.5rem',
        }}
      >
        $ taskflow-agent --watch --live
      </div>
      {executionLogs.length === 0 ? (
        <div style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          No terminal execution output yet. Execute a proposal plan to stream server logs here.
        </div>
      ) : (
        executionLogs.map((log, idx) => {
          const content =
            typeof log === 'string'
              ? log
              : `[${log.tool}] ${JSON.stringify(log.params || log.result)}`;

          return (
            <div key={`log_${idx}`} style={{ margin: '0.2rem 0' }}>
              {content}
            </div>
          );
        })
      )}
    </div>
  );
};
