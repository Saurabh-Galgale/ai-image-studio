import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

import LoginForm from "./LoginForm";
import SignupForm from "./SignUpForm";
import FloatingParticles from "./FloatingParticles";
import ImageStudioPage from "./ImageStudioPage";
import History1 from "./HistoryPage";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  const [currentPage, setCurrentPage] = useState<
    "login" | "studio" | "history"
  >("login");

  const [isLogin, setIsLogin] = useState(true);
  const [history] = useState<any[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogin = () => {
    setCurrentPage("studio");
  };

  const handleLogout = () => {
    console.log("LOGOUT");
  };

  const handleNavigateToHistory = () => {
    setCurrentPage("history");
  };

  //   const handleBackToStudio = () => {
  //     setCurrentPage("studio");
  //   };

  const AuthPage = () => (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isDark
            ? [
                "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)",
                "linear-gradient(135deg, #312e81 0%, #1e3a8a 50%, #1e1b4b 100%)",
                "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #312e81 100%)",
                "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)",
              ]
            : [
                "linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 50%, #bfdbfe 100%)",
                "linear-gradient(135deg, #ddd6fe 0%, #bfdbfe 50%, #e0e7ff 100%)",
                "linear-gradient(135deg, #bfdbfe 0%, #e0e7ff 50%, #ddd6fe 100%)",
                "linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 50%, #bfdbfe 100%)",
              ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <FloatingParticles />

      <motion.button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 hover:scale-110 transition-transform"
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="w-6 h-6 text-yellow-300" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="w-6 h-6 text-orange-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm
                  key="login"
                  onSwitchToSignup={() => setIsLogin(false)}
                  onGuestLogin={handleLogin}
                />
              ) : (
                <SignupForm
                  key="signup"
                  setIsLogin={setIsLogin}
                  onSwitchToLogin={() => setIsLogin(true)}
                  onGuestLogin={handleLogin}
                />
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-sm text-white/80 dark:text-gray-200"
          >
            <p>
              Powered by{" "}
              <span className="font-semibold text-indigo-400 dark:text-cyan-300">
                Image Studio
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {currentPage === "login" && <AuthPage />}

      {currentPage === "studio" && (
        <ImageStudioPage
          onLogout={handleLogout}
          onNavigateToHistory={handleNavigateToHistory}
        />
      )}

      {currentPage === "history" && (
        <History1
          onLogout={handleLogout}
          //   onBackToStudio={handleBackToStudio}
          history={history}
        />
      )}
    </>
  );
}
