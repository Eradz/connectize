import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { CloseIcon } from "./ModernIcon";
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
    glass: "bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-medium",
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
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className={clsx(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-xl shadow-medium scrollbar-hidden",
          sizes[size],
          variants[variant],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            {title && (
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="!h-8 !px-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                onClick={onClose}
              >
                {/* <span className="sr-only">Close</span> */}
                <CloseIcon size={20} />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-5">
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
  <div className={clsx("rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800", className)}>
    {children}
  </div>
);

export { Modal as default, ModalHeader, ModalBody, ModalFooter };
