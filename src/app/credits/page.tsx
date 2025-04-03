'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { FiCreditCard, FiDollarSign, FiInfo, FiClock, FiRefreshCcw, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import { getUserCredits } from '../lib/db/creditsDb';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export default function CreditsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [selectedCredits, setSelectedCredits] = useState(50);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(20);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch user's credits
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCredits();
    }
  }, [status]);

  const fetchCredits = async (includeHistory = false) => {
    try {
      const response = await fetch(`/api/credits${includeHistory ? '?includeHistory=true' : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      
      const data = await response.json();
      setCredits(data.credits);
      
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setError('Failed to fetch credit information');
    }
  };

  const handleCreditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSelectedCredits(value);
  };

  const calculatePrice = (credits: number) => {
    // $1 for 10 credits
    return (credits / 10).toFixed(2);
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits: selectedCredits }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  const toggleHistory = async () => {
    if (!showHistory) {
      await fetchCredits(true);
    }
    setShowHistory(!showHistory);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Display transaction type with icon
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'purchase':
        return (
          <span className="flex items-center text-green-600">
            <FiCreditCard className="mr-1" /> Purchase
          </span>
        );
      case 'usage':
        return (
          <span className="flex items-center text-red-600">
            <FiRefreshCcw className="mr-1" /> Usage
          </span>
        );
      case 'bonus':
        return (
          <span className="flex items-center text-blue-600">
            <FiDollarSign className="mr-1" /> Bonus
          </span>
        );
      default:
        return (
          <span className="flex items-center">
            <FiInfo className="mr-1" /> {type}
          </span>
        );
    }
  };

  const handleRefreshCredits = async () => {
    if (!session?.user?.id) return;
    
    try {
      const credits = await getUserCredits(session.user.id as string);
      setUserCredits(credits);
    } catch (error) {
      console.error('Error refreshing user credits:', error);
    }
  };

  const handleBuyCredits = async () => {
    if (!session?.user?.id) {
      setError('You must be signed in to purchase credits');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditAmount: selectedAmount,
          priceUsd: getPrice(selectedAmount),
          userId: session.user.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) {
        setError('Failed to initialize payment system');
        return;
      }
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (error) {
        setError(error.message || 'An error occurred with the payment provider');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  // Predefined credit amounts
  const creditOptions = [
    { amount: 10, price: 1 },
    { amount: 20, price: 2 },
    { amount: 50, price: 5 },
    { amount: 100, price: 10 },
    { amount: 200, price: 18 }, // Small bulk discount
    { amount: 500, price: 40 }, // Larger bulk discount
  ];

  // Calculate price based on selected amount
  const getPrice = (creditAmount: number) => {
    const option = creditOptions.find(opt => opt.amount === creditAmount);
    return option ? option.price : (creditAmount / 10); // Fallback to standard rate
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
            <FiAlertTriangle className="mx-auto text-4xl text-amber-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Sign in Required</h2>
            <p className="text-gray-600 mb-6">You need to sign in to purchase credits and access the AI Product Studio</p>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Credits</h1>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Balance</h2>
              <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold">
                <FiCreditCard className="mr-2" />
                {credits} Credits
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Each image generation costs 3 credits. Purchase more credits below.
            </p>
            
            <button
              onClick={toggleHistory}
              className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4"
            >
              <FiClock className="mr-1" />
              {showHistory ? 'Hide Transaction History' : 'Show Transaction History'}
            </button>
            
            {showHistory && (
              <div className="mb-6 overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-left">Description</th>
                      <th className="py-2 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-700">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="py-2 px-4">
                            {getTransactionTypeDisplay(transaction.transaction_type)}
                          </td>
                          <td className="py-2 px-4 text-gray-700">{transaction.description}</td>
                          <td className={`py-2 px-4 text-right font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Purchase Credits</h2>
            
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">
                Select Number of Credits
              </label>
              <div className="flex flex-col space-y-3">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={selectedCredits}
                  onChange={handleCreditChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>10 credits</span>
                  <span>500 credits</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div className="text-gray-700">
                  <span className="text-lg font-semibold">{selectedCredits} Credits</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Can generate approximately {Math.floor(selectedCredits / 3)} images
                  </p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ${calculatePrice(selectedCredits)}
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard className="mr-2" />
                  Purchase Credits
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 