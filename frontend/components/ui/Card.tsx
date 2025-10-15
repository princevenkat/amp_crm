import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cardClasses = `bg-surface rounded-2xl border border-gray-200 p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
    // FIX: Changed React.Node to React.ReactNode, which is the correct type for children props.
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return <div className={`mb-4 text-lg font-semibold text-text-primary ${className}`}>{children}</div>;
}

interface CardContentProps {
    // FIX: Changed React.Node to React.ReactNode, which is the correct type for children props.
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return <div className={`text-text-secondary ${className}`}>{children}</div>;
}

interface CardFooterProps {
    // FIX: Changed React.Node to React.ReactNode, which is the correct type for children props.
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
    return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
}