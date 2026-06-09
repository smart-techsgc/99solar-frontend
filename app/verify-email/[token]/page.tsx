'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'verified' | 'invalid' | 'expired'>('pending');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setStatus('invalid');
          throw new Error('No verification token provided');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email/${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        // if (!response.ok) {
        //   if (data.error.includes('expired')) {
        //     setStatus('expired');
        //     setEmail(data.email || '');
        //   } else {
        //     setStatus('invalid');
        //   }
        //   throw new Error(data.error || 'Email verification failed');
        // }

        setStatus('verified');
        setEmail(data.user?.email || '');
        toast.success('Email verified successfully! You can now log in.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Email verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResend = async () => {
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
        throw new Error(data.error || 'Failed to resend verification email');
      }

      toast.success('New verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        ) : status === 'verified' ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email {email && <span className="font-semibold">({email})</span>} has been successfully verified.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : status === 'expired' ? (
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Link Expired</h2>
            <p className="text-gray-600 mb-6">
              The verification link has expired. Please request a new one.
            </p>
            {email && (
              <div className="w-full mb-6">
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50"
            >
              Register Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">The verification link is invalid or has expired.</p>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Register Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}