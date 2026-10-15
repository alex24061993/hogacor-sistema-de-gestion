import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationToastProps {
  notifications: SystemNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  // Only display the 3 most recent unread notifications as toasts
  const activeToasts = notifications.filter(n => !n.read).slice(0, 3);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-600 shrink-0" />;
    }
  };

  const getBgStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-950';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-950';
      case 'success':
        return 'bg-teal-50 border-teal-200 text-teal-950';
      default:
        return 'bg-sky-50 border-sky-200 text-sky-950';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-sm flex items-start gap-3 ${getBgStyle(
              toast.severity
            )}`}
          >
            {getIcon(toast.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold tracking-tight uppercase">
                  {toast.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono-numbers">
                  {toast.timestamp}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
