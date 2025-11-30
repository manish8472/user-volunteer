'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

export default function NavLink({
  href,
  children,
  className = '',
  activeClassName = 'text-primary font-semibold',
  exact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = exact 
    ? pathname === href 
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`transition-colors hover:text-primary ${
        isActive ? activeClassName : ''
      } ${className}`}
    >
      {children}
    </Link>
  );
}
