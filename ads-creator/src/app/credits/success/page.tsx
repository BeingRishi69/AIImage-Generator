'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { FiCheckCircle, FiArrowRight, FiCreditCard, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';

export default function SuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    amount: number;
    credits: number;
  } | null>(null);

  useEffect(() => {
    async function checkPaymentStatus() {
      try {
        // Get the session_id from the URL
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setErrorMessage('Payment information not found');
          setLoading(false);
          return;
        }
        
        // Simulate checking payment status
        // In a real application, you would call an API endpoint to verify the payment status
        setTimeout(() => {
          // This is a simplified simulation - in a real app, you would verify this with your API
          setPaymentInfo({
            amount: 10.00, // This would come from your server
            credits: 100, // This would come from your server
          });
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setErrorMessage('Failed to verify payment status');
        setLoading(false);
      }
    }

    if (status !== 'loading') {
      checkPaymentStatus();
    }
  }, [searchParams, status]);

  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
            <FiAlertTriangle className="mx-auto text-4xl text-amber-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Sign in Required</h2>
            <p className="text-gray-600 mb-6">You need to sign in to view your payment status</p>
            <Link 
              href="/auth/signin" 
              className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-8 text-center">
              <FiAlertTriangle className="mx-auto text-4xl text-amber-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Payment Verification Failed</h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <Link 
                href="/credits" 
                className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Return to Credits Page
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-purple-600 p-6 text-center">
                <FiCheckCircle className="mx-auto text-5xl text-white mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-purple-100">Thank you for your purchase</p>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-4 text-center">Payment Summary</h3>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium text-gray-900">${paymentInfo?.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <div className="flex items-center text-purple-700">
                      <FiCreditCard className="mr-1" />
                      <span className="font-medium">Credits Added:</span>
                    </div>
                    <span className="font-bold text-purple-700">{paymentInfo?.credits}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 text-center">
                  Your credits have been added to your account and are ready to use.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/credits"
                    className="px-4 py-2.5 text-center border border-purple-600 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Credits Page
                  </Link>
                  
                  <Link
                    href="/"
                    className="px-4 py-2.5 text-center bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <span>Start Creating</span>
                    <FiArrowRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
} 