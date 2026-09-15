'use client';

import { Loader2, Mail, UserMinus } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button/Button';
import { SideSheet } from '@/components/ui/sideSheet/SideSheet';
import type { User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

interface ProjectMembersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  allUsers: User[];
  currentUser: User | null;
  ownerId?: string;
  removingId: string | null;
  addingId: string | null;
  inviteEmails: string;
  setInviteEmails: (val: string) => void;
  isInviting: boolean;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onLeaveProject: (userId: string) => void;
  onSendInvites: () => void;
}

export const ProjectMembersSheet: React.FC<ProjectMembersSheetProps> = ({
  isOpen,
  onClose,
  members,
  allUsers,
  currentUser,
  ownerId,
  removingId,
  addingId,
  inviteEmails,
  setInviteEmails,
  isInviting,
  onAddMember,
  onRemoveMember,
  onLeaveProject,
  onSendInvites,
}) => {
  const nonMembers = (allUsers || []).filter(
    (u) => u && u.id && !(members || []).some((m) => m && m.id === u.id)
  );

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Project Members"
      description="Manage who can be assigned tasks in this project"
    >
      <div className={styles.membersPanel}>
        <p className={styles.membersSectionLabel}>Current Members ({members.length})</p>
        {members.map((m) => {
          const isOwner = m.id === ownerId;
          const isSelf = m.id === currentUser?.id;
          const isCurrentOwner = currentUser?.id === ownerId;

          return (
            <div key={m.id} className={styles.memberRow}>
              <div className={styles.memberAvatar}>
                {m.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <span className={styles.memberName}>{m.name}</span>
                <span className={styles.memberEmail}>{m.email}</span>
              </div>
              {isOwner ? (
                <span className={styles.ownerBadge}>Owner</span>
              ) : isSelf ? (
                <button
                  type="button"
                  className={styles.leaveMemberBtn}
                  onClick={() => onLeaveProject(m.id)}
                  disabled={removingId === m.id}
                >
                  {removingId === m.id ? <Loader2 size={13} className={styles.spinner} /> : 'Leave'}
                </button>
              ) : isCurrentOwner ? (
                <button
                  type="button"
                  className={styles.removeMemberBtn}
                  onClick={() => onRemoveMember(m.id)}
                  disabled={removingId === m.id}
                  title="Remove member"
                >
                  {removingId === m.id ? (
                    <Loader2 size={14} className={styles.spinner} />
                  ) : (
                    <UserMinus size={14} />
                  )}
                </button>
              ) : null}
            </div>
          );
        })}

        {nonMembers.length > 0 && (
          <>
            <p className={`${styles.membersSectionLabel} ${styles.membersSectionLabelSep}`}>
              Quick Add Existing Users
            </p>
            {nonMembers.map((u) => (
              <div key={u.id} className={styles.memberRow}>
                <div className={`${styles.memberAvatar} ${styles.memberAvatarMuted}`}>
                  {u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{u.name}</span>
                  <span className={styles.memberEmail}>{u.email}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddMember(u.id)}
                  isLoading={addingId === u.id}
                >
                  Add
                </Button>
              </div>
            ))}
          </>
        )}

        <div className={styles.inviteSection}>
          <p className={styles.membersSectionLabel}>Invite New People</p>
          <p className={styles.inviteHint}>
            Enter email addresses (separated by comma or space). They will be invited to join this
            project.
          </p>

          <div className={styles.inviteInputWrap}>
            <Mail size={18} className={styles.inviteIcon} />
            <input
              type="text"
              className={styles.inviteInput}
              placeholder="john@example.com, sarah@company.com"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendInvites()}
            />
          </div>

          <Button
            onClick={onSendInvites}
            isLoading={isInviting}
            leftIcon={<Mail size={16} />}
            className={styles.inviteBtn}
          >
            Send Invites
          </Button>
        </div>

        {nonMembers.length === 0 && inviteEmails === '' && (
          <p className={styles.emptyMembersHint}>
            All available users are already members. Use the invite box above to bring in new
            people.
          </p>
        )}
      </div>
    </SideSheet>
  );
};
