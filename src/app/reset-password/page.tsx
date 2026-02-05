'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InstagramLogo } from "@/src/components/instagram-logo";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { confirmPasswordReset, clearError } from '@/src/store/slices/authSlice';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Get UID and token from URL parameters and decode them
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  
  // WORKAROUND: Handle HTML-encoded ampersand in URL
  // if (!rawToken) {
  //   rawToken = searchParams.get('amp;token');
  // }
  
  // Decode URL-encoded parameters
  // const uid = rawUid ? decodeURIComponent(rawUid) : null;
  // const token = rawToken ? decodeURIComponent(rawToken) : null;
  
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidLink, setIsValidLink] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug: log the parameters
  useEffect(() => {
    console.log('URL Parameters:', {
      uid,
      token,
      allParams: Object.fromEntries(searchParams.entries())
    });
  }, [uid, token, searchParams]);

  // Check if UID and token are present in URL
  useEffect(() => {
    if (!uid || !token) {
      console.log('Invalid link - missing uid or token:', { uid, token });
      setIsValidLink(false);
    } else {
      console.log('Valid link found:', { uid, token });
      setIsValidLink(true);
    }
  }, [uid, token]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Parse errors
  useEffect(() => {
    if (error) {
      try {
        const parsedError = JSON.parse(error);
        if (typeof parsedError === 'object' && parsedError !== null) {
          const errors: Record<string, string> = {};
          Object.entries(parsedError).forEach(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            errors[field] = msgArray[0] as string;
          });
          setFieldErrors(errors);
        } else {
          setFieldErrors({ general: error });
        }
      } catch {
        setFieldErrors({ general: error });
      }
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (fieldErrors[name] || fieldErrors.general) {
      setFieldErrors({});
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Validate UID and token
    if (!uid || !token) {
      setFieldErrors({ general: 'Invalid or expired reset link' });
      return;
    }
    
    // Client-side validation
    const errors: Record<string, string> = {};
    
    if (!formData.new_password) {
      errors.new_password = 'Password is required';
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    
    if (!formData.new_password_confirm) {
      errors.new_password_confirm = 'Please confirm your password';
    } else if (formData.new_password !== formData.new_password_confirm) {
      errors.new_password_confirm = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      // Dispatch password reset confirmation with UID and token
      await dispatch(confirmPasswordReset({
        uid,
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      })).unwrap();
      
      // Success - redirect to login page
      router.push('/login?reset=success');
    } catch (err) {
      // Error handling is done through the useEffect for error state
      console.error('Password reset failed:', err);
    }
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 instagram-gradient rounded-2xl blur-sm opacity-75"></div>
                <div className="relative bg-background p-3 rounded-2xl">
                  <InstagramLogo className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-3xl font-bold">Instagram</h1>
            </div>

            {/* Error Message */}
            <div className="w-full bg-card border border-border rounded-lg p-8 text-center">
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                Invalid or expired password reset link
              </div>
              <p className="text-muted-foreground mb-4">
                Please request a new password reset link.
              </p>
              <Link href="/forgot-password">
                <Button className="w-full h-11 instagram-gradient text-white font-semibold hover:opacity-90 transition-opacity">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 instagram-gradient rounded-2xl blur-sm opacity-75"></div>
              <div className="relative bg-background p-3 rounded-2xl">
                <InstagramLogo className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Reset Password</h1>
          </div>

          {/* Reset Password Form */}
          <div className="w-full bg-card border border-border rounded-lg p-8">
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter your new password below.
              </p>
            </div>

            {(fieldErrors.general || fieldErrors.detail) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {fieldErrors.general || fieldErrors.detail}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new_password" className="sr-only">
                  New Password
                </Label>
                <div className="relative">
                  <Input 
                    id="new_password"
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password" 
                    className="h-11 pr-10"
                    value={formData.new_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.new_password && (
                  <p className="text-red-600 text-sm">{fieldErrors.new_password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password_confirm" className="sr-only">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input 
                    id="new_password_confirm"
                    name="new_password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password" 
                    className="h-11 pr-10"
                    value={formData.new_password_confirm}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.new_password_confirm && (
                  <p className="text-red-600 text-sm">{fieldErrors.new_password_confirm}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 instagram-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'RESETTING PASSWORD...' : 'Reset Password'}
              </Button>
            </form>
          </div>

          {/* Login Link */}
          <div className="w-full bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm">
              Remember your password?{" "}
              <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
                Log in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}