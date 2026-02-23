import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TrialBanner = ({ 
  persistent = false, 
  dismissibleDuration = 180000, // 3 minutes in milliseconds
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!persistent && isVisible) {
      // Auto-dismiss after specified duration (default 3 minutes)
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, dismissibleDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, persistent, dismissibleDuration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full  bg-gradient-to-r from-[#FFC000] to-[#FF8400] text-white px-4 py-3 md:px-6 md:py-2 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm md:text-base font-semibold">🎉 3 Months Free Trial!</p>
                <p className="text-xs md:text-sm text-blue-100">
                  Enjoy unlimited access to all premium features for the next 3 months. No credit card required.
                </p>
              </div>
            </div>
            {!persistent && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-gold rounded-lg transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrialBanner;
