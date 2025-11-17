import { ReactNode, MouseEventHandler } from "react";
import { motion } from "framer-motion";

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export default function SecondaryButton({
  children,
  onClick,
  icon: Icon,
}: SecondaryButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full py-4 rounded-xl font-medium text-gray-700 dark:text-gray-100 border-2 border-white/20 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/10 dark:hover:bg-gray-700/40 hover:border-white/30 transition-all"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center justify-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </span>
    </motion.button>
  );
}
