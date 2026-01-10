"use client";

import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../../features/auth/authApi';


interface ApiError {
  data?: {
    message?: string;
  };
}

interface ResetPasswordResponse {
  message?: string;
}

interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ newPassword: string; confirmPassword: string }>({
    newPassword: '',
    confirmPassword: ''
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgetToken = searchParams.get("forgetOtpMatchToken") || '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = { newPassword: '', confirmPassword: '' };

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    // If no errors, proceed with password reset
    if (!newErrors.newPassword && !newErrors.confirmPassword) {
      if (!forgetToken) {
        toast.error('Invalid or missing token. Please try again.');
        return;
      }

      try {
        const resetData: ResetPasswordData = {
          newPassword: newPassword,
          confirmPassword: confirmPassword,
          token: forgetToken
        };

        console.log(resetData);

        const response = await resetPassword({
          newPassword: newPassword,
          confirmPassword: confirmPassword,
          token: forgetToken
        }).unwrap() as ResetPasswordResponse;
        console.log('Reset password response:', response);


        toast.success(response.message || 'Password reset successful!');

        // Clear form fields
        setNewPassword('');
        setConfirmPassword('');

        // Redirect to login after a brief delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);

      } catch (error) {
        console.log('Reset password error:', error);
        const apiError = error as ApiError;
        toast.error(apiError?.data?.message || 'Password reset failed!');
      }
    }
  };

  // Check if form is valid for button state
  const isFormValid = newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !errors.newPassword &&
    !errors.confirmPassword;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src={"/images/auth/image.png"}
          alt="Reset Password illustration"
          fill
          className="object-cover rounded-r-3xl"
          priority
        />
      </div>

      {/* Right Panel - Reset Password Form */}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Create New Password</h2>
                <p className="text-gray-600 text-sm">
                  To help keep your account safe, House Finder wants to make sure it&apos;s really you trying to sign in.
                </p>
              </div>
            </div>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                  }}
                  placeholder="Enter your new password here..."
                  className={`w-full px-4 py-3 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E4585] focus:border-transparent transition-all pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  placeholder="Enter your confirm new password here..."
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E4585] focus:border-transparent transition-all pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    {newPassword.length >= 8 ? '✓' : '○'}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    {/(?=.*[a-z])/.test(newPassword) ? '✓' : '○'}
                  </span>
                  One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    {/(?=.*[A-Z])/.test(newPassword) ? '✓' : '○'}
                  </span>
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    {/(?=.*\d)/.test(newPassword) ? '✓' : '○'}
                  </span>
                  One number
                </li>
              </ul>
            </div>

            {/* Change Password Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid || !forgetToken}
              className="w-full bg-[#8E4585] hover:bg-[#7a3a71] cursor-pointer text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>

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