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
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";

  // Updated variant styles with new color palette
  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
    secondary: "bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary", // Using gray as secondary
    danger: "bg-danger hover:bg-red-700 text-white focus:ring-danger", // Assuming danger is defined in theme, e.g. red-600
    ghost: "bg-transparent hover:bg-gray-100 text-text-primary focus:ring-primary-light", // Use primary-light for ghost focus
    outline: "bg-transparent hover:bg-primary-light hover:text-primary border border-primary text-primary focus:ring-primary-light",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base", // Slightly increased padding
    lg: "px-7 py-3 text-lg",    // Slightly increased padding
    icon: "p-2.5", // For icon-only buttons
  };

  const loadingStyles = isLoading ? "opacity-75 cursor-not-allowed" : ""; // This is combined with disabled:opacity-70, ensure they work together or simplify

  return (
    <motion.button
      whileTap={!isLoading && !props.disabled ? { scale: 0.97 } : {}}
      whileHover={!isLoading && !props.disabled ? { scale: 1.03, transition: { duration: 0.1 } } : {}}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
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
