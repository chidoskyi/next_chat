// app/auth/google/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/src/store/hooks';
import { googleLogin } from '@/src/store/slices/authSlice';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('Google OAuth error:', error);
      router.push('/login?error=google_auth_failed');
      return;
    }

    if (code) {
      // Exchange code for tokens
      dispatch(googleLogin(code))
        .unwrap()
        .then(() => {
          router.push('/');
        })
        .catch((err) => {
          console.error('Google login failed:', err);
          router.push('/login?error=google_auth_failed');
        });
    } else {
      router.push('/login');
    }
  }, [searchParams, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}