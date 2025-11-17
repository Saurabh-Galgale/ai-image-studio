import { MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  retryCount: number;
}

export default function Modal({
  isOpen,
  onClose,
  onRetry,
  retryCount,
}: ModalProps) {
  if (!isOpen) return null;

  const stop = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          onClick={stop}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Model Overloaded
            </h3>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The AI model is currently experiencing high traffic.
            {retryCount < 3 && ` You have ${3 - retryCount} retries left.`}
          </p>

          <div className="flex gap-3">
            {retryCount < 3 && (
              <motion.button
                onClick={onRetry}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            )}

            <motion.button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
