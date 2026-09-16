'use client';

import { UserCheck } from 'lucide-react';
import React from 'react';

import type { TeamWorkloadArtifactData } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface WorkloadArtifactViewProps {
  activeWorkload: TeamWorkloadArtifactData | null;
}

export const WorkloadArtifactView: React.FC<WorkloadArtifactViewProps> = ({ activeWorkload }) => {
  if (
    !activeWorkload ||
    !activeWorkload.workload_summary ||
    activeWorkload.workload_summary.length === 0
  ) {
    return (
      <div className={styles.emptyArtifactState}>
        <div className={styles.emptyIcon}>
          <UserCheck size={28} />
        </div>
        <h3 className={styles.emptyTitle}>No Team Workload Data Available</h3>
        <p className={styles.emptyDesc}>
          Ask TaskFlow Assistant in the chat (e.g. <em>&quot;Show team workload summary&quot;</em>)
          to analyze team capacity.
        </p>
      </div>
    );
  }

  const summary = activeWorkload.workload_summary;

  return (
    <div className={styles.workloadContainer}>
      <h3 className={styles.sectionHeader}>
        <UserCheck size={18} style={{ color: 'var(--primary)' }} />
        Team Capacity &amp; Task Allocation
      </h3>

      <div className={styles.workloadGrid}>
        {summary.map((m, mIdx) => (
          <div key={`workload_m_${m.member_name}_${mIdx}`} className={styles.workloadCard}>
            <div className={styles.memberHeader}>
              <div className={styles.memberAvatarInfo}>
                <div className={styles.avatarBadge}>{m.member_name.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.member_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    {m.email}
                  </div>
                </div>
              </div>

              <span
                className={
                  m.status === 'Overloaded'
                    ? styles.workloadStatusOverloaded
                    : m.status === 'Optimal'
                      ? styles.workloadStatusOptimal
                      : styles.workloadStatusAvailable
                }
              >
                {m.status}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Assigned Tasks: {m.assigned_count}
            </div>

            {m.top_task && (
              <div style={{ fontSize: '0.775rem', color: 'var(--muted-foreground)' }}>
                Primary: &quot;{m.top_task}&quot;
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
