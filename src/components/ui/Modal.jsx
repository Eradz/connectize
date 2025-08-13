import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const Modal = ({ 
  isOpen = false, 
  onClose, 
  title, 
  children, 
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlay = true,
  className = "",
  ...props 
}) => {
  const sizes = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const variants = {
    default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
    glass: "glass backdrop-blur-xl border-white/20",
    elevated: "bg-white dark:bg-gray-900 shadow-strong",
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className={clsx(
          "relative w-full rounded-2xl transition-all duration-300 transform animate-fadeIn",
          sizes[size],
          variants[variant],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-display">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="!p-2 !h-8 !w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const ModalHeader = ({ children, className = "" }) => (
  <div className={clsx("px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60", className)}>
    {children}
  </div>
);

const ModalBody = ({ children, className = "" }) => (
  <div className={clsx("px-6 py-4", className)}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = "" }) => (
  <div className={clsx("px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl", className)}>
    {children}
  </div>
);

export { Modal as default, ModalHeader, ModalBody, ModalFooter };
