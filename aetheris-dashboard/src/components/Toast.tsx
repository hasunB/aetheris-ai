import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  isDark?: boolean;
}

export const ToastContainer = ({ toasts, onDismiss, isDark = true }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} isDark={isDark} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({
  toast,
  onDismiss,
  isDark,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  isDark: boolean;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-xl flex items-start gap-3 ${
        isSuccess
          ? isDark
            ? 'bg-[#062c1e]/90 border-emerald-500/30 text-emerald-200'
            : 'bg-emerald-50/95 border-emerald-300 text-emerald-900 shadow-emerald-200/50'
          : isError
          ? isDark
            ? 'bg-[#2c0b0e]/90 border-red-500/30 text-red-200'
            : 'bg-red-50/95 border-red-300 text-red-900 shadow-red-200/50'
          : isDark
          ? 'bg-[#0a1b3a]/90 border-blue-500/30 text-blue-200'
          : 'bg-blue-50/95 border-blue-300 text-blue-900 shadow-blue-200/50'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
      </div>

      <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-md cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
