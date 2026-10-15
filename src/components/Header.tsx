import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  User as UserIcon, 
  Menu, 
  X,
  ChevronDown,
  Layers,
  Settings,
  LogOut,
  HardHat
} from 'lucide-react';
import { User, SystemNotification } from '../types';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  currentUser: User;
  activeNav: string;
  onNavigate: (module: string) => void;
  notifications: SystemNotification[];
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onSimulateEvent: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  notifications,
  onOpenAuthModal,
  onLogout,
  onMarkAllAsRead,
  onClearAll,
  onToggleRead,
  onSimulateEvent,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const hasAdminAccess = currentUser.permissions.admin?.canAccess;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top accent bar */}
      <div 
        className="h-1.5 w-full"
        style={{ backgroundColor: '#e40901' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* ZONE 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0 group-hover:border-amber-400 group-hover:bg-amber-50/40 transition-all"
                style={{ backgroundColor: '#ffffff' }}
              >
                <HardHat className="w-6 h-6 text-amber-500 stroke-[2.2]" />
              </div>
              <div className="whitespace-nowrap">
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                  HOGACOR
                </span>
                <span 
                  className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  Seguimiento & Admin
                </span>
              </div>
            </button>
          </div>

          {/* ZONE 2: Concise Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeNav === 'dashboard' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('obras')}
              className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                activeNav === 'obras' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-500" />
              Obras
            </button>
            <button
              onClick={() => onNavigate('inventario')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeNav === 'inventario' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Inventario
            </button>
            <button
              onClick={() => onNavigate('costos')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeNav === 'costos' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Costos
            </button>
            <button
              onClick={() => onNavigate('personal')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeNav === 'personal' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => onNavigate('reportes')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeNav === 'reportes' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
              }`}
            >
              Reportes
            </button>
            {hasAdminAccess && (
              <button
                onClick={() => onNavigate('admin')}
                className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  activeNav === 'admin' ? 'text-teal-700 font-bold' : 'hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* ZONE 3: Primary Action & Profile Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Real-time Notifications Bell */}
            <NotificationsDropdown
              notifications={notifications}
              onMarkAllAsRead={onMarkAllAsRead}
              onClearAll={onClearAll}
              onToggleRead={onToggleRead}
              onSimulateEvent={onSimulateEvent}
            />

            {/* User Account / Role Switcher Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-semibold text-slate-800"
              title="Cambiar de perfil (Ingreso protegido con contraseña)"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="hidden sm:inline font-bold truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="hidden lg:inline text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded font-mono">
                {currentUser.role.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              title="Cerrar sesión / Bloquear acceso"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Menú móvil"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                onNavigate('dashboard');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                activeNav === 'dashboard' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                onNavigate('obras');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 ${
                activeNav === 'obras' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <HardHat className="w-4 h-4 text-amber-500 shrink-0" />
              Gestión de Obras
            </button>
            <button
              onClick={() => {
                onNavigate('inventario');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                activeNav === 'inventario' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Inventario (Herramientas & Insumos)
            </button>
            <button
              onClick={() => {
                onNavigate('costos');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                activeNav === 'costos' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Costos (Servicios, Impuestos, Alquileres, Otros)
            </button>
            <button
              onClick={() => {
                onNavigate('personal');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                activeNav === 'personal' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Nómina de Personal
            </button>
            <button
              onClick={() => {
                onNavigate('reportes');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                activeNav === 'reportes' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Informes y Exportación
            </button>
            {hasAdminAccess && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  onToggleMobileMenu();
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  activeNav === 'admin' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Panel Administrativo
              </button>
            )}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenAuthModal();
                  onToggleMobileMenu();
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 flex items-center justify-between"
              >
                <span>Cambiar de Perfil (Con Contraseña)</span>
                <UserIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onToggleMobileMenu();
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center justify-between mt-1"
              >
                <span>Cerrar Sesión</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
