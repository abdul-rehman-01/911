import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'lowest' | 'low' | 'container' | 'high';
  hoverEffect?: boolean;
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'low',
  hoverEffect = false,
  border = true,
  className = '',
  ...props
}) => {
  const elevationClasses = {
    lowest: 'bg-[#0c0e12]',
    low: 'bg-[#1a1c20]',
    container: 'bg-[#1e2024]',
    high: 'bg-[#282a2e]',
  };

  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-white/20'
    : '';

  return (
    <div
      className={`rounded-lg ${elevationClasses[elevation]} ${
        border ? 'border border-white/8' : ''
      } ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
