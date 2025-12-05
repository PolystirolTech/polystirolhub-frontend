import React from 'react';

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    provider: 'twitch' | 'discord' | 'steam';
    icon?: React.ReactNode;
}

const providerStyles = {
    twitch: {
        color: 'bg-[#9146FF]',
        hover: 'hover:bg-[#9146FF]/90',
        label: 'Войти с Twitch',
    },
    discord: {
        color: 'bg-[#5865F2]',
        hover: 'hover:bg-[#5865F2]/90',
        label: 'Войти с Discord',
    },
    steam: {
        color: 'bg-[#171a21]',
        hover: 'hover:bg-[#171a21]/90',
        label: 'Войти с Steam',
    },
};

export function SocialButton({ provider, className, icon, ...props }: SocialButtonProps) {
    const style = providerStyles[provider];

    return (
        <button
            className={`
        group relative flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-medium text-white transition-all duration-300 hover:cursor-pointer
        ${style.color} ${style.hover}
        shadow-lg hover:shadow-xl hover:-translate-y-0.5
        ${className || ''}
      `}
            {...props}
        >
            {/* Glass shine effect overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {icon && <span className="relative z-10 h-6 w-6">{icon}</span>}
            <span className="relative z-10">{style.label}</span>
        </button>
    );
}
