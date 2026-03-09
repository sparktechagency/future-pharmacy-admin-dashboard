"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLoginMutation, useTwoStepVerificationMutation } from '../../../../features/auth/authApi';

interface ApiError {
  data?: {
    message?: string;
  };
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    accessToken: string;
  } | string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email: string; password: string }>({
    email: '',
    password: ''
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [Login, { isLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useTwoStepVerificationMutation();
  const { login } = useAuth();
  const redirectUrl = searchParams.get('redirect') || '/';

  // State for OTP Modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = { email: '', password: '' };

    // Validation
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // If no errors, proceed with login
    if (!newErrors.email && !newErrors.password) {
      try {
        const credentials: LoginCredentials = {
          email: email,
          password: password
        };

        const response = await Login(credentials).unwrap() as LoginResponse;

        // Check if 2FA is required
        if (response.success && response.message === "2-FA verification is required" && typeof response.data === 'string') {
          // Store the JWT token temporarily
          setTempToken(response.data);
          setIsOtpModalOpen(true);
          toast.success("Please enter the OTP sent to your email");
          return;
        }

        // Standard Login (No 2FA)
        if (typeof response.data === 'object' && response.data?.accessToken) {
          login(response.data.accessToken);
          toast.success(response.message || 'Login successful!');
          router.push(redirectUrl);
        } else {
          toast.error('No access token received');
        }
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError?.data?.message || 'Login failed! Please check your credentials.');
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      toast.error('OTP is required');
      return;
    }

    if (!tempToken) {
      toast.error('Authentication token missing. Please login again.');
      setIsOtpModalOpen(false);
      return;
    }

    try {
      const response = await verifyOtp({
        token: tempToken,
        otp: otp
      }).unwrap() as LoginResponse;

      if (response.success && typeof response.data === 'object' && response.data?.accessToken) {
        login(response.data.accessToken);
        toast.success(response.message || 'Verification successful!');
        setIsOtpModalOpen(false);
        setOtp('');
        router.push(redirectUrl);
      } else {
        toast.error('Verification failed');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Verification failed. Please check your OTP.');
    }
  };

  // Check if form is valid for better UX
  const isFormValid = email.length > 0 &&
    password.length > 0 &&
    !errors.email &&
    !errors.password;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src={"/images/auth/image.png"}
          alt="Login illustration"
          fill
          className="object-cover rounded-r-3xl"
          priority
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md p-8 rounded-lg bg-gray-100">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <Image
                src={"/icons/logo2.png"}
                alt="Login illustration"
                height={1000}
                width={1000}
                className="w-52 h-auto rounded-r-3xl py-2"
              />
              <div>
                <h2 className="text-2xl font-medium text-gray-800 mb-4">Login to Your Account</h2>
              </div>
            </div>
          </div>

          {/* Login Form */}
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
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="Enter your email address here..."
                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="Enter your password here..."
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-[#8E4585] cursor-pointer hover:bg-[#9c4a8f]/90 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>


          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-white border-none shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4">Require 2FA</DialogTitle>
            <p className="text-sm font-medium text-gray-500 mt-2 pl-5">Please enter the security verification code sent to your email to continue.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Verification Code</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="h-11 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl text-center tracking-[0.5em] text-lg font-bold"
                maxLength={6}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsOtpModalOpen(false)}
              className="px-6 font-bold text-gray-500 h-11"
              disabled={isVerifyingOtp}
            >
              Cancel
            </Button>
            <Button
              onClick={handleOtpSubmit}
              className="px-6 bg-[#9c4a8f] hover:bg-[#9c4a8f]/80 text-white font-bold h-11 shadow-lg shadow-[#9c4a8f]/20 transition-all"
              disabled={isVerifyingOtp || !otp.trim()}
            >
              {isVerifyingOtp ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : 'Verify & Login'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}