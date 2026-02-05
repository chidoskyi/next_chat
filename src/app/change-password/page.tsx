'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { requestPasswordReset, clearError } from '@/src/store/slices/authSlice';

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

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
    setEmail(e.target.value);
    
    if (fieldErrors.email || fieldErrors.general) {
      setFieldErrors({});
      dispatch(clearError());
    }
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccess(false);
    
    // Client-side validation
    if (!email.trim()) {
      setFieldErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    const result = await dispatch(requestPasswordReset(email.toLowerCase()));
    
    if (requestPasswordReset.fulfilled.match(result)) {
      setSuccess(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          {/* Card Container */}
          <div className="w-full bg-card border border-border rounded-lg p-8">
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-foreground flex items-center justify-center">
                <Lock className="w-12 h-12" />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-xl font-semibold text-center mb-4">
              Trouble logging in?
            </h1>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              Enter your email, phone, or username and we'll send you a link to get back into your account.
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                <p className="font-medium mb-1">Check your email</p>
                <p>If an account exists with this email, you will receive password reset instructions.</p>
              </div>
            )}

            {/* Error Messages */}
            {(fieldErrors.general || fieldErrors.detail) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {fieldErrors.general || fieldErrors.detail}
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">
                  Email, Phone, or Username
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Email, Phone, or Username"
                  className="h-11 bg-background"
                  value={email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 instagram-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send login link'}
              </Button>
              
              <div className="text-center">
                <Link 
                  href="#" 
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium"
                >
                  Can't reset your password?
                </Link>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">OR</span>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/register" 
                  className="text-sm font-semibold hover:text-foreground transition-colors"
                >
                  Create new account
                </Link>
              </div>
            </form>
          </div>
          
          {/* Back to Login */}
          <div className="w-full bg-card border border-border rounded-lg p-6 text-center">
            <Link 
              href="/login" 
              className="text-sm font-semibold hover:text-foreground transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}