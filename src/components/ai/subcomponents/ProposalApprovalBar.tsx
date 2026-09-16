'use client';

import { Play, Send } from 'lucide-react';
import React from 'react';

import type { AiDraftProposal } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

import type { ReviewComment } from './PlanArtifactView';

interface ProposalApprovalBarProps {
  activeProposal: AiDraftProposal | null;
  reviewComments: ReviewComment[];
  onProceed: () => void;
  onSubmitPlanReview: () => void;
}

export const ProposalApprovalBar: React.FC<ProposalApprovalBarProps> = ({
  activeProposal,
  reviewComments,
  onProceed,
  onSubmitPlanReview,
}) => {
  if (!activeProposal) return null;

  const isPending =
    !activeProposal.status ||
    activeProposal.status === 'pending' ||
    (activeProposal.status as string) === 'draft';

  return (
    <div className={styles.approvalBar}>
      <div className={styles.approvalMessage}>
        {isPending
          ? reviewComments.length > 0
            ? `${reviewComments.length} review comment(s) queued. Ready to submit for plan refinement?`
            : 'Review complete? Execute implementation plan in database:'
          : activeProposal.status === 'executed'
            ? 'Plan has been executed in database.'
            : 'Plan was discarded.'}
      </div>

      {isPending && (
        <div className={styles.approvalButtons}>
          {reviewComments.length > 0 && (
            <button type="button" className={styles.submitReviewBtn} onClick={onSubmitPlanReview}>
              <Send size={15} />
              <span>Submit Plan Review ({reviewComments.length})</span>
            </button>
          )}

          <button type="button" className={styles.proceedBtn} onClick={onProceed}>
            <Play size={15} fill="currentColor" />
            <span>Proceed &amp; Create Project</span>
          </button>
        </div>
      )}
    </div>
  );
};
