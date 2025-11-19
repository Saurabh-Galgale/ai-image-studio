import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AuthInput from "./AuthInput";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import Toast from "./Toast";
import { Mail, Lock, Sparkles } from "lucide-react";

const API_URL = "https://ai-image-studio-be.onrender.com/auth/login";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onGuestLogin: () => void;
}

interface ToastType {
  message: string;
  type: "success" | "danger";
}

interface ErrorMap {
  email?: string;
  password?: string;
}

export default function LoginForm({
  onSwitchToSignup,
  onGuestLogin,
}: LoginFormProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<ErrorMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const validateForm = (): ErrorMap => {
    const newErrors: ErrorMap = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    return newErrors;
  };

  const navigateToStudio = () => {
    navigate("/studio");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setToast(null);

    try {
      const resp: any = await axios.post(
        API_URL,
        { email, password },
        { timeout: 10000 }
      );

      if (resp.status === 200 && resp.data?.token) {
        const { token, user } = resp.data;

        try {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        } catch {}

        setToast({ message: "Signed in successfully", type: "success" });

        setTimeout(() => navigateToStudio(), 700);
        return;
      }

      setToast({ message: "Unexpected server response", type: "danger" });
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data || {};

        if (status === 400) {
          const details = data?.error?.details || data?.error?.errors;

          if (Array.isArray(details) && details.length > 0) {
            const fieldErrors: ErrorMap = {};

            details.forEach((d: any) => {
              let field: string | null = null;

              if (Array.isArray(d.path) && d.path.length > 0) field = d.path[0];
              else if (typeof d.path === "string") field = d.path;
              else if (d.field) field = d.field;

              const message = d.message || d.msg || "Invalid field";

              if (field) (fieldErrors as any)[field] = message;
            });

            setErrors((prev) => ({ ...prev, ...fieldErrors }));

            const firstMsg =
              details[0]?.message || details[0]?.msg || "Validation failed";

            setToast({ message: firstMsg, type: "danger" });
          } else {
            setToast({
              message: data?.error?.message || "Invalid input",
              type: "danger",
            });
          }
        } else if (status === 401) {
          setToast({
            message: data?.error?.message || "Invalid email or password",
            type: "danger",
          });
        } else {
          setToast({
            message: data?.error?.message || `Server error (${status})`,
            type: "danger",
          });
        }
      } else if (err.request) {
        setToast({
          message: "No response from server. Please try again later.",
          type: "danger",
        });
      } else {
        setToast({
          message: `Request failed: ${err.message}`,
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = /\S+@\S+\.\S+/.test(email) && password.length >= 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Sparkles className="w-12 h-12 text-indigo-400 dark:text-cyan-400" />
        </motion.div>

        <h1 className="text-3xl font-bold dark:text-white mb-2">
          Welcome Back 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sign in to continue to Image Studio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <AuthInput
          icon={Mail}
          label="Email Address"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          error={errors.email}
          required
        />

        <AuthInput
          icon={Lock}
          label="Password"
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          error={errors.password}
          required
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-indigo-500 dark:text-cyan-300 hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton
          type="submit"
          loading={loading}
          disabled={!isFormValid || loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </PrimaryButton>

        <SecondaryButton onClick={onGuestLogin} icon={Sparkles}>
          Continue as Guest
        </SecondaryButton>

        <div className="text-center">
          <span className="dark:text-gray-300">Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-indigo-500 dark:text-cyan-300 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </div>
      </form>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
