import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`${maxWidth} w-full modal-content pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-500">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1.5 -mr-1.5 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface ModalActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalActions: React.FC<ModalActionsProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-dark-500 mt-4 ${className}`}>
      {children}
    </div>
  );
};
