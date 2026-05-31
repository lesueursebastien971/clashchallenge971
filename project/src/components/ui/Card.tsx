import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', interactive = false, onClick }: CardProps) {
  return (
    <div
      className={`${interactive ? 'card-interactive' : 'card'} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
    >
      {children}
    </div>
  );
}
