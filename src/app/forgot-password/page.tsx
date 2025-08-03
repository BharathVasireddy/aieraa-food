'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { showToast } from '@/lib/error-handlers';

import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const { role } = session.user;
      
      if (role === 'ADMIN') {
        router.replace('/admin');
      } else if (role === 'MANAGER') {
        router.replace('/manager');
      } else if (role === 'STUDENT') {
        router.replace('/student');
      } else {
        router.replace('/'); // Fallback
      }
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render form (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      showToast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      showToast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = showToast.loading('Sending password reset email...');

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Always show success message for security (don't reveal if email exists)
      showToast.success('If an account with that email exists, we&apos;ve sent a password reset link.');
      setIsSubmitted(true);

    } catch (error) {
      console.error('Forgot password error:', error);
      showToast.error('Something went wrong. Please try again.');
    } finally {
      // Always dismiss loading toast
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white p-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600 mb-6">
              If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link to your email.
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="https://aieraa.com/wp-content/uploads/2020/08/Aieraa-Overseas-Logo.png"
                alt="Aieraa Hospitality"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Reset your password</h1>
            <p className="text-gray-600">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>We&apos;ll send a password reset link to your email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <LoadingButton 
                  type="submit" 
                  className="w-full" 
                  loading={isLoading}
                  loadingText="Sending Email..."
                >
                  Send Reset Link
                </LoadingButton>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}