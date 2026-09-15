'use client';

import { Clock, X } from 'lucide-react';
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
}


export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  storedSessions,
  activeConversationId,
  onSelectSession,
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
                className={`${styles.historyItem} ${s.id === activeConversationId ? styles.historyItemActive : ''
                  }`}
                onClick={() => onSelectSession(s)}
              >
                <div className={styles.historyTitle}>{s.title}</div>
                <div className={styles.historyMeta}>
                  {s.timestamp} • {s.messages.length} message(s)
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
