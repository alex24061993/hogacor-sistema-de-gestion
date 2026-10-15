import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, AlertTriangle, CheckCircle2, Info, Check, Trash2, Zap } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationsDropdownProps {
  notifications: SystemNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onSimulateEvent: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onToggleRead,
  onSimulateEvent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'critical') return n.severity === 'critical';
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-label="Notificaciones del sistema"
        title="Centro de Notificaciones en Tiempo Real"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
              className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        Notificaciones en Tiempo Real
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Eventos críticos y actividad del sistema
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onSimulateEvent}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100/90 hover:bg-amber-200 rounded-lg transition-colors border border-amber-200"
                    title="Simular un evento crítico en vivo"
                  >
                    <Zap className="w-3 h-3 text-amber-700" />
                    Simular
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-1 text-center font-medium rounded-md transition-all ${
                      filter === 'all'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todas ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('critical')}
                    className={`flex-1 py-1 text-center font-medium rounded-md transition-all ${
                      filter === 'critical'
                        ? 'bg-white text-red-700 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Críticas
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 py-1 text-center font-medium rounded-md transition-all ${
                      filter === 'unread'
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    No leídas ({unreadCount})
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm font-medium">No hay notificaciones en este filtro.</p>
                    <p className="text-xs mt-1 text-slate-400">El sistema opera con normalidad.</p>
                  </div>
                ) : (
                  filteredNotifications.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onToggleRead(item.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !item.read ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getSeverityIcon(item.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-xs ${
                              !item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono-numbers shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Marcar todo leído
                </button>
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpiar historial
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
