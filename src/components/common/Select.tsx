import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#b9c8de] flex items-center justify-between"
        >
          <span>{label}</span>
          {props.required && <span className="text-[#e11d48]">*</span>}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-[#b9c8de] flex items-center pointer-events-none text-sm z-10">
            {leftIcon}
          </span>
        )}
        <select
          id={selectId}
          className={`w-full bg-[#0c0e12] text-[#e2e2e8] font-body text-sm py-2 px-3 pr-8 rounded-sm border appearance-none cursor-pointer ${
            error
              ? 'border-[#ffb4ab] focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab]'
              : 'border-white/10 focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]'
          } ${leftIcon ? 'pl-9' : ''} transition-all duration-150 outline-none disabled:opacity-50 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1e2024] text-[#e2e2e8]">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b9c8de] pointer-events-none text-[18px]">
          expand_more
        </span>
      </div>
      {error ? (
        <span className="font-body text-xs text-[#ffb4ab]">{error}</span>
      ) : helperText ? (
        <span className="font-body text-xs text-[#b9c8de]/70">{helperText}</span>
      ) : null}
    </div>
  );
};
