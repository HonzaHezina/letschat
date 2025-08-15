"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // Consistent loader icon

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'; // Added 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'; // Added 'icon' size
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  disabled,
  ...rest // Capture any other native button props but we won't spread them to avoid conflicts
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
    secondary: "bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary",
    danger: "bg-danger hover:bg-red-700 text-white focus:ring-danger",
    ghost: "bg-transparent hover:bg-gray-100 text-text-primary focus:ring-primary-light",
    outline: "bg-transparent hover:bg-primary-light hover:text-primary border border-primary text-primary focus:ring-primary-light",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3 text-lg",
    icon: "p-2.5",
  };

  const loadingStyles = isLoading ? "opacity-75 cursor-not-allowed" : "";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      whileTap={!isLoading && !disabled ? { scale: 0.97 } : {}}
      whileHover={!isLoading && !disabled ? { scale: 1.03, transition: { duration: 0.1 } } : {}}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="animate-spin h-5 w-5" /> // Consistent loader
      ) : (
        <>
          {leftIcon && <span className={children ? "mr-2" : ""}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={children ? "ml-2" : ""}>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
