import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, HardHat } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (userId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const expected = selectedUser.password || '123456789';
    if (password === expected) {
      onLoginSuccess(selectedUser.id);
    } else {
      setError('Contraseña incorrecta. Recuerda que la contraseña por defecto es 123456789.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background industrial grid & subtle ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#e40901]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden"
      >
        {/* Top Header with construction icon */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md inline-flex items-center justify-center text-amber-500">
              <HardHat className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>HOGACOR</span>
            <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Control de Obras
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Acceso restringido a personal autorizado. Selecciona tu perfil e ingresa tu contraseña para ver la información.
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {!selectedUser ? (
            /* Step 1: Select Profile */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span>Selecciona tu perfil de usuario:</span>
                <span className="text-teal-700 font-mono">4 PERFILES</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group shadow-sm hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm group-hover:bg-teal-700 transition-colors">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-teal-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          <strong>{u.roleTitle}</strong> · <span className="text-slate-400">{u.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase font-mono ${
                        u.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Obra Admin'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Step 2: Enter Password */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-500">{selectedUser.roleTitle} ({selectedUser.role === 'super_admin' ? 'Super Admin' : 'Obra Admin'})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-teal-700 font-bold hover:underline"
                >
                  Cambiar
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Ingresa la contraseña"
                    className="w-full pl-3.5 pr-10 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Contraseña por defecto: <strong className="font-mono text-slate-800">123456789</strong>
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex-1 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-teal-700 rounded-xl shadow transition-all flex-2 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Ingresar a la Plataforma
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <span>HOGACOR Suite v2.4 · Sistema Protegido de Obras Civiles</span>
        </div>
      </motion.div>
    </div>
  );
};
