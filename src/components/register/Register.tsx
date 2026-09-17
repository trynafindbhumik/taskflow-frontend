'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User, ArrowRight, Eye, EyeOff, MailCheck, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button/Button';
import { GoogleButton, type GoogleAuthPayload } from '@/components/ui/googleButton/GoogleButton';
import { Input } from '@/components/ui/input/Input';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { auth } from '@/utils/auth';
import { type AuthResponse } from '@/utils/types';

import styles from './Register.module.css';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleGoogleSuccess = async (payload: GoogleAuthPayload) => {
    setIsLoading(true);
    try {
      const res = await apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      auth.setToken(res.access_token);
      if (res.refresh_token) {
        auth.setRefreshToken(res.refresh_token);
      }
      auth.setUser(res.user);

      showToast(`Welcome to TaskFlow, ${res.user.name?.split(' ')[0]}!`, 'success');
      router.push('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-up failed';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      setRegisteredEmail(data.email);
      setCooldown(60);
      showToast('Verification email sent!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail || cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await apiFetch<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail }),
      });
      showToast(res.message, 'success');
      setCooldown(60);
    } catch (err: unknown) {
      const errObj = err as { retryAfter?: number; message?: string };
      if (errObj && errObj.retryAfter) {
        setCooldown(errObj.retryAfter);
      }
      const msg = err instanceof Error ? err.message : 'Failed to resend verification email';
      showToast(msg, 'error');
    } finally {
      setIsResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We've sent a verification link to ${registeredEmail}`}
      >
        <div className={styles.successContainer}>
          <div className={styles.mailBadge}>
            <MailCheck size={32} />
          </div>

          <div className={styles.successBox}>
            <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>Next steps:</p>
            <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li>
                Open the email sent to <strong>{registeredEmail}</strong>
              </li>
              <li>Click the verification link to verify your account</li>
              <li>Sign in to your TaskFlow account</li>
            </ol>
          </div>

          <div className={styles.resendRow}>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
            >
              <RotateCw size={15} className={isResending ? 'animate-spin' : ''} />
              {isResending
                ? 'Sending email...'
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend verification email'}
            </button>

            <p className={styles.switchText}>
              <Link href="/login" className={styles.switchLink}>
                Already verified? Sign in
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Join TaskFlow and start managing your work.">
      <div style={{ marginBottom: '1rem' }}>
        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={(msg) => showToast(msg, 'error')}
          text="Continue with Google"
          isLoading={isLoading}
        />
        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span>or sign up with email</span>
          <div className={styles.dividerLine} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          placeholder="Jane Doe"
          type="text"
          icon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          placeholder="you@example.com"
          type="email"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Password</label>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              {...register('password')}
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
          {errors.password?.message && (
            <p className={styles.errorText}>{errors.password.message}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Confirm password</label>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className={styles.errorText}>{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
          Create account
        </Button>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link href="/login" className={styles.switchLink}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
