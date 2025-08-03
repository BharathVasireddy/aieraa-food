'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { showToast, errorHandlers, handleApiResponse } from '@/lib/error-handlers';

import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface University {
  id: string;
  name: string;
}

export default function RegisterPage() {
  // All hooks must be called before any conditional logic
  const [universities, setUniversities] = useState<University[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Form validation states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

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

  // Fetch universities on component mount
  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch('/api/universities');
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Failed to fetch universities:', error);
      }
    }
    fetchUniversities();
  }, []);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return '';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return '';
    // Indian: +91 followed by 10 digits
    // Vietnamese: +84 followed by 9-10 digits
    const indianRegex = /^(\+91|91)?[6-9]\d{9}$/;
    const vietnameseRegex = /^(\+84|84)?[3-9]\d{8,9}$/;

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (!indianRegex.test(cleanPhone) && !vietnameseRegex.test(cleanPhone)) {
      return 'Please enter a valid Indian (+91) or Vietnamese (+84) phone number';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return '';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return '';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  // Handle input changes with validation
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also revalidate confirm password if it exists
        if (formData.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    setErrors({
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // If there are errors, don't submit
    if (emailError || phoneError || passwordError || confirmPasswordError) {
      return;
    }

    // Check if name and university are filled
    if (!formData.name.trim()) {
      alert('Please enter your full name');
      return;
    }

    if (!formData.university) {
      alert('Please select your university');
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = showToast.loading('Creating your account...');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          university: formData.university,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Check for API errors
      const apiError = handleApiResponse(response, data);
      
      if (apiError) {
        // Handle specific registration errors
        if (apiError.error.includes('email already exists')) {
          setErrors((prev) => ({ ...prev, email: 'An account with this email already exists' }));
          showToast.error('This email is already registered. Try logging in instead.');
        } else if (apiError.error.includes('university')) {
          showToast.error('Please select a valid university from the list.');
        } else {
          errorHandlers.registration(apiError);
        }
        return;
      }

      // Success!
      showToast.success('Account created successfully! Please wait for approval.');
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.dismiss(loadingToast);
      errorHandlers.network(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // If user is authenticated, don't render register form (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  if (isSubmitted) {
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
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for registering. Your account has been created successfully.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <p className="text-sm text-blue-800">
                <strong className="block mb-2">What happens next?</strong>
                Your account will need approval from your university manager before you can start
                ordering. You&apos;ll receive an email notification once your account is approved.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
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
            <p className="text-gray-600">Create your account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Register as a student to start ordering food</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-3">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210 or +84 123 456 789"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>
                <div className="space-y-3">
                  <label htmlFor="university" className="text-sm font-medium text-gray-700">
                    University
                  </label>
                  <select
                    id="university"
                    className="h-14 w-full rounded-2xl border-2 border-gray-200 bg-white pl-5 pr-12 py-4 text-base appearance-none transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary focus:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 16px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '20px 20px',
                    }}
                    value={formData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    required
                  >
                    <option value="">Select your university</option>
                    {universities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                  )}
                  {formData.password && !errors.password && (
                    <p className="text-sm text-green-600 mt-1">✓ Password meets requirements</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                  {formData.confirmPassword && !errors.confirmPassword && formData.password && (
                    <p className="text-sm text-green-600 mt-1">✓ Passwords match</p>
                  )}
                </div>
                                     <LoadingButton 
                       type="submit" 
                       className="w-full" 
                       loading={isLoading}
                       loadingText="Creating Account..."
                     >
                       Create Account
                     </LoadingButton>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
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
