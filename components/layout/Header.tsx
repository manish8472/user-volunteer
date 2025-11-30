'use client';

import { useState } from 'react';
import Link from 'next/link';
import NavLink from '../ui/NavLink';
import useAuth from '@/hooks/useAuth';


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            VolunteerHub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            {isAuthenticated && user?.role === 'volunteer' && (
              <>
                <NavLink href="/opportunities">Browse Opportunities</NavLink>
                <NavLink href="/volunteer/dashboard">My Dashboard</NavLink>
                <NavLink href="/volunteer/applications">My Applications</NavLink>
              </>
            )}

            {isAuthenticated && user?.role === 'ngo' && (
              <>
                <NavLink href="/ngo/dashboard">Dashboard</NavLink>
                <NavLink href="/ngo/opportunities">My Opportunities</NavLink>
                <NavLink href="/ngo/volunteers">Volunteers</NavLink>
              </>
            )}

            {!isAuthenticated && (
              <>
                <NavLink href="/opportunities">Browse Opportunities</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/contact">Contact</NavLink>
              </>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-dark font-medium">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Login
                </Link>
                <div className="relative group">
                  <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-md transition-all flex items-center gap-1">
                    Sign Up
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <div className="py-2">
                      <Link
                        href="/auth/signup/volunteer"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="font-semibold">As Volunteer</div>
                        <div className="text-xs text-gray-500">Find opportunities</div>
                      </Link>
                      <Link
                        href="/auth/signup/ngo"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-secondary/10 hover:text-secondary transition-colors"
                      >
                        <div className="font-semibold">As NGO</div>
                        <div className="text-xs text-gray-500">Post opportunities</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3">
              {isAuthenticated && user?.role === 'volunteer' && (
                <>
                  <NavLink href="/opportunities" className="px-3 py-2 rounded-lg">
                    Browse Opportunities
                  </NavLink>
                  <NavLink href="/volunteer/dashboard" className="px-3 py-2 rounded-lg">
                    My Dashboard
                  </NavLink>
                  <NavLink href="/volunteer/applications" className="px-3 py-2 rounded-lg">
                    My Applications
                  </NavLink>
                </>
              )}

              {isAuthenticated && user?.role === 'ngo' && (
                <>
                  <NavLink href="/ngo/dashboard" className="px-3 py-2 rounded-lg">
                    Dashboard
                  </NavLink>
                  <NavLink href="/ngo/opportunities" className="px-3 py-2 rounded-lg">
                    My Opportunities
                  </NavLink>
                  <NavLink href="/ngo/volunteers" className="px-3 py-2 rounded-lg">
                    Volunteers
                  </NavLink>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <NavLink href="/opportunities" className="px-3 py-2 rounded-lg">
                    Browse Opportunities
                  </NavLink>
                  <NavLink href="/about" className="px-3 py-2 rounded-lg">
                    About
                  </NavLink>
                  <NavLink href="/contact" className="px-3 py-2 rounded-lg">
                    Contact
                  </NavLink>
                </>
              )}

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Logged in as <span className="font-semibold text-gray-900">{user?.name}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-dark text-xs font-medium">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                    >
                      Login
                    </Link>
                    <div className="space-y-2">
                      <p className="px-3 text-xs font-semibold text-gray-500 uppercase">Sign Up As</p>
                      <Link
                        href="/auth/signup/volunteer"
                        className="block px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold text-center transition-all"
                      >
                        Volunteer
                      </Link>
                      <Link
                        href="/auth/signup/ngo"
                        className="block px-3 py-2.5 rounded-lg bg-secondary hover:bg-secondary-dark text-white text-sm font-semibold text-center transition-all"
                      >
                        NGO / Organization
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
