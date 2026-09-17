'use client';

import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import styles from './GoogleButton.module.css';

export interface GoogleAuthPayload {
  credential?: string;
  google_id?: string;
  email?: string;
  name?: string;
}

interface GoogleButtonProps {
  onSuccess: (payload: GoogleAuthPayload) => void;
  onError?: (message: string) => void;
  text?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (notification?: (response: unknown) => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            error_callback?: (response: { type?: string; message?: string }) => void;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export function GoogleButton({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
  isLoading = false,
  className = '',
}: GoogleButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    if (clientId && typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [clientId]);

  useEffect(() => {
    if (!isAuthorizing) return undefined;

    // Reset authorizing state when window regains focus if user closed popup
    const handleFocus = () => {
      const timer = setTimeout(() => {
        setIsAuthorizing(false);
      }, 500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('focus', handleFocus);

    // Fallback safety timeout (60 seconds max)
    const maxTimer = setTimeout(() => {
      setIsAuthorizing(false);
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(maxTimer);
    };
  }, [isAuthorizing]);

  const triggerOAuthFallback = () => {
    if (!clientId || !window.google?.accounts?.oauth2) {
      onError?.('Google Identity Services is initializing. Please try again.');
      setIsAuthorizing(false);
      return;
    }
    try {
      setIsAuthorizing(true);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        error_callback: (err) => {
          setIsAuthorizing(false);
          if (err.type !== 'popup_closed') {
            onError?.(`Google OAuth Error: ${err.message || err.type}`);
          }
        },
        callback: (tokenRes) => {
          setIsAuthorizing(false);
          if (tokenRes.access_token) {
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenRes.access_token}` },
            })
              .then((r) => r.json())
              .then((info: { sub?: string; email?: string; name?: string }) => {
                if (info.email) {
                  onSuccess({
                    google_id: info.sub || `google_${info.email}`,
                    email: info.email,
                    name: info.name || info.email.split('@')[0],
                  });
                } else {
                  onError?.('Failed to retrieve user profile from Google.');
                }
              })
              .catch((err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Google OAuth failed';
                onError?.(msg);
              });
          } else if (tokenRes.error) {
            if (tokenRes.error !== 'popup_closed_by_user') {
              onError?.(`Google OAuth Error: ${tokenRes.error}`);
            }
          }
        },
      });
      client.requestAccessToken();
    } catch (err: unknown) {
      setIsAuthorizing(false);
      const msg = err instanceof Error ? err.message : 'OAuth request failed.';
      onError?.(msg);
    }
  };

  const handleClick = () => {
    if (disabled || isLoading || isAuthorizing) return;

    if (!clientId) {
      onError?.(
        'Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your frontend .env file.'
      );
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      onError?.('Google Identity Services script is loading. Please try again in a moment.');
      return;
    }

    triggerOAuthFallback();
  };

  return (
    <button
      type="button"
      className={`${styles.googleBtn} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading || isAuthorizing}
    >
      {isLoading || isAuthorizing ? (
        <Loader2 size={18} className={styles.spinner} />
      ) : (
        <svg className={styles.googleIcon} viewBox="0 0 24 24">
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
      )}
      <span>{text}</span>
    </button>
  );
}
