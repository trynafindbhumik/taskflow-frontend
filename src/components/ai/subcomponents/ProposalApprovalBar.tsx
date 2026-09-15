'use client';

import { Play } from 'lucide-react';
import React from 'react';

import type { AiDraftProposal } from '@/utils/types';

import styles from '../AiWorkspace.module.css';

interface ProposalApprovalBarProps {
  activeProposal: AiDraftProposal | null;
  onProceed: () => void;
}

export const ProposalApprovalBar: React.FC<ProposalApprovalBarProps> = ({
  activeProposal,
  onProceed,
}) => {
  if (!activeProposal) return null;

  return (
    <div className={styles.approvalBar}>
      <div className={styles.approvalMessage}>
        {activeProposal.status === 'pending'
          ? 'Review complete? Execute implementation plan in database:'
          : activeProposal.status === 'executed'
            ? 'Plan has been executed in database.'
            : 'Plan was discarded.'}
      </div>

      {activeProposal.status === 'pending' && (
        <div className={styles.approvalButtons}>
          <button className={styles.proceedBtn} onClick={onProceed}>
            <Play size={15} fill="currentColor" />
            <span>Proceed</span>
          </button>
        </div>
      )}
    </div>
  );
};
