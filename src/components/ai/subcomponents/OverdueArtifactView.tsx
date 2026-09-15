'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

import type { OverdueTasksArtifactData } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface OverdueArtifactViewProps {
  activeOverdue: OverdueTasksArtifactData | null;
  onNotifyAssignee: (assignee: string) => void;
  onExtendDeadline: (title: string) => void;
}

export const OverdueArtifactView: React.FC<OverdueArtifactViewProps> = ({
  activeOverdue,
  onNotifyAssignee,
  onExtendDeadline,
}) => {
  const items = activeOverdue?.items || [
    {
      id: 'task_ov_1',
      title: 'Fix Payment Gateway Webhook Timeout',
      project_name: 'Real Estate CRM System',
      assignee: 'Bhumik Patel',
      due_date: '2026-09-11',
      days_overdue: 4,
      priority: 'high' as const,
    },
    {
      id: 'task_ov_2',
      title: 'Publish React Native iOS TestFlight Build',
      project_name: 'Mobile App React Native',
      assignee: 'Sarah Connor',
      due_date: '2026-09-13',
      days_overdue: 2,
      priority: 'high' as const,
    },
    {
      id: 'task_ov_3',
      title: 'Audit User Role Permissions Schema',
      project_name: 'TaskFlow Web Redesign',
      assignee: 'Alex Rivera',
      due_date: '2026-09-14',
      days_overdue: 1,
      priority: 'medium' as const,
    },
  ];

  return (
    <div className={styles.overdueContainer}>
      <div className={styles.overdueBanner}>
        <div className={styles.overdueBannerTitle}>
          <AlertTriangle size={18} />
          {activeOverdue ? activeOverdue.total_overdue : 3} Overdue Task(s) Detected
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
          }}
        >
          Requires Attention
        </span>
      </div>

      {items.map((item, itemIdx) => (
        <div key={`ov_item_${item.id}_${itemIdx}`} className={styles.overdueCard}>
          <div className={styles.taskHeader}>
            <span className={styles.taskTitleText}>{item.title}</span>
            <span className={styles.daysOverdueTag}>{item.days_overdue} Day(s) Overdue</span>
          </div>

          <div className={styles.taskMeta}>
            <span>Project: {item.project_name}</span>
            <span>•</span>
            <span>Assignee: {item.assignee}</span>
            <span>•</span>
            <span>Due: {item.due_date}</span>
          </div>

          <div className={styles.overdueActions}>
            <button className={styles.actionSmBtn} onClick={() => onNotifyAssignee(item.assignee)}>
              Notify Assignee
            </button>

            <button className={styles.actionSmBtn} onClick={() => onExtendDeadline(item.title)}>
              Extend Deadline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
