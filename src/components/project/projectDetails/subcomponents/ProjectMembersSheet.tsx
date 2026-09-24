'use client';

import { Check, Loader2, Mail, Search, UserMinus, UserPlus, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button/Button';
import { SideSheet } from '@/components/ui/sideSheet/SideSheet';
import { apiFetch } from '@/utils/api';
import type { User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

interface ProjectMembersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  allUsers?: User[];
  currentUser: User | null;
  ownerId?: string;
  removingId: string | null;
  addingId: string | null;
  inviteEmails: string;
  setInviteEmails: (val: string) => void;
  isInviting: boolean;
  pendingInvites?: string[];
  onAddMember: (userId: string, email?: string) => void;
  onRemoveMember: (userId: string) => void;
  onLeaveProject: (userId: string) => void;
  onSendInvites: () => void;
}

export const ProjectMembersSheet: React.FC<ProjectMembersSheetProps> = ({
  isOpen,
  onClose,
  members,
  currentUser,
  ownerId,
  removingId,
  addingId,
  inviteEmails,
  setInviteEmails,
  isInviting,
  pendingInvites = [],
  onAddMember,
  onRemoveMember,
  onLeaveProject,
  onSendInvites,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = (await apiFetch(`/users?q=${encodeURIComponent(trimmed)}`)) as User[];
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  const nonMembers = searchResults.filter(
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
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'U'}
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

        <div className={styles.addMemberSection}>
          <p className={`${styles.membersSectionLabel} ${styles.membersSectionLabelSep}`}>
            Add Existing Users
          </p>
          <div className={styles.memberSearchInputWrap}>
            <Search size={18} className={styles.memberSearchIcon} />
            <input
              type="text"
              className={styles.memberSearchInput}
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {isSearching && (
            <div className={styles.memberSearchStateHint}>
              <Loader2 size={14} className={styles.spinner} /> Searching platform users...
            </div>
          )}

          {!isSearching && searchQuery.trim().length > 0 && nonMembers.length === 0 && (
            <div className={styles.memberSearchStateHint}>
              No available users found matching &quot;{searchQuery.trim()}&quot;.
            </div>
          )}

          {!isSearching && searchQuery.trim().length === 0 && (
            <div className={styles.memberSearchStateHint}>
              Type a name or email to search existing platform users.
            </div>
          )}

          {!isSearching && nonMembers.length > 0 && (
            <div className={styles.searchResultsList}>
              {nonMembers.map((u) => {
                const isPending = pendingInvites.some(
                  (invEmail) => invEmail.toLowerCase() === u.email?.toLowerCase()
                );

                return (
                  <div key={u.id} className={styles.memberRow}>
                    <div className={`${styles.memberAvatar} ${styles.memberAvatarMuted}`}>
                      {u.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'U'}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{u.name}</span>
                      <span className={styles.memberEmail}>{u.email}</span>
                    </div>
                    {isPending ? (
                      <Button size="sm" variant="outline" disabled leftIcon={<Check size={14} />}>
                        Invited
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddMember(u.id, u.email)}
                        isLoading={addingId === u.id}
                        disabled={addingId !== null}
                        leftIcon={<UserPlus size={14} />}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.inviteSection}>
          <p className={`${styles.membersSectionLabel} ${styles.membersSectionLabelSep}`}>
            Invite New People
          </p>
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
      </div>
    </SideSheet>
  );
};
