// @ts-nocheck
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * مكون حقل الإدخال بتصميم "Fashion House"
 */
const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  helper,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  /* تصميم الحقل: خطوط مستقيمة، بدون حواف دائرية مبالغ فيها، ألوان محايدة */
  const baseStyles =
    'w-full bg-transparent border-b-[1.5px] py-4 transition-all duration-500 outline-none text-sm tracking-wide font-light placeholder:text-gray-300 rounded-none';

  /* حالة الخطأ مقابل الحالة الطبيعية (بدون Gradients) */
  const variantStyles = error
    ? 'border-red-500 focus:border-red-600'
    : isFocused 
      ? 'border-black' 
      : 'border-gray-200';

  return (
    <div className="w-full group space-y-2">
      {/* Label: خط صغير، عريض، ومسافات واسعة بين الحروف */}
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-[10px] uppercase tracking-[0.3em] font-black transition-colors duration-300 ${
            error ? 'text-red-500' : isFocused ? 'text-black' : 'text-gray-400'
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left Icon */}
        {leftIcon && (
          <div className={`absolute right-0 transition-colors duration-300 ${isFocused ? 'text-black' : 'text-gray-300'}`}>
            {leftIcon}
          </div>
        )}

        {/* Main Input */}
        <input
          id={inputId}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`${baseStyles} ${variantStyles} ${leftIcon ? 'pr-8' : ''} ${isPassword || rightIcon ? 'pl-8' : ''} ${className}`}
          {...props}
        />

        {/* Right Action: Password Toggle */}
        <div className="absolute left-0 flex items-center">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-300 hover:text-black transition-colors focus:outline-none"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          ) : (
            rightIcon && <span className="text-gray-300">{rightIcon}</span>
          )}
        </div>
      </div>

      {/* Error/Helper Message */}
      {(error || helper) && (
        <p className={`text-[10px] uppercase tracking-widest mt-1 ${error ? 'text-red-500 font-bold' : 'text-gray-400 italic'}`}>
          {error || helper}
        </p>
      )}
    </div>
  );
};

export default Input;
