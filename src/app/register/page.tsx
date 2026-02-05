'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InstagramLogo } from "@/src/components/instagram-logo";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import Link from "next/link";
import { Apple } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { registerUser, clearError } from '@/src/store/slices/authSlice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    username: '',
    password: '',
    password_confirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    
    // Client-side validation
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.full_name) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.includes('@')) {
      errors.username = 'Username cannot contain @ symbol';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    // Prepare data for backend
    const registerData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      password_confirm: formData.password_confirm,
      display_name: formData.full_name,
    };
    
    dispatch(registerUser(registerData));
  };

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

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

          {/* Register Form */}
          <div className="w-full bg-card border border-border rounded-lg p-8">
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sign up to see photos and videos from your friends.
              </p>
            </div>

            {(fieldErrors.general || fieldErrors.detail) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {fieldErrors.general || fieldErrors.detail}
              </div>
            )}

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-11 gap-2 mb-4 bg-transparent"
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Log in with Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">
                  Mobile Number or Email
                </Label>
                <Input 
                  id="email"
                  name="email"
                  type="text" 
                  placeholder="Mobile Number or Email" 
                  className="h-11"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-sm">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="sr-only">
                  Full Name
                </Label>
                <Input 
                  id="full_name"
                  name="full_name"
                  type="text" 
                  placeholder="Full Name" 
                  className="h-11"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.full_name && (
                  <p className="text-red-600 text-sm">{fieldErrors.full_name}</p>
                )}
                {fieldErrors.display_name && (
                  <p className="text-red-600 text-sm">{fieldErrors.display_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="sr-only">
                  Username
                </Label>
                <Input 
                  id="username"
                  name="username"
                  type="text" 
                  placeholder="Username" 
                  className="h-11"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.username && (
                  <p className="text-red-600 text-sm">{fieldErrors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="Password" 
                  className="h-11"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.password && (
                  <p className="text-red-600 text-sm">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm" className="sr-only">
                  Confirm Password
                </Label>
                <Input 
                  id="password_confirm"
                  name="password_confirm"
                  type="password" 
                  placeholder="Confirm Password" 
                  className="h-11"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.password_confirm && (
                  <p className="text-red-600 text-sm">{fieldErrors.password_confirm}</p>
                )}
              </div>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground leading-relaxed pt-2">
                People who use our service may have uploaded your contact information to Instagram.{" "}
                <Link href="#" className="text-foreground hover:underline">
                  Learn More
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground leading-relaxed">
                By signing up, you agree to our{" "}
                <Link href="#" className="text-foreground hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link href="#" className="text-foreground hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-foreground hover:underline">
                  Cookies Policy
                </Link>
                .
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 instagram-gradient text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'SIGNING UP...' : 'Sign up'}
              </Button>
            </form>
          </div>

          {/* Login Link */}
          <div className="w-full bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm">
              Have an account?{" "}
              <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
                Log in
              </Link>
            </p>
          </div>

          {/* Get the App */}
          <div className="w-full text-center space-y-4">
            <p className="text-sm text-muted-foreground">Get the App.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="h-10 px-4 gap-2 bg-transparent" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Apple className="w-5 h-5" />
                  <span className="text-sm font-medium">App Store</span>
                </a>
              </Button>
              <Button variant="outline" className="h-10 px-4 gap-2 bg-transparent" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                  </svg>
                  <span className="text-sm font-medium">Google Play</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}