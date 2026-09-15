'use client';

import { CheckSquare, FileText } from 'lucide-react';
import React from 'react';

import type { AiDraftProposal, AiProposalItem, AiSubtaskItem } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface PlanArtifactViewProps {
  activeProposal: AiDraftProposal | null;
}

export const PlanArtifactView: React.FC<PlanArtifactViewProps> = ({ activeProposal }) => {
  if (!activeProposal) {
    return (
      <div className={styles.emptyArtifactState}>
        <div className={styles.emptyIcon}>
          <FileText size={28} />
        </div>
        <h3 className={styles.emptyTitle}>No Implementation Plan Active</h3>
        <p className={styles.emptyDesc}>
          Ask TaskFlow Assistant in the chat (e.g. <em>&quot;Plan Real Estate CRM Project&quot;</em>
          ) to generate an Implementation Plan.
        </p>
      </div>
    );
  }

  const renderSubtaskItem = (st: string | AiSubtaskItem, idx: number) => {
    if (typeof st === 'string') {
      return (
        <div key={`st_${st}_${idx}`} className={styles.subtaskItem}>
          <div className={styles.subtaskTitleRow}>
            <CheckSquare size={14} className={styles.subtaskCheck} />
            <span className={styles.subtaskTitle}>{st}</span>
          </div>
        </div>
      );
    }
    return (
      <div key={`st_obj_${st.title}_${idx}`} className={styles.subtaskItem}>
        <div className={styles.subtaskTitleRow}>
          <CheckSquare size={14} className={styles.subtaskCheck} />
          <span className={styles.subtaskTitle}>{st.title}</span>
        </div>
        {st.description && <div className={styles.subtaskDesc}>{st.description}</div>}
      </div>
    );
  };

  return (
    <div className={styles.planDocument}>
      <h2 className={styles.docTitle}># {activeProposal.proposal_data.project_name}</h2>

      <div>
        <h3 className={styles.sectionHeader}>Goal &amp; Scope Overview</h3>
        <p
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'var(--muted-foreground)',
          }}
        >
          {activeProposal.proposal_data.description || activeProposal.description}
        </p>
      </div>

      {activeProposal.status === 'pending' && (
        <div>
          <h3 className={styles.sectionHeader}>User Review Required</h3>
          <div className={styles.reviewAlertBox}>
            Inspect the task list and detailed subtask specs below. Clicking{' '}
            <strong>Proceed</strong> will execute database creation of the project and all listed
            tasks.
          </div>
        </div>
      )}

      <div>
        <h3 className={styles.sectionHeader}>Proposed Project Tasks &amp; Subtasks</h3>

        <div className={styles.tasksGrid}>
          {activeProposal.proposal_data.tasks.map((task: AiProposalItem, idx: number) => (
            <div key={`task_${task.title}_${idx}`} className={styles.taskCardItem}>
              <div className={styles.taskHeader}>
                <span className={styles.taskTitleText}>{task.title}</span>
                <span
                  className={`${styles.taskPriorityBadge} ${
                    task.priority === 'high'
                      ? styles.priorityHigh
                      : task.priority === 'low'
                        ? styles.priorityLow
                        : styles.priorityMedium
                  }`}
                >
                  {task.priority || 'medium'}
                </span>
              </div>

              {task.description && <div className={styles.taskDescription}>{task.description}</div>}

              {task.due_date && (
                <div className={styles.taskMeta}>Target Deadline: {task.due_date}</div>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <div className={styles.subtasksContainer}>
                  <div className={styles.subtaskLabel}>
                    Subtasks &amp; Technical Specifications ({task.subtasks.length}):
                  </div>
                  {task.subtasks.map((st, stIdx) => renderSubtaskItem(st, stIdx))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
