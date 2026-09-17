'use client';

import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Unlink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button/Button';
import { GoogleButton, type GoogleAuthPayload } from '@/components/ui/googleButton/GoogleButton';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { auth } from '@/utils/auth';
import type { User as UserType } from '@/utils/types';

import styles from './Profile.module.css';

const AVATAR_COLOURS = [
  '#e23744',
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileComponent() {
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLOURS[0]);

  useEffect(() => {
    setMounted(true);
    const savedColor = localStorage.getItem('tf-avatar-color');
    if (savedColor && AVATAR_COLOURS.includes(savedColor)) {
      setAvatarColor(savedColor);
    }

    const curr = auth.getUser();
    if (curr) {
      setUser(curr);
      setName(curr.name || '');
      setEmail(curr.email || '');
      setSavedName(curr.name || '');
    }

    async function refreshProfile() {
      try {
        const freshUser = await apiFetch<UserType>('/auth/me');
        setUser(freshUser);
        setName(freshUser.name || '');
        setEmail(freshUser.email || '');
        setSavedName(freshUser.name || '');
        const updatedAuth = auth.getUser();
        if (updatedAuth) {
          auth.setUser({ ...updatedAuth, ...freshUser });
        }
      } catch {
        // Ignored
      }
    }
    refreshProfile();
  }, []);

  const [pwdExpanded, setPwdExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleConnectGoogle = async (payload: GoogleAuthPayload) => {
    setIsSsoLoading(true);
    try {
      const updated = await apiFetch<UserType>('/auth/google/connect', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUser(updated);
      const currUser = auth.getUser();
      if (currUser) {
        auth.setUser({ ...currUser, ...updated });
      }
      showToast(
        'Google account connected successfully! You can now use Google to sign in.',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect Google account';
      showToast(msg, 'error');
    } finally {
      setIsSsoLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setIsSsoLoading(true);
    try {
      const updated = await apiFetch<UserType>('/auth/google/disconnect', {
        method: 'POST',
      });
      setUser(updated);
      const currUser = auth.getUser();
      if (currUser) {
        auth.setUser({ ...currUser, ...updated });
      }
      showToast('Google account disconnected successfully.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect Google account';
      showToast(msg, 'error');
      if (msg.includes('create a password')) {
        setPwdExpanded(true);
      }
    } finally {
      setIsSsoLoading(false);
    }
  };

  const handleSaveProfile = useCallback(async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    const currUser = auth.getUser();
    if (!currUser) {
      showToast('Session expired — please log in again', 'error');
      return;
    }

    if (pwdExpanded) {
      if (user?.has_password && !currentPassword) {
        setPwdError('Current password is required to set a new password');
        return;
      }
      if (newPassword.length < 6) {
        setPwdError('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPwdError('Passwords do not match');
        return;
      }
    }

    setPwdError('');
    setIsSaving(true);

    try {
      const payload: Record<string, string> = { name: name.trim() };

      if (pwdExpanded && newPassword) {
        if (currentPassword) {
          payload.current_password = currentPassword;
        }
        payload.new_password = newPassword;
      }

      const updated = (await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })) as UserType;

      const merged: UserType = { ...currUser, ...updated, name: updated.name };
      setUser(merged);
      auth.setUser(merged);
      localStorage.setItem('tf-avatar-color', avatarColor);

      window.dispatchEvent(new CustomEvent('tf:user-updated', { detail: merged }));

      setSavedName(updated.name);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (pwdExpanded) setPwdExpanded(false);

      showToast(
        pwdExpanded ? 'Profile and password updated successfully' : 'Profile updated successfully',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    pwdExpanded,
    currentPassword,
    newPassword,
    confirmPassword,
    user,
    avatarColor,
    showToast,
  ]);

  const initials = mounted ? getInitials(savedName || user?.name || 'U') : '';

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Profile</h1>
          <p className={styles.pageSubtitle}>
            Manage your personal information, connected accounts, and password
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              <div
                className={styles.avatar}
                style={{ backgroundColor: avatarColor }}
                suppressHydrationWarning
              >
                {initials}
              </div>

              <div className={styles.colorRow} role="group" aria-label="Choose avatar colour">
                {AVATAR_COLOURS.map((c) => (
                  <button
                    key={c}
                    className={`${styles.colorSwatch} ${avatarColor === c ? styles.colorSwatchActive : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setAvatarColor(c)}
                    aria-label={`Avatar colour ${c}`}
                    aria-pressed={avatarColor === c}
                  />
                ))}
              </div>
            </div>

            <div className={styles.avatarInfo}>
              <p className={styles.avatarName} suppressHydrationWarning>
                {savedName || 'Your Name'}
              </p>
              <p className={styles.avatarEmail} suppressHydrationWarning>
                {email}
              </p>
              <p className={styles.avatarHint}>Pick a colour for your avatar</p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.form}>
            <h3 className={styles.formSection}>Personal info</h3>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <User size={14} className={styles.labelIcon} aria-hidden />
                Full name
              </label>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <Mail size={14} className={styles.labelIcon} aria-hidden />
                Email address
              </label>
              <input className={`${styles.input} ${styles.inputReadonly}`} value={email} readOnly />
            </div>

            <div className={styles.divider} />

            <h3 className={styles.formSection}>Connected Accounts</h3>
            <div className={styles.ssoSection}>
              <div className={styles.ssoHeader}>
                <div className={styles.ssoTitleRow}>
                  <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Google SSO</span>
                </div>
                {user?.google_connected ? (
                  <span className={styles.ssoBadgeConnected}>Connected</span>
                ) : (
                  <span className={styles.ssoBadgeDisconnected}>Not Connected</span>
                )}
              </div>

              <p className={styles.ssoDesc}>
                {user?.google_connected
                  ? 'Your Google account is connected. You can sign in using Continue with Google.'
                  : 'Connect your Google account to log in with 1-click using Continue with Google.'}
              </p>

              <div>
                {user?.google_connected ? (
                  <button
                    type="button"
                    className={styles.disconnectBtn}
                    onClick={handleDisconnectGoogle}
                    disabled={isSsoLoading}
                  >
                    {isSsoLoading ? (
                      <Loader2 size={14} className={styles.spinIcon} />
                    ) : (
                      <>
                        <Unlink size={14} />
                        Disconnect Google Account
                      </>
                    )}
                  </button>
                ) : (
                  <GoogleButton
                    onSuccess={handleConnectGoogle}
                    onError={(msg) => showToast(msg, 'error')}
                    text="Connect Google Account"
                    isLoading={isSsoLoading}
                  />
                )}
              </div>
            </div>

            <div className={styles.divider} />

            <button
              className={styles.pwdToggle}
              onClick={() => {
                setPwdExpanded((v) => !v);
                setPwdError('');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              type="button"
              aria-expanded={pwdExpanded}
            >
              <div className={styles.pwdToggleLeft}>
                <Lock size={15} aria-hidden />
                <span>{user?.has_password ? 'Change password' : 'Create password'}</span>
              </div>
              {pwdExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {pwdExpanded && (
              <div className={styles.pwdSection}>
                {!user?.has_password && (
                  <p
                    className={styles.hint}
                    style={{
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <AlertCircle size={14} />
                    You currently log in with Google and don&apos;t have a password. Setting a
                    password allows you to log in with password as well.
                  </p>
                )}

                {user?.has_password && (
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Current password</label>
                    <div className={styles.passwordWrap}>
                      <input
                        className={styles.input}
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowCurrent((v) => !v)}
                        aria-label={showCurrent ? 'Hide password' : 'Show password'}
                      >
                        {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    {user?.has_password ? 'New password' : 'Create password'}
                  </label>
                  <div className={styles.passwordWrap}>
                    <input
                      className={styles.input}
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Confirm password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className={styles.input}
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {pwdError && <p className={styles.errorText}>{pwdError}</p>}
              </div>
            )}

            <div className={styles.actions}>
              <Button
                onClick={handleSaveProfile}
                isLoading={isSaving}
                leftIcon={<Save size={15} />}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
