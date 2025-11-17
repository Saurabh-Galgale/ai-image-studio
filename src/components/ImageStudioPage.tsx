import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
  DragEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Modal from "./Modal";
import Toast from "./Toast";

import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Wand2,
  History,
  LogOut,
  X,
  Sun,
  Moon,
} from "lucide-react";

const API_BASE = "http://localhost:4000";

const GET_HISTORY_URL = `${API_BASE}/generations`;
const POST_GENERATE_URL = `${API_BASE}/generations`;

const ALLOWED_STYLES = [
  "cartoon",
  "3d-render",
  "oil-painting",
  "editorial",
] as const;

type AllowedStyle = (typeof ALLOWED_STYLES)[number];

interface ImageRecord {
  id?: string | number;
  url: string;
  prompt: string;
  style: string;
  timestamp: string;
  status: string;
}

interface ResizeResult {
  file: File;
  url: string;
}

interface ToastType {
  message: string;
  type: "success" | "danger";
}

interface ImageStudioProps {
  onLogout?: () => void;
  onNavigateToHistory?: () => void;
}

const toAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

const ImageStudioPage = ({ onLogout }: ImageStudioProps) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeProgress, setResizeProgress] = useState(0);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<AllowedStyle>(ALLOWED_STYLES[0]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageRecord | null>(
    null
  );

  const [showModal, setShowModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [history, setHistory] = useState<ImageRecord[]>([]);
  const [toast, setToast] = useState<ToastType | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_) {}

    if (onLogout) onLogout();
    navigate("/");
  };

  // -----------------------------------
  // IMAGE RESIZE FUNCTION (STRICT TYPED)
  // -----------------------------------

  const resizeImage = useCallback(
    (file: File): Promise<ResizeResult> =>
      new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No file"));

        setIsResizing(true);
        setResizeProgress(0);

        const reader = new FileReader();

        reader.onerror = () => {
          setIsResizing(false);
          reject(new Error("Failed to read file"));
        };

        reader.onload = (e) => {
          const img = new Image();

          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Canvas context not available");

              let width = img.width;
              let height = img.height;

              if (width > 1920) {
                height = Math.round((height * 1920) / width);
                width = 1920;
              }

              canvas.width = width;
              canvas.height = height;

              let progress = 0;
              const interval = setInterval(() => {
                progress += 10;
                setResizeProgress(Math.min(progress, 100));
                if (progress >= 100) clearInterval(interval);
              }, 50);

              setTimeout(() => {
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      setIsResizing(false);
                      return reject(new Error("toBlob failed"));
                    }
                    const resized = new File([blob], file.name, {
                      type: file.type || "image/png",
                    });

                    const url = URL.createObjectURL(resized);

                    setIsResizing(false);
                    setResizeProgress(0);

                    resolve({ file: resized, url });
                  },
                  file.type || "image/png",
                  0.92
                );
              }, 600);
            } catch (error) {
              setIsResizing(false);
              reject(error);
            }
          };

          img.onerror = () => {
            setIsResizing(false);
            reject(new Error("Image load error"));
          };

          img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      }),
    []
  );

  // -----------------------------------
  // FILE UPLOAD
  // -----------------------------------

  const handleFileUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setToast({ message: "Please upload an image file", type: "danger" });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: "File must be < 10MB", type: "danger" });
        return;
      }

      try {
        const { file: resized, url } = await resizeImage(file);
        if (uploadedImage) URL.revokeObjectURL(uploadedImage);

        setUploadedFile(resized);
        setUploadedImage(url);

        setToast({ message: "Image uploaded & resized", type: "success" });
      } catch (_) {
        setToast({ message: "Image processing failed", type: "danger" });
      }
    },
    [resizeImage, uploadedImage]
  );

  // -----------------------------------
  // DRAG DROP HANDLERS (TYPED)
  // -----------------------------------

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0] || null;
      handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  // -----------------------------------
  // LOAD HISTORY (backend kept as any)
  // -----------------------------------

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const loadHistory = async () => {
      if (!token) return;

      try {
        const resp: any = await axios.get(`${GET_HISTORY_URL}?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!mounted) return;

        if (Array.isArray(resp.data)) {
          const mapped: ImageRecord[] = resp.data.map((r: any) => ({
            id: r.id,
            url: toAbsoluteUrl(
              r.imageUrl ||
                r.image_url ||
                r.result_image_path ||
                r.input_image_path
            ),
            prompt: r.prompt || "",
            style: r.style || "",
            timestamp: r.createdAt || r.created_at || "",
            status: r.status || "",
          }));

          setHistory(mapped);
        }
      } catch (err: any) {
        if (!mounted) return;
        setToast({ message: "Failed to load history", type: "danger" });
      }
    };

    loadHistory();
    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------------------
  // GENERATE IMAGE (response kept as ANY)
  // -----------------------------------

  const canGenerate = !!uploadedFile && !isResizing && !isGenerating;

  const handleGenerate = useCallback(async () => {
    if (!uploadedFile) {
      setToast({ message: "Upload an image first", type: "danger" });
      return;
    }

    setIsGenerating(true);
    setToast(null);

    const token = localStorage.getItem("token") || "";

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("style", style);
    form.append("image", uploadedFile, uploadedFile.name);

    try {
      const resp: any = await axios.post(POST_GENERATE_URL, form, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (resp.status === 200 || resp.status === 201) {
        const data = resp.data;

        const rec: ImageRecord = {
          id: data.id,
          url: toAbsoluteUrl(
            data.imageUrl || data.image_url || data.result_image_path
          ),
          prompt: data.prompt || "",
          style: data.style || style,
          timestamp: data.createdAt || new Date().toISOString(),
          status: data.status || "completed",
        };

        setGeneratedImage(rec);
        setHistory((prev) => [rec, ...prev].slice(0, 5));
        setToast({ message: "Image generated!", type: "success" });
      }
    } catch (err: any) {
      if (err?.response?.status === 503) {
        setShowModal(true);
      }
      setToast({ message: "Generation failed", type: "danger" });
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedFile, prompt, style, isResizing]);

  const handleRetry = () => {
    setRetryCount((p) => p + 1);
    setShowModal(false);
    setTimeout(() => handleGenerate(), 250);
  };

  const handleAbort = () => {
    setIsGenerating(false);
    setToast({ message: "Cancelled", type: "danger" });
  };

  const handleHistoryClick = (item: ImageRecord) => {
    setGeneratedImage(item);
    setPrompt(item.prompt);
    setStyle((item.style as AllowedStyle) || ALLOWED_STYLES[0]);
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  useEffect(
    () => () => {
      if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    },
    [uploadedImage]
  );

  const goToHistory = () => navigate("/history");

  // -----------------------------------
  // RETURN JSX (UNCHANGED)
  // -----------------------------------

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-indigo-500 dark:text-cyan-400" />
              <span className="text-xl font-bold dark:text-white">
                Image Studio
              </span>
            </motion.div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={goToHistory}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <History className="w-5 h-5" />
                <span className="hidden sm:inline">History</span>
              </motion.button>

              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, rotate: 180 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Upload + Generate */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </h2>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleBrowseClick}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleFileUpload(e.target.files?.[0] || null)
                  }
                />

                {uploadedImage ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (uploadedImage) URL.revokeObjectURL(uploadedImage);
                        setUploadedFile(null);
                        setUploadedImage(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <div>
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="dark:text-gray-200 font-medium mb-2">
                      Drop or click to upload
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      PNG/JPEG, Less Than 10MB
                    </p>
                  </div>
                )}
              </div>

              {isResizing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm dark:text-gray-300 mb-1">
                    <span>Resizing...</span>
                    <span>{resizeProgress}%</span>
                  </div>

                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      animate={{ width: `${resizeProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Generate Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Generate
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="dark:text-gray-300 text-sm mb-1 block">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white"
                    placeholder="Describe desired changes..."
                  />
                </div>

                <div>
                  <label className="dark:text-gray-300 text-sm mb-1 block">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as AllowedStyle)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white"
                  >
                    {ALLOWED_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  {!isGenerating ? (
                    <motion.button
                      whileHover={canGenerate ? { scale: 1.03 } : {}}
                      disabled={!canGenerate}
                      onClick={handleGenerate}
                      className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold ${
                        canGenerate
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          : "bg-gray-300 dark:bg-gray-700 text-gray-600"
                      }`}
                    >
                      <Wand2 className="w-5 h-5" />
                      Generate
                    </motion.button>
                  ) : (
                    <>
                      <div className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                        Generating...
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={handleAbort}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl"
                      >
                        Abort
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* HISTORY SCROLLER */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700"
          >
            <h3 className="text-lg font-bold dark:text-white mb-4">
              Recent Images
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.1 }}
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => handleHistoryClick(item)}
                >
                  <img
                    src={item.url}
                    className="w-24 h-24 rounded-lg object-cover border dark:border-gray-600 shadow"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRetry={handleRetry}
        retryCount={retryCount}
      />

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageStudioPage;
