'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { useToast } from '@/components/ui/toast/ToastContext';
import { apiFetch } from '@/utils/api';

import styles from './ForgotPassword.module.css';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    setIsLoading(true);

    try {
      const res = await apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setIsSubmitted(true);
      showToast(res.message, 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to request password reset';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your registered email and we'll send you a password reset link."
    >
      {isSubmitted ? (
        <div>
          <div className={styles.successBox}>
            If an account exists with that email address, you will receive an email shortly with
            instructions to reset your password.
          </div>

          <p className={styles.switchText}>
            <Link
              href="/login"
              className={styles.switchLink}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <ArrowLeft size={16} /> Back to Sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.fieldGroup}>
            <Input
              label="Email address"
              placeholder="you@example.com"
              type="email"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <Button type="submit" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
            Send reset link
          </Button>

          <p className={styles.switchText}>
            Remember your password?{' '}
            <Link href="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
