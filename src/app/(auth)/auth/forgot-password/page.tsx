"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useForgotEmailMutation } from '../../../../features/auth/authApi';

interface ApiError {
  data?: {
    message?: string;
  };
}

interface ForgotEmailResponse {
  message?: string;
  data?: {
    forgetToken: string;
  };
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const router = useRouter();
  const [forgotEmail, { isLoading }] = useForgotEmailMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await forgotEmail({ email: email }).unwrap() as ForgotEmailResponse;

      // Show success state
      setIsSuccess(true);

      // Show success toast
      toast.success(response.message || 'OTP sent successfully!');

      // Redirect to OTP verification page with token
      if (response.data?.forgetToken) {
        // Add small delay for better UX
        setTimeout(() => {
          router.push(`/auth/verify-email?forgetToken=${response.data?.forgetToken}`);
        }, 1000);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.log('Forgot password error:', error);
      toast.error(apiError?.data?.message || 'Failed to send OTP. Please try again.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src={"/images/auth/image.png"}
          alt="Forgot Password illustration"
          fill
          className="object-cover rounded-r-3xl"
          priority
        />
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md p-8 rounded-lg bg-white">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src={"/icons/logo2.png"}
                alt="Optimus Logo"
                height={1000}
                width={1000}
                className="w-52 h-auto py-2"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
                <p className="text-gray-600 text-sm">
                  Enter your registered email to receive an OTP.
                </p>
              </div>
            </div>
          </div>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  setIsSuccess(false);
                }}
                placeholder="Enter your email address here..."
                disabled={isSuccess}
                className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E4585] focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>

            {/* Send OTP Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess || !email}
              className="w-full bg-[#8E4585] hover:bg-[#7a3a71] cursor-pointer text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : isSuccess ? 'OTP Sent ✓' : 'Send OTP'}
            </button>

            {/* Success Message */}
            {isSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 text-center">
                  OTP sent successfully! Redirecting to verification page...
                </p>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="text-[#8E4585] hover:text-[#7a3a71] font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}