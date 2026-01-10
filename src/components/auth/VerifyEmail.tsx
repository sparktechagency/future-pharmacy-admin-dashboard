"use client";

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardEvent, FormEvent, KeyboardEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useForgotEmailOTPCheckMutation, useResendPasswordMutation } from '../../features/auth/authApi';

interface ApiError {
  data?: {
    message?: string;
  };
}

interface OTPCheckResponse {
  message?: string;
  data?: {
    forgetOtpMatchToken: string;
  };
}

interface ResetPasswordResponse {
  message?: string;
}

export default function VerifyEmail() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']); // 6 digits
  const [error, setError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgetToken = searchParams.get("forgetToken") || '';

  const [OTPMatch, { isLoading: otpMatchLoading }] = useForgotEmailOTPCheckMutation();
  const [resendOtp, { isLoading: resendOtpLoading }] = useResendPasswordMutation();

  // Fixed ref callback
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) { // Changed to 5 for 6 digits
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6); // Changed to 6

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6); // 6 digits
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5); // Changed to 5
    inputRefs.current[nextIndex]?.focus();
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');

    // Validation for 6 digits
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!forgetToken) {
      setError('Invalid token. Please try again.');
      toast.error('Invalid token. Please try again.');
      return;
    }

    try {
      const response = await OTPMatch({
        otp: otpValue,
        token: forgetToken
      }).unwrap() as OTPCheckResponse;

      toast.success(response.message || 'OTP verified successfully!');

      if (response.data?.forgetOtpMatchToken) {
        router.push(`/auth/reset-password?forgetOtpMatchToken=${response.data.forgetOtpMatchToken}`);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'OTP verification failed!');
    }
  };

  // Handle resend
  const handleResend = async (): Promise<void> => {
    if (!forgetToken) {
      toast.error('Invalid token. Please try again.');
      return;
    }

    try {
      const response = await resendOtp(forgetToken).unwrap() as ResetPasswordResponse;
      toast.success(response.message || 'OTP resent successfully!');
      setOtp(['', '', '', '', '', '']); // Reset to 6 empty digits
      setError('');
      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError?.data?.message || 'Failed to resend OTP');
    }
  };

  const isLoading = otpMatchLoading || resendOtpLoading;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src={"/images/auth/image.png"}
          alt="Verification illustration"
          fill
          className="object-cover rounded-r-3xl"
          priority
        />
      </div>

      {/* Right Panel - Verification Form */}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Account Recovery</h2>
                <p className="text-gray-600 text-sm mb-4">
                  To help keep your account safe, House Finder wants to make sure it&apos;s really you trying to sign in.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Get a Verification Code</h3>
                <p className="text-gray-600 text-xs">
                  To get a verification code, first confirm the phone number you added to your account{' '}
                  <span className="font-semibold">*********@coredevs.ltd</span>. Standard rates apply.
                </p>
              </div>
            </div>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields - Now 6 inputs */}
            <div>
              <div className="flex justify-center gap-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={setInputRef(index)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-14 h-14 text-center text-2xl font-semibold border-2 ${error ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E4585] focus:border-transparent transition-all`}
                  />
                ))}
              </div>
              {error && (
                <p className="text-center text-sm text-red-500">{error}</p>
              )}
              <p className="text-center text-sm text-gray-500 mt-2">
                Enter 6-digit verification code
              </p>
            </div>

            {/* Verified Button */}
            <button
              type="submit"
              disabled={isLoading || !forgetToken}
              className="w-full bg-[#8E4585] hover:bg-[#7a3a71] cursor-pointer text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpMatchLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend Link */}
            <div className="text-center text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpLoading || !forgetToken}
                className="text-[#8E4585] hover:text-[#7a3a71] cursor-pointer font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendOtpLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}