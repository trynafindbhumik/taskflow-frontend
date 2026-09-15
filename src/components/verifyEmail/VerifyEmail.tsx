'use client';

import { CheckCircle2, AlertTriangle, Loader2, RotateCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { auth } from '@/utils/auth';
import type { User } from '@/utils/types';

import styles from './VerifyEmail.module.css';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const [emailForResend, setEmailForResend] = useState<string>(initialEmail);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  const { showToast } = useToast();

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token was provided in the URL.');
      return;
    }

    async function verify() {
      try {
        const res = await apiFetch<{
          message: string;
          token: string;
          user: User;
        }>('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (res.token && res.user) {
          auth.setToken(res.token);
          auth.setUser(res.user);
        }

        setStatus('success');
        setMessage(res.message || 'Email address successfully verified!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err: unknown) {
        const errObj = err as { expired?: boolean; email?: string; message?: string };
        if (errObj && errObj.email) {
          setEmailForResend(errObj.email);
        }
        const errMsg =
          err instanceof Error ? err.message : 'Verification token is invalid or has expired.';
        setStatus('expired');
        setMessage(errMsg);
      }
    }

    verify();
  }, [token, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForResend || cooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await apiFetch<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: emailForResend }),
      });
      showToast(res.message || 'Verification link sent!', 'success');
      setCooldown(60);
    } catch (err: unknown) {
      const errObj = err as { retryAfter?: number; message?: string };
      if (errObj && errObj.retryAfter) {
        setCooldown(errObj.retryAfter);
      }
      const errMsg = err instanceof Error ? err.message : 'Failed to resend verification email.';
      showToast(errMsg, 'error');
    } finally {
      setIsResending(false);
    }
  };

  const pageTitle =
    status === 'loading'
      ? 'Verifying email'
      : status === 'success'
        ? 'Email verified!'
        : 'Link expired or invalid';

  const pageSubtitle =
    status === 'loading'
      ? 'Please wait a moment while we verify your account...'
      : status === 'success'
        ? 'Your email address has been confirmed. Redirecting...'
        : 'Please request a new email verification link below.';

  return (
    <AuthLayout title={pageTitle} subtitle={pageSubtitle}>
      <div className={styles.container}>
        <div
          className={`${styles.iconWrapper} ${
            status === 'loading'
              ? styles.iconLoading
              : status === 'success'
                ? styles.iconSuccess
                : styles.iconError
          }`}
        >
          {status === 'loading' && <Loader2 size={36} className="animate-spin" />}
          {status === 'success' && <CheckCircle2 size={38} />}
          {(status === 'expired' || status === 'error') && <AlertTriangle size={36} />}
        </div>

        <div
          className={`${styles.messageBox} ${
            status === 'success' ? styles.messageBoxSuccess : styles.messageBoxError
          }`}
        >
          {message}
        </div>

        {status === 'success' && (
          <p className={styles.switchText}>
            <Link href="/dashboard" className={styles.switchLink}>
              Click here if you are not redirected automatically →
            </Link>
          </p>
        )}

        {(status === 'expired' || status === 'error') && (
          <form onSubmit={handleResend} className={styles.resendForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email address for resend</label>
              <input
                type="email"
                required
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={isResending || cooldown > 0 || !emailForResend}
              className={styles.resendBtn}
            >
              <RotateCw size={15} className={isResending ? 'animate-spin' : ''} />
              {isResending
                ? 'Sending email...'
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend verification email'}
            </button>

            <p className={styles.switchText}>
              <Link
                href="/login"
                className={styles.switchLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <ArrowLeft size={16} /> Back to Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmail() {
  return <VerifyEmailContent />;
}
