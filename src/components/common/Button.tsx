import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'telemetry';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles: Strict 4px micro-radius (rounded-sm), zero-pill rule, font-headline / font-mono
  const baseClasses =
    'relative inline-flex items-center justify-center font-headline font-semibold tracking-tight transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none rounded-sm';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-[#e11d48] hover:bg-[#db2b4e] active:bg-[#be0037] text-[#fffaf9] shadow-[0_0_20px_rgba(225,29,72,0.25)] hover:shadow-[0_0_24px_rgba(225,29,72,0.4)]',
    secondary:
      'bg-[#1e2024] hover:bg-[#282a2e] text-[#e2e2e8] border border-white/10 hover:border-white/20 shadow-sm',
    outline:
      'bg-transparent hover:bg-white/5 text-[#e2e2e8] border border-white/15 hover:border-white/40',
    ghost:
      'bg-transparent hover:bg-[#1e2024] text-[#b9c8de] hover:text-[#e2e2e8]',
    telemetry:
      'font-mono text-xs uppercase tracking-wider bg-[#1a1c20] hover:bg-[#282a2e] text-[#ffb3b6] border border-[#e11d48]/40 hover:border-[#e11d48]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};
