'use client';

import { BarChart2 } from 'lucide-react';
import React from 'react';

import type { ProjectStatsArtifactData } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface StatsArtifactViewProps {
  activeStats: ProjectStatsArtifactData | null;
}

export const StatsArtifactView: React.FC<StatsArtifactViewProps> = ({ activeStats }) => {
  const projects = activeStats?.projects || [
    {
      name: 'Real Estate CRM System',
      progress: 85,
      tasks_completed: 17,
      tasks_total: 20,
      status: 'On Track',
    },
    {
      name: 'TaskFlow Web Redesign',
      progress: 70,
      tasks_completed: 7,
      tasks_total: 10,
      status: 'On Track',
    },
    {
      name: 'Mobile App React Native',
      progress: 40,
      tasks_completed: 4,
      tasks_total: 10,
      status: 'At Risk',
    },
    {
      name: 'Infrastructure & DB Migration',
      progress: 100,
      tasks_completed: 4,
      tasks_total: 4,
      status: 'Completed',
    },
  ];

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
