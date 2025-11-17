import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "danger";
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[320px] ${
        type === "success"
          ? "bg-gradient-to-r from-emerald-500/90 to-green-500/90 dark:from-emerald-600/90 dark:to-green-600/90 border-emerald-400/50 dark:border-emerald-500/50"
          : "bg-gradient-to-r from-red-500/90 to-rose-500/90 dark:from-red-600/90 dark:to-rose-600/90 border-red-400/50 dark:border-red-500/50"
      }`}
    >
      <motion.div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/20 dark:bg-white/10"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5 }}
      >
        {type === "success" ? (
          <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
        ) : (
          <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
        )}
      </motion.div>

      <span className="font-semibold text-white flex-1">{message}</span>

      <motion.button
        onClick={onClose}
        className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4 text-white" strokeWidth={2.5} />
      </motion.button>

      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 dark:bg-white/20 rounded-b-xl"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 3, ease: "linear" }}
      />
    </motion.div>
  );
}
