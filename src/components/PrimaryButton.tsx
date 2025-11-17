import { ReactNode, MouseEventHandler } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  loading = false,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group"
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer" />

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Authenticating...
          </>
        ) : (
          <>
            {children}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </span>
    </motion.button>
  );
}
