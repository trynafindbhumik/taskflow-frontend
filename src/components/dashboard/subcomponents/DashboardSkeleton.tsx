'use client';

import React from 'react';

import styles from '../Dashboard.module.css';

export const DashboardSkeleton: React.FC = () => (
  <div className={styles.container}>
    <main className={styles.main}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.skeletonWelcomeWrapper}>
          <div className={`skeleton ${styles.skeletonTitleLine}`} />
          <div className={`skeleton ${styles.skeletonSubtitleLine}`} />
        </div>
        <div className={`skeleton ${styles.skeletonButton}`} />
      </div>

      {/* Stats Grid Skeleton (4 cards) */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={`stat_skel_${i}`} className={styles.statCard}>
            <div className={`skeleton ${styles.skeletonStatIcon}`} />
            <div className={styles.skeletonStatBody}>
              <div className={`skeleton ${styles.skeletonStatValueLine}`} />
              <div className={`skeleton ${styles.skeletonStatLabelLine}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Projects Section Skeleton */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={`skeleton ${styles.skeletonSectionTitleLine}`} />
          <div className={`skeleton ${styles.skeletonSectionLinkLine}`} />
        </div>

        <div className={styles.projectGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={`proj_skel_${i}`} className={styles.skeletonProjectCard}>
              <div className={styles.skeletonProjectHeader}>
                <div className={styles.skeletonProjectTitleGroup}>
                  <div className={`skeleton ${styles.skeletonProjectIcon}`} />
                  <div className={`skeleton ${styles.skeletonProjectNameLine}`} />
                </div>
                <div className={`skeleton ${styles.skeletonProjectMenuIcon}`} />
              </div>
              <div className={`skeleton ${styles.skeletonProjectDescLine}`} />
              <div className={styles.skeletonProjectFooter}>
                <div className={styles.skeletonProjectMetaRow}>
                  <div className={`skeleton ${styles.skeletonProjectMetaLineLeft}`} />
                  <div className={`skeleton ${styles.skeletonProjectMetaLineRight}`} />
                </div>
                <div className={`skeleton ${styles.skeletonProjectTrackBar}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deadlines Section Skeleton */}
      <div className={`${styles.section} ${styles.skeletonDeadlinesSection}`}>
        <div className={styles.sectionHeader}>
          <div className={`skeleton ${styles.skeletonDeadlineSectionTitleLine}`} />
        </div>

        <div className={styles.skeletonDeadlineList}>
          {[1, 2, 3].map((i) => (
            <div key={`dead_skel_${i}`} className={styles.skeletonDeadlineItem}>
              <div className={styles.skeletonDeadlineLeft}>
                <div className={`skeleton ${styles.skeletonDeadlineIcon}`} />
                <div className={`skeleton ${styles.skeletonDeadlineText}`} />
              </div>
              <div className={`skeleton ${styles.skeletonDeadlineBadge}`} />
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);
