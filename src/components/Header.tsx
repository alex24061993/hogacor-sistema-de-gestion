import React, { useState } from 'react';
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
  HardHat,
  MessageSquare,
  Calculator,
  Database,
  Bell,
  Plus,
  ExternalLink,
  Sliders,
  TrendingUp,
  Sparkles,
  Users,
  Boxes,
  Receipt
} from 'lucide-react';
import { User, SystemNotification, Project, StaffMember, CostItem } from '../types';
import { NotificationsDropdown } from './NotificationsDropdown';
import { formatCurrency } from '../utils/storage';
import { HOGACOR_LOGO } from '../assets/logo';

interface HeaderProps {
  currentUser: User;
  activeNav: string;
  onNavigate: (module: string) => void;
  notifications: SystemNotification[];
  projects?: Project[];
  staff?: StaffMember[];
  costs?: CostItem[];
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onToggleRead: (id: string) => void;
  onSimulateEvent: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenBackupModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  notifications,
  projects = [],
  staff = [],
  costs = [],
  onOpenAuthModal,
  onLogout,
  onMarkAllAsRead,
  onClearAll,
  onToggleRead,
  onSimulateEvent,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onOpenBackupModal,
}) => {
  const hasAdminAccess = currentUser.permissions.admin?.canAccess;

  const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const activeProjectsCount = projects.filter(p => p.status === 'En curso').length;

  return (
    <div className="w-full">
      {/* Upper Red Header Band (Matching "dashboard estilo rodo.jpg") */}
      <div className="bg-gradient-to-r from-[#9b1317] via-[#8c1014] to-[#7a0d10] text-white pt-5 pb-8 px-4 sm:px-6 md:px-8 rounded-t-[32px] md:rounded-t-[36px] shadow-inner relative overflow-hidden">
        {/* Background decorative curve */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Top Row: Brand Logo, Nav Links, and Search & Profile */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group transition-transform hover:scale-[1.02]"
              title="HOGACOR Suite - Ir al Dashboard"
            >
              <img 
                src={HOGACOR_LOGO} 
                alt="HOGACOR Logo" 
                className="h-10 md:h-12 w-auto object-contain drop-shadow-md brightness-105"
              />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/80">
            {[
              { id: 'dashboard', label: 'DASHBOARD' },
              { id: 'obras', label: 'OBRAS' },
              { id: 'inventario', label: 'INVENTARIO' },
              { id: 'costos', label: 'COSTOS' },
              { id: 'personal', label: 'PERSONAL' },
              { id: 'calculos', label: 'CÁLCULOS' },
              { id: 'reportes', label: 'REPORTES' },
              { id: 'mensajes', label: 'MENSAJES' },
            ].map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all uppercase whitespace-nowrap ${
                    isActive
                      ? 'bg-black/30 text-white font-black shadow-inner border border-white/20'
                      : 'hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {hasAdminAccess && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-xl transition-all uppercase whitespace-nowrap ${
                  activeNav === 'admin'
                    ? 'bg-black/30 text-white font-black shadow-inner border border-white/20'
                    : 'hover:text-white hover:bg-white/10'
                }`}
              >
                ADMIN
              </button>
            )}
          </nav>

          {/* Right Action Controls: Backup Data, Notifications & Profile Button */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {/* Backup Data Button */}
            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 hover:bg-black/40 border border-white/20 transition-all text-xs font-bold text-white shadow-sm hover:scale-[1.02]"
                title="Copia de Seguridad y Respaldo de Datos (Backup JSON)"
              >
                <Database className="w-3.5 h-3.5 text-red-200" />
                <span className="hidden sm:inline">Backup Data</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            <NotificationsDropdown
              notifications={notifications}
              onMarkAllAsRead={onMarkAllAsRead}
              onClearAll={onClearAll}
              onToggleRead={onToggleRead}
              onSimulateEvent={onSimulateEvent}
            />

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-black/25 hover:bg-black/40 border border-white/20 transition-all text-xs font-semibold"
              title="Cambiar de perfil / Iniciar sesión"
            >
              <div className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="hidden md:inline text-white font-bold text-xs truncate max-w-[100px]">
                {currentUser.name.split(' ')[0]}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={onToggleMobileMenu}
              className="xl:hidden p-2 rounded-xl bg-black/25 text-white border border-white/15 hover:bg-black/40 transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Lower Row inside the Red Zone: 3-4 Metric Cards with Wave Curves (matching reference image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 font-mono-numbers">
          {/* Metric 1 */}
          <div className="p-4 rounded-2xl bg-[#7c0d10]/90 border border-white/10 shadow-inner flex items-center justify-between text-white">
            <div>
              <span className="text-xl md:text-2xl font-black block tracking-tight">
                {totalBudget > 0 ? formatCurrency(totalBudget) : '$0'}
              </span>
              <span className="text-[11px] text-white/70 font-sans uppercase font-bold tracking-wider">
                Presupuesto Total en Obras
              </span>
            </div>
            {/* Sparkline wave */}
            <svg className="w-16 h-8 text-white/40 shrink-0" fill="none" viewBox="0 0 64 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 18 C12 10, 20 22, 32 12 C44 4, 52 16, 63 6" />
            </svg>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-2xl bg-[#7c0d10]/90 border border-white/10 shadow-inner flex items-center justify-between text-white">
            <div>
              <span className="text-xl md:text-2xl font-black block tracking-tight">
                {projects.length}
              </span>
              <span className="text-[11px] text-white/70 font-sans uppercase font-bold tracking-wider">
                {activeProjectsCount > 0 ? `${activeProjectsCount} En Curso` : 'Obras Registradas'}
              </span>
            </div>
            <svg className="w-16 h-8 text-white/40 shrink-0" fill="none" viewBox="0 0 64 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12 C14 4, 28 20, 42 8 C50 2, 58 14, 63 10" />
            </svg>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-2xl bg-[#7c0d10]/90 border border-white/10 shadow-inner flex items-center justify-between text-white">
            <div>
              <span className="text-xl md:text-2xl font-black block tracking-tight">
                {staff.length}
              </span>
              <span className="text-[11px] text-white/70 font-sans uppercase font-bold tracking-wider">
                Personal en Nómina
              </span>
            </div>
            <svg className="w-16 h-8 text-white/40 shrink-0" fill="none" viewBox="0 0 64 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 16 C16 8, 30 22, 45 6 C52 14, 58 8, 63 4" />
            </svg>
          </div>

          {/* Metric 4 */}
          <div 
            onClick={() => onNavigate('calculos')}
            className="p-4 rounded-2xl bg-[#66090c]/90 border border-white/20 shadow-inner flex items-center justify-between text-white cursor-pointer hover:bg-[#5b080a] transition-colors group"
            title="Ir a Calculadoras de Ingeniería"
          >
            <div>
              <span className="text-xl md:text-2xl font-black block tracking-tight flex items-center gap-1.5 text-amber-300">
                13
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <span className="text-[11px] text-white/80 font-sans uppercase font-bold tracking-wider group-hover:text-amber-200">
                Calculadoras CIRSOC
              </span>
            </div>
            <svg className="w-16 h-8 text-amber-300/40 shrink-0" fill="none" viewBox="0 0 64 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 10 C15 18, 30 4, 45 16 C52 8, 58 12, 63 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating White Profile Bar (Matching Diane Diaz Card in reference image) */}
      <div className="mx-4 sm:mx-6 md:mx-8 -mt-5 relative z-10 bg-white rounded-2xl shadow-lg border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: User Avatar & Name */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                {currentUser.name}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                currentUser.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {currentUser.roleTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{currentUser.department}</span>
              <span>·</span>
              <span className="text-slate-400 font-mono text-[11px]">{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('calculos')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5 text-red-600" />
            <span>Calculadoras</span>
          </button>

          <button
            onClick={() => onNavigate('obras')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#9a1417] hover:bg-[#830e11] rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Obra</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Opciones de perfil y sesión"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden mx-4 my-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-200 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard General' },
            { id: 'obras', label: 'Gestión de Obras' },
            { id: 'inventario', label: 'Inventario de Pañol' },
            { id: 'costos', label: 'Control de Costos' },
            { id: 'personal', label: 'Nómina de Personal' },
            { id: 'calculos', label: 'Cálculos & Ingeniería (13 Módulos)' },
            { id: 'reportes', label: 'Informes y Exportación' },
            { id: 'mensajes', label: 'Mensajería entre Usuarios' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold ${
                activeNav === item.id ? 'bg-red-50 text-red-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          {hasAdminAccess && (
            <button
              onClick={() => {
                onNavigate('admin');
                onToggleMobileMenu();
              }}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold ${
                activeNav === 'admin' ? 'bg-red-50 text-red-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Panel Administrativo
            </button>
          )}
        </div>
      )}
    </div>
  );
};
