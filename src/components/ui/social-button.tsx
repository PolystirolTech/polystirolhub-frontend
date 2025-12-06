'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { OAuthProvider } from '@/lib/auth';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: OAuthProvider;
  icon?: React.ReactNode;
}

const providerStyles = {
  twitch: {
    color: 'bg-[#9146FF]/65',
    hover: 'hover:bg-[#9146FF]/90',
    label: 'Войти с Twitch',
  },
  discord: {
    color: 'bg-[#5865F2]/65',
    hover: 'hover:bg-[#5865F2]/90',
    label: 'Войти с Discord',
  },
  steam: {
    color: 'bg-[#171a21]/65',
    hover: 'hover:bg-[#171a21]/90',
    label: 'Войти с Steam',
  },
};

export function SocialButton({ provider, className, icon, ...props }: SocialButtonProps) {
  const style = providerStyles[provider];
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Disable Steam as it's not implemented yet
  const isDisabled = props.disabled;

  const handleClick = async () => {
    if (isDisabled) return;

    setIsLoading(true);
    try {
      await login(provider);
      // User will be redirected to OAuth provider
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`
        group relative flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-medium text-white transition-all duration-300
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer hover:shadow-xl hover:-translate-y-0.5'}
        ${style.color} ${!isDisabled && style.hover}
        shadow-lg
        ${className || ''}
      `}
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {/* Glass shine effect overlay */}
      {!isDisabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {isLoading ? (
        <div className="relative z-10 h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        icon && <span className="relative z-10 h-6 w-6">{icon}</span>
      )}
      <span className="relative z-10">
        {isLoading ? 'Загрузка...' : style.label}
      </span>
    </button>
  );
}
