'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationStatus('success');
      toast.success('Email verified successfully! You can now log in.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setVerificationStatus('error');
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      // Start countdown timer (15 minutes)
      setTimeLeft(15 * 60);
      startCountdown();
      
      toast.success('New verification code sent! Check your email.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {verificationStatus === 'success' ? 'Verification Complete!' : 'Verify Your Email'}
          </h2>
          <p className="text-gray-600">
            {verificationStatus === 'success' 
              ? 'Your email has been successfully verified.'
              : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {verificationStatus === 'success' ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Continue to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                      setCode(e.target.value);
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-center"
                  placeholder="123456"
                  required
                />
              </div>
              {timeLeft !== null && (
                <p className="text-sm text-gray-500 mt-2">
                  Code expires in: {formatTime(timeLeft)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || (timeLeft !== null && timeLeft > 0)}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Didn&apos;t receive a code? Resend
              </button>
            </div>

            {verificationStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
                <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Invalid verification code. Please try again.</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}