import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import subscriptions from '../api-services/subscriptions';

const DEFAULT_BANNER = {
  is_enabled: true,
  title: '🎉 3 Months Free Trial!',
  message: 'Enjoy unlimited access to all premium features for the next 3 months. No credit card required.',
  background_color_start: '#FFC000',
  background_color_end: '#FF8400',
  text_color: '#FFFFFF',
  dismissible: true,
};

const TrialBanner = ({
  persistent = false,
  dismissibleDuration = 180000, // 3 minutes in milliseconds
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let active = true;
    subscriptions
      .getPromotionalBanner()
      .then((data) => {
        if (active) setBanner(data || { is_enabled: false });
      })
      .catch(() => {
        if (active) setBanner({ is_enabled: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const config = banner ? { ...DEFAULT_BANNER, ...banner } : null;
  const canDismiss = !persistent && (config?.dismissible ?? true);

  useEffect(() => {
    if (canDismiss && isVisible) {
      // Auto-dismiss after specified duration (default 3 minutes)
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, dismissibleDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, canDismiss, dismissibleDuration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Wait for config; hide entirely when disabled by admin.
  if (!config || !config.is_enabled) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full px-4 py-3 md:px-6 md:py-2 shadow-lg"
          style={{
            backgroundImage: `linear-gradient(to right, ${config.background_color_start}, ${config.background_color_end})`,
            color: config.text_color,
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm md:text-base font-semibold">{config.title}</p>
                <p className="text-xs md:text-sm opacity-90">
                  {config.message}
                </p>
              </div>
            </div>
            {canDismiss && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors"
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
