'use client';

import { Clock, Trash2, X } from 'lucide-react';
import React from 'react';

import type {
  AiDraftProposal,
  ProjectStatsArtifactData,
  OverdueTasksArtifactData,
  TeamWorkloadArtifactData,
  AiExecutionLogItem,
} from '@/utils/types';

import styles from '../AiWorkspace.module.css';

export interface LocalChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  executedActions?: AiExecutionLogItem[];
  proposal?: AiDraftProposal;
  artifactType?: 'plan' | 'stats' | 'overdue' | 'workload';
  statsData?: ProjectStatsArtifactData;
  overdueData?: OverdueTasksArtifactData;
  workloadData?: TeamWorkloadArtifactData;
}

export interface StoredSession {
  id: string;
  title: string;
  timestamp: string;
  messages: LocalChatMessage[];
  activeTab: 'plan' | 'stats' | 'overdue' | 'workload' | 'logs';
  proposal?: AiDraftProposal | null;
  statsData?: ProjectStatsArtifactData | null;
  overdueData?: OverdueTasksArtifactData | null;
  workloadData?: TeamWorkloadArtifactData | null;
}

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storedSessions: StoredSession[];
  activeConversationId?: string;
  onSelectSession: (session: StoredSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  storedSessions,
  activeConversationId,
  onSelectSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.historyDrawerOverlay} onClick={onClose}>
      <div className={styles.historyDrawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.historyDrawerHeader}>
          <div className={styles.historyDrawerTitle}>
            <Clock size={16} />
            Chat History
          </div>
          <button
            type="button"
            className={styles.historyCloseBtn}
            onClick={onClose}
            title="Close History"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.historyList}>
          {storedSessions.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: '0.85rem',
              }}
            >
              No previous chat history found.
            </div>
          ) : (
            storedSessions.map((s) => (
              <div
                key={s.id}
                className={`${styles.historyItem} ${
                  s.id === activeConversationId ? styles.historyItemActive : ''
                }`}
                onClick={() => onSelectSession(s)}
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <div className={styles.historyTitle} style={{ flex: 1, paddingRight: '0.5rem' }}>
                    {s.title}
                  </div>
                  {onDeleteSession && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted-foreground)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete chat session"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className={styles.historyMeta}>{s.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
