import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#b9c8de] flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-[#e11d48]">*</span>}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-[#b9c8de] flex items-center pointer-events-none text-sm">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#0c0e12] text-[#e2e2e8] placeholder:text-[#39485a] font-body text-sm py-2 px-3 rounded-sm border ${
            error
              ? 'border-[#ffb4ab] focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab]'
              : 'border-white/10 focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]'
          } ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''} transition-all duration-150 outline-none disabled:opacity-50 disabled:bg-[#1a1c20] ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#b9c8de] flex items-center text-sm">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <span className="font-body text-xs text-[#ffb4ab]">{error}</span>
      ) : helperText ? (
        <span className="font-body text-xs text-[#b9c8de]/70">{helperText}</span>
      ) : null}
    </div>
  );
};
