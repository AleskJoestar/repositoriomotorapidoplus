import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled,
  loading,
  variant = 'primary',
  className = '',
}) => {
  const baseClass = 'px-6 py-2 rounded-lg font-medium transition-colors';
  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
      : variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
};
