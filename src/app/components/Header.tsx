'use client';
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FiMenu, FiX, FiUser, FiLogOut, FiLogIn, FiHome, FiCreditCard, FiImage } from 'react-icons/fi';

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-purple-700">AI Image Generator</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="px-3 py-2 text-gray-700 hover:text-purple-700 flex items-center">
              <FiHome className="mr-1" />
              <span>Home</span>
            </Link>
            {session && (
              <>
                <Link href="/credits" className="px-3 py-2 text-gray-700 hover:text-purple-700 flex items-center">
                  <FiCreditCard className="mr-1" />
                  <span>Credits</span>
                </Link>
                <Link href="/gallery" className="px-3 py-2 text-gray-700 hover:text-purple-700 flex items-center">
                  <FiImage className="mr-1" />
                  <span>Gallery</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center">
            {status === 'authenticated' ? (
              <div className="flex items-center">
                <div className="mr-4 flex items-center">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-2">
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || 'User'} className="h-8 w-8 rounded-full" />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{session.user?.name || 'User'}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center"
                >
                  <FiLogOut className="mr-1" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center"
              >
                <FiLogIn className="mr-1" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-purple-700 focus:outline-none"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                <FiHome className="mr-2" />
                <span>Home</span>
              </Link>
              {session && (
                <>
                  <Link
                    href="/credits"
                    className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiCreditCard className="mr-2" />
                    <span>Credits</span>
                  </Link>
                  <Link
                    href="/gallery"
                    className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiImage className="mr-2" />
                    <span>Gallery</span>
                  </Link>
                </>
              )}

              {/* User Info / Auth Buttons */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {status === 'authenticated' ? (
                  <>
                    <div className="px-3 py-2 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-2">
                        {session.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt={session.user.name || 'User'} 
                            className="h-8 w-8 rounded-full" 
                          />
                        ) : (
                          <FiUser />
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">{session.user?.name || 'User'}</span>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="w-full px-3 py-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center"
                    >
                      <FiLogOut className="mr-2" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiLogIn className="mr-2" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 