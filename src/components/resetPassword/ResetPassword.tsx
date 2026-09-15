'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';

import styles from './ResetPassword.module.css';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      showToast('Invalid password reset token', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          new_password: data.password,
        }),
      });

      setIsSuccess(true);
      showToast(res.message, 'success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid request" subtitle="Missing password reset token.">
        <p className={styles.switchText}>
          <Link href="/forgot-password" className={styles.switchLink}>
            Request a new reset link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your new password below.">
      {isSuccess ? (
        <div>
          <div className={styles.successBox}>
            Password reset successful! Redirecting you to login...
          </div>
          <p className={styles.switchText}>
            <Link href="/login" className={styles.switchLink}>
              Click here to sign in now
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>New password</label>
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

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Confirm new password</label>
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
            Reset password
          </Button>

          <p className={styles.switchText}>
            <Link href="/login" className={styles.switchLink}>
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
