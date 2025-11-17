import { useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export default function AuthInput({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" && showPassword ? "text" : type;

  return (
    <div className="relative">
      <motion.div
        className={`relative rounded-xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 p-[2px]"
            : error
            ? "border-red-400/50 bg-white/5 dark:bg-gray-800/30"
            : "border-white/10 bg-white/5 dark:bg-gray-800/30"
        }`}
        animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className={isFocused ? "bg-white dark:bg-gray-900 rounded-[10px]" : ""}>
          <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />

            <input
              type={inputType}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required={required}
              className="w-full pl-12 pr-12 py-4 bg-transparent text-gray-900 dark:text-white placeholder-transparent focus:outline-none peer"
              placeholder={label}
            />

            <label
              className={`absolute left-12 transition-all duration-200 pointer-events-none ${
                value || isFocused
                  ? "-top-6 text-xs text-indigo-500 dark:text-cyan-300 font-medium"
                  : "top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
              }`}
            >
              {label}
            </label>

            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 dark:text-red-300 text-sm mt-2 ml-1 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
