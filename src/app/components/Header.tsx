'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FiCamera, FiLayout, FiHelpCircle, FiUser, FiLogOut } from 'react-icons/fi';
import Avatar from './Avatar';

const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="w-full py-6 px-6 flex items-center justify-between bg-white shadow-sm border-b border-purple-100">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
            <FiCamera className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-700">
              AI Product Studio
            </h1>
            <p className="text-gray-600 text-sm">Create beautiful product photoshoots with AI</p>
          </div>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        <ul className="flex gap-6">
          <li>
            <Link 
              href="/" 
              className="text-gray-700 hover:text-purple-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FiCamera className="text-purple-600" />
              <span>Studio</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/gallery" 
              className="text-gray-700 hover:text-purple-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FiLayout className="text-purple-600" />
              <span>Gallery</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/help" 
              className="text-gray-700 hover:text-purple-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FiHelpCircle className="text-purple-600" />
              <span>Help</span>
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar 
                  src={session?.user?.image} 
                  alt={session?.user?.name || 'User'} 
                  size={32}
                />
                <span className="text-gray-700 font-medium">{session?.user?.name || 'User'}</span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm"
              >
                <FiLogOut size={14} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/auth/signin"
                className="px-4 py-2 text-purple-600 hover:text-purple-800 font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/auth/signup"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      <div className="md:hidden">
        <button className="p-2 rounded-full hover:bg-purple-50 text-purple-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header; 