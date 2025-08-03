'use client';

import { useState, useEffect } from 'react';

import { getSession, signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { showToast, errorHandlers, getErrorMessage } from '@/lib/error-handlers';

import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status === 'loading') {
        console.warn('Session loading timeout - forcing unauthenticated state');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [status]);

  // Show loading while checking session (with timeout protection)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <p className="text-xs text-gray-400 mt-2">This shouldn&apos;t take long</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render login form (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      showToast.error('Please enter your email address');
      return;
    }
    
    if (!formData.password) {
      showToast.error('Please enter your password');
      return;
    }

    if (!formData.email.includes('@')) {
      showToast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Show loading toast
      const loadingToast = showToast.loading('Signing you in...');

      const result = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result?.error) {
        // Handle specific login errors
        if (result.error.includes('pending approval')) {
          errorHandlers.login({ 
            error: result.error, 
            status: 'pending_approval' 
          });
        } else if (result.error.includes('rejected')) {
          errorHandlers.login({ 
            error: result.error, 
            status: 'rejected' 
          });
        } else if (result.error.includes('Invalid')) {
          showToast.error('Invalid email or password. Please check your credentials.');
        } else {
          showToast.error('Unable to sign in. Please try again.');
        }
        setError(result.error);
      } else if (result?.ok) {
        // Success!
        showToast.success('Welcome back! Redirecting...');
        
        try {
          // Get session to check user role and redirect accordingly
          const session = await getSession();
          
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin');
          } else if (session?.user?.role === 'MANAGER') {
            router.push('/manager');
          } else if (session?.user?.role === 'STUDENT') {
            router.push('/student');
          } else {
            router.push('/'); // Fallback
          }
        } catch (sessionError) {
          console.error('Session error:', sessionError);
          showToast.error('Login successful, but unable to load your dashboard. Please refresh the page.');
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      errorHandlers.network(error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white p-4">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
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
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Food Ordering</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <LoadingButton 
                  type="submit" 
                  className="w-full" 
                  loading={isLoading}
                  loadingText="Signing In..."
                >
                  Sign In
                </LoadingButton>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
