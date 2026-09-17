'use client';

import {
  Folder,
  User,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/input/Input';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { auth } from '@/utils/auth';
import type { User as UserType } from '@/utils/types';

import styles from './Invitation.module.css';

interface InvitationDetails {
  id: string;
  project_id: string;
  project_name: string;
  project_description?: string;
  inviter_name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  user_exists: boolean;
  is_expired: boolean;
  created_at: string;
  expires_at: string;
}

export default function InvitationComponent() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const currentUser = auth.getUser();
  const { showToast } = useToast();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [descExpanded, setDescExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Invalid invitation link.');
      return;
    }

    async function fetchInvitation() {
      try {
        const data = await apiFetch<InvitationDetails>(`/invitations/${token}`);
        setInvitation(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load invitation.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!invitation) return;

    if (!invitation.user_exists) {
      if (!name.trim()) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
    }

    setActionLoading(true);
    setError(null);

    try {
      const payload: Record<string, string> = {};
      if (!invitation.user_exists) {
        payload.name = name.trim();
        payload.password = password;
      }

      const res = await apiFetch<{
        message: string;
        access_token?: string;
        refresh_token?: string;
        user?: UserType;
        project_id: string;
      }>(`/invitations/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.access_token && res.user) {
        auth.setToken(res.access_token);
        if (res.refresh_token) {
          auth.setRefreshToken(res.refresh_token);
        }
        auth.setUser(res.user);
      }

      setInvitation((prev) => (prev ? { ...prev, status: 'accepted' } : null));
      showToast(res.message || 'Invitation accepted!', 'success');

      setTimeout(() => {
        router.push(`/projects/${res.project_id}`);
      }, 1500);
    } catch (err: unknown) {
      const errObj = err as { user_exists?: boolean; message?: string };
      const message = err instanceof Error ? err.message : 'Failed to accept invitation.';

      if (errObj && errObj.user_exists) {
        setError(
          `An account with email "${invitation.email}" already exists. Please sign in to accept.`
        );
      } else {
        setError(message);
      }
      showToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string }>(`/invitations/${token}/reject`, {
        method: 'POST',
      });
      setInvitation((prev) => (prev ? { ...prev, status: 'rejected' } : null));
      showToast(res.message || 'Invitation declined.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to decline invitation.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout
        title="Loading Invitation"
        subtitle="Please wait while we fetch invitation details..."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      </AuthLayout>
    );
  }

  if (error && !invitation) {
    return (
      <AuthLayout title="Invalid Invitation" subtitle="Unable to process invitation link.">
        <div className={`${styles.statusBox} ${styles.statusError}`}>{error}</div>
        <p className={styles.switchText}>
          <Link href="/login" className={styles.switchLink}>
            Return to Sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  const isExpired = invitation?.is_expired || invitation?.status === 'expired';
  const isAccepted = invitation?.status === 'accepted';
  const isRejected = invitation?.status === 'rejected';
  const isMatchingUser =
    currentUser && currentUser.email.toLowerCase() === invitation?.email.toLowerCase();

  return (
    <AuthLayout
      title={
        isAccepted
          ? 'Invitation Accepted!'
          : isRejected
            ? 'Invitation Declined'
            : isExpired
              ? 'Invitation Expired'
              : 'You have been invited!'
      }
      subtitle={
        isAccepted
          ? 'You are now a member of this project.'
          : isRejected
            ? 'You have declined this project invitation.'
            : isExpired
              ? 'This invitation link has expired. Invitations are valid for 7 days.'
              : `${invitation?.inviter_name} invited you to collaborate on TaskFlow.`
      }
    >
      <div className={styles.container}>
        {invitation && (
          <div className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <div className={styles.projectIcon}>
                <Folder size={22} />
              </div>
              <div>
                <h3 className={styles.projectTitle}>{invitation.project_name}</h3>
                {invitation.project_description &&
                  (() => {
                    const desc = invitation.project_description;
                    const maxDescLength = 75;
                    const isLongDesc = desc.length > maxDescLength;
                    const displayedDesc =
                      descExpanded || !isLongDesc ? desc : `${desc.slice(0, maxDescLength)}…`;

                    return (
                      <p className={styles.projectDesc}>
                        {displayedDesc}
                        {isLongDesc && (
                          <>
                            {' '}
                            <button
                              type="button"
                              className={styles.descToggle}
                              onClick={() => setDescExpanded((v) => !v)}
                            >
                              {descExpanded ? (
                                <>
                                  Show less <ChevronUp size={12} />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown size={12} />
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </p>
                    );
                  })()}
              </div>
            </div>

            <div className={styles.metaRow}>
              <span>
                Invited by: <strong>{invitation.inviter_name}</strong>
              </span>
              <span>
                For: <strong>{invitation.email}</strong>
              </span>
            </div>
          </div>
        )}

        {error && <div className={`${styles.statusBox} ${styles.statusError}`}>{error}</div>}

        {isExpired && (
          <div className={`${styles.statusBox} ${styles.statusError}`}>
            <AlertTriangle size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            This invitation link expired after 7 days. Please ask {invitation?.inviter_name} to send
            a new invitation.
          </div>
        )}

        {isAccepted && (
          <div className={`${styles.statusBox} ${styles.statusSuccess}`}>
            <CheckCircle2 size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            You are now a team member!
            <div style={{ marginTop: '1rem' }}>
              <Link href={`/projects/${invitation?.project_id}`} className={styles.switchLink}>
                Go to Project Dashboard →
              </Link>
            </div>
          </div>
        )}

        {isRejected && (
          <div className={`${styles.statusBox} ${styles.statusError}`}>
            You declined this project invitation.
          </div>
        )}

        {invitation?.status === 'pending' && !isExpired && (
          <>
            {!invitation.user_exists ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAccept();
                }}
                className="w-full"
              >
                <Input
                  label="Email address"
                  type="email"
                  value={invitation.email}
                  readOnly
                  icon={<Mail size={16} />}
                  className={styles.inputReadonly}
                />

                <Input
                  label="Your full name"
                  placeholder="Jane Doe"
                  type="text"
                  icon={<User size={16} />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Create password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className={styles.input}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className={styles.btnSecondary}
                  >
                    Decline
                  </button>
                  <button type="submit" disabled={actionLoading} className={styles.btnPrimary}>
                    {actionLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Accept &amp; Join <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full">
                {!isMatchingUser ? (
                  <div className="text-center space-y-4">
                    <div className={`${styles.statusBox} ${styles.statusError}`}>
                      An account already exists for <strong>{invitation.email}</strong>. Please sign
                      in to accept.
                    </div>
                    <Link
                      href={`/login?redirect=/invitations/${token}`}
                      className={styles.btnPrimary}
                      style={{ display: 'flex', textDecoration: 'none' }}
                    >
                      Sign in as {invitation.email}
                    </Link>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={actionLoading}
                      className={styles.btnSecondary}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={actionLoading}
                      className={styles.btnPrimary}
                    >
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        'Accept Invitation'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <p className={styles.switchText}>
          <Link href="/dashboard" className={styles.switchLink}>
            Back to Dashboard
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
