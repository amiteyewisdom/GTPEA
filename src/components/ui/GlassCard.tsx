import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

export default function GlassCard({ children, className = '', hover = false, onClick, id }: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        bg-white
        border border-brand-card-border
        rounded-brand
        shadow-sm
        ${hover ? 'hover:bg-brand-hover transition-all duration-300 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
