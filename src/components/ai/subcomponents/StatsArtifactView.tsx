'use client';

import { BarChart2 } from 'lucide-react';
import React from 'react';

import type { ProjectStatsArtifactData } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface StatsArtifactViewProps {
  activeStats: ProjectStatsArtifactData | null;
}

export const StatsArtifactView: React.FC<StatsArtifactViewProps> = ({ activeStats }) => {
  if (!activeStats || !activeStats.projects || activeStats.projects.length === 0) {
    return (
      <div className={styles.emptyArtifactState}>
        <div className={styles.emptyIcon}>
          <BarChart2 size={28} />
        </div>
        <h3 className={styles.emptyTitle}>No Completion Stats Data Available</h3>
        <p className={styles.emptyDesc}>
          Ask TaskFlow Assistant in the chat (e.g.{' '}
          <em>&quot;Show project completion stats&quot;</em>) to calculate live workspace metrics.
        </p>
      </div>
    );
  }

  const projects = activeStats.projects;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <span className={styles.metricVal}>
            {activeStats ? activeStats.overall_completion_rate : 76}%
          </span>
          <span className={styles.metricLbl}>Overall Progress</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricVal}>{activeStats ? activeStats.total_projects : 4}</span>
          <span className={styles.metricLbl}>Total Projects</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricVal}>{activeStats ? activeStats.completed_tasks : 32}</span>
          <span className={styles.metricLbl}>Completed Tasks</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricVal}>{activeStats ? activeStats.overdue_tasks : 3}</span>
          <span className={styles.metricLbl} style={{ color: '#ef4444' }}>
            Overdue Tasks
          </span>
        </div>
      </div>

      <div className={styles.projectsProgressCard}>
        <h3 className={styles.sectionHeader}>
          <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
          Active Projects Completion Breakdown
        </h3>

        {projects.map((p, pIdx) => (
          <div key={`p_stat_${p.name}_${pIdx}`} className={styles.projectProgressRow}>
            <div className={styles.projectRowHeader}>
              <span className={styles.projectNameText}>{p.name}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                {p.progress}% ({p.tasks_completed}/{p.tasks_total} tasks)
              </span>
            </div>

            <div className={styles.progressTrackBg}>
              <div className={styles.progressTrackFill} style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
