import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Check, Lock, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onSelectUser: (id: string) => void;
  onUpdateUserPassword: (userId: string, newPass: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onSelectUser,
  onUpdateUserPassword,
}) => {
  const [tab, setTab] = useState<'switch' | 'change_password'>('switch');

  // Selected profile to unlock with password
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Change password tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const handleSelectProfileCard = (u: User) => {
    setTargetUser(u);
    setInputPassword('');
    setAuthError('');
    setShowPassword(false);
  };

  const handleUnlockProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    const expectedPass = targetUser.password || '123456789';
    if (inputPassword === expectedPass) {
      onSelectUser(targetUser.id);
      setTargetUser(null);
      setInputPassword('');
      setAuthError('');
      onClose();
    } else {
      setAuthError('Contraseña incorrecta. Recuerda que la contraseña por defecto es 123456789.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    const expectedCurrent = currentUser.password || '123456789';
    if (currentPassword !== expectedCurrent) {
      setChangeError('La contraseña actual ingresada es incorrecta.');
      return;
    }

    if (newPassword.length < 4) {
      setChangeError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    onUpdateUserPassword(currentUser.id, newPassword);
    setChangeSuccess('¡Contraseña actualizada correctamente!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Modal header with brand accent */}
            <div className="relative bg-slate-900 text-white p-6">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#e40901]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/20">
                    ⚙️
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Acceso y Perfiles de Usuario</h2>
                    <p className="text-xs text-slate-400">
                      Ingreso seguro protegido con contraseña (por defecto: 123456789)
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-5 p-1 bg-white/10 rounded-xl text-xs">
                <button
                  onClick={() => {
                    setTab('switch');
                    setTargetUser(null);
                    setAuthError('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'switch' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Ingresar a Perfil
                </button>
                <button
                  onClick={() => {
                    setTab('change_password');
                    setChangeError('');
                    setChangeSuccess('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'change_password' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Cambiar Mi Contraseña
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {tab === 'switch' && (
                <div>
                  {!targetUser ? (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-600 mb-2 font-medium">
                        Selecciona el perfil al que deseas ingresar. Se te solicitará la contraseña de acceso:
                      </div>

                      {users.map(u => {
                        const isSelected = u.id === currentUserId;
                        return (
                          <div
                            key={u.id}
                            onClick={() => handleSelectProfileCard(u)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 overflow-hidden shrink-0">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                                  {isSelected && (
                                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                                      Sesión Actual
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">
                                  <strong>{u.roleTitle}</strong> · <span className="text-slate-400">{u.department}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono-numbers">
                                  {u.email}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                u.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                {u.role === 'super_admin' ? 'SUPER ADMIN' : 'OBRA ADMIN'}
                              </span>
                              <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Password Prompt form for selected profile */
                    <form onSubmit={handleUnlockProfile} className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                            {targetUser.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{targetUser.name}</h4>
                            <p className="text-xs text-slate-500">{targetUser.roleTitle} · {targetUser.role === 'super_admin' ? 'Super Admin' : 'Obra Admin'}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTargetUser(null)}
                          className="text-xs text-teal-700 font-semibold hover:underline"
                        >
                          Elegir otro
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ingresa la contraseña para {targetUser.name} *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            value={inputPassword}
                            onChange={e => {
                              setInputPassword(e.target.value);
                              setAuthError('');
                            }}
                            placeholder="Contraseña de acceso"
                            className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          🔑 Contraseña por defecto: <strong className="font-mono text-slate-800">123456789</strong>
                        </p>
                      </div>

                      {authError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setTargetUser(null)}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-teal-700 rounded-xl shadow transition-colors"
                        >
                          Ingresar a {targetUser.name}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {tab === 'change_password' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                    Cambiando contraseña para: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.roleTitle})
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contraseña Actual *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual (por defecto: 123456789)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {changeError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{changeError}</span>
                    </div>
                  )}

                  {changeSuccess && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-xs text-teal-800">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{changeSuccess}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
                    >
                      Guardar Nueva Contraseña
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
