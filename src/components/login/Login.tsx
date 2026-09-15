'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, Eye, EyeOff, AlertCircle, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';
import { auth } from '@/utils/auth';
import type { AuthResponse } from '@/utils/types';

import styles from './Login.module.css';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
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
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const handleResend = async () => {
    if (!unverifiedEmail || cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await apiFetch<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: unverifiedEmail }),
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

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setUnverifiedEmail(null);

    try {
      const res = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      auth.setToken(res.token);
      auth.setUser(res.user);

      showToast(`Welcome back, ${res.user.name?.split(' ')[0]}!`, 'success');

      const redirect = searchParams.get('redirect');
      const redirectTo = redirect ? decodeURIComponent(redirect) : '/dashboard';

      router.push(redirectTo);
      reset();
    } catch (error: unknown) {
      const errObj = error as { unverified?: boolean; email?: string; message?: string };
      if (errObj && errObj.unverified) {
        setUnverifiedEmail(errObj.email || data.email);
      }
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email address"
          placeholder="you@example.com"
          type="email"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.fieldLabel}>Password</label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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

        {unverifiedEmail && (
          <div className={styles.unverifiedBox}>
            <div className={styles.unverifiedHeader}>
              <AlertCircle size={16} />
              <span>Email verification required</span>
            </div>
            <p>
              Please verify your email address (<strong>{unverifiedEmail}</strong>) before logging
              in.
            </p>
            <button
              type="button"
              className={styles.resendBtn}
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
            >
              <RotateCw size={13} className={isResending ? 'animate-spin' : ''} />
              {isResending
                ? 'Sending email...'
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend verification email'}
            </button>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
          Sign in
        </Button>

        <p className={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.switchLink}>
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
