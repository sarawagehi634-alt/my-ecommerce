// @ts-nocheck
import React from 'react'

/**
 * ستايلات مستوحاة من براندات الموضة العالمية (Quiet Luxury)
 */
const VARIANT_STYLES = {
  primary:
    'bg-black text-white hover:bg-gray-900 shadow-sm hover:shadow-lg active:scale-95',
  secondary:
    'bg-white text-black border border-gray-200 hover:bg-gray-50 hover:border-black active:scale-95',
  outline:
    'border-[1.5px] border-black text-black hover:bg-black hover:text-white active:scale-95',
  ghost:
    'text-gray-500 hover:text-black hover:bg-gray-50 uppercase tracking-[0.2em] text-[10px]',
  danger:
    'bg-[#b91c1c] text-white hover:bg-red-800 active:scale-95'
};

const SIZE_STYLES = {
  sm: 'px-4 py-2 text-[10px] tracking-widest uppercase font-bold',
  md: 'px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-black',
  lg: 'px-12 py-5 text-sm tracking-[0.3em] uppercase font-black'
};

const Button = ({
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
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  const baseStyles =
    'inline-flex items-center justify-center transition-all duration-500 ease-out focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed select-none rounded-none';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 ml-3"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}

      {leftIcon && !isLoading && (
        <span className="flex items-center ml-2 transition-transform duration-300 group-hover:-translate-x-1">
          {leftIcon}
        </span>
      )}

      <span className="relative">
        {children}
      </span>

      {rightIcon && !isLoading && (
        <span className="flex items-center mr-2 transition-transform duration-300 group-hover:translate-x-1">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;