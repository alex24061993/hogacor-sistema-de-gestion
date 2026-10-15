import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Check, 
  X,
  Sliders,
  Shield,
  Clock,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { User, ActivityLog, ModuleKey, RoleType, UserPermissions } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../utils/mockData';
import { exportAuditLogsToExcel, exportUsersToExcel } from '../utils/exportUtils';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  logs: ActivityLog[];
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (newUser: User) => void;
  onSimulateLog: () => void;
}

const MODULE_DEFINITIONS: { key: ModuleKey; label: string; desc: string }[] = [
  { key: 'dashboard', label: 'Dashboard & Métricas', desc: 'Acceso a tableros ejecutivos y KPIs' },
  { key: 'obras', label: 'Gestión de Obras', desc: 'Proyectos, etapas y avances constructivos' },
  { key: 'costos', label: 'Gestión de Costos', desc: 'Servicios, impuestos, alquileres y otros egresos' },
  { key: 'inventario', label: 'Inventario de Obras', desc: 'Control de herramientas e insumos de pañol' },
  { key: 'personal', label: 'Personal & Nómina', desc: 'Fichas, jornales y legajos con archivos adjuntos' },
  { key: 'finanzas', label: 'Finanzas & Presupuestos', desc: 'Presupuestos, cobros y flujos operativos' },
  { key: 'herramientas', label: 'Maquinaria & Equipos', desc: 'Vehículos y herramientas pesadas de obra' },
  { key: 'planos', label: 'Planos & Documentación', desc: 'Planos PDF, memorias técnicas y archivos' },
  { key: 'reportes', label: 'Reportes & Exportación', desc: 'Descarga de informes ejecutivos PDF y Excel' },
  { key: 'admin', label: 'Panel Administrativo', desc: 'Gestión de cuentas, permisos y auditoría' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  users,
  logs,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  onSimulateLog,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'matrix'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Permissions editor modal state
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<User | null>(null);
  const [tempPermissions, setTempPermissions] = useState<UserPermissions | null>(null);

  // Edit user profile modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Add new user modal state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<RoleType>('obra_admin');
  const [newUserDept, setNewUserDept] = useState('Ingeniería');

  // Check if current user has admin access and super admin privileges
  const hasAdminAccess = currentUser.permissions.admin?.canAccess;
  const canEditUsers = currentUser.role === 'super_admin';

  if (!hasAdminAccess) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-red-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido al Panel Administrativo</h2>
        <p className="text-sm text-slate-600 mb-6">
          Tu cuenta actual ({currentUser.name} - {currentUser.roleTitle}) no cuenta con privilegios de lectura para el módulo de Administración.
        </p>
        <p className="text-xs text-slate-500">
          Usa el botón "Cambiar Usuario" en la barra superior para iniciar sesión como <strong>Super Administrador</strong>.
        </p>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered logs
  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || l.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const openPermissionsModal = (user: User) => {
    setEditingPermissionsUser(user);
    setTempPermissions(JSON.parse(JSON.stringify(user.permissions)));
  };

  const handleTogglePermission = (mod: ModuleKey, type: 'canAccess' | 'canEdit' | 'canDelete') => {
    if (!tempPermissions) return;
    setTempPermissions({
      ...tempPermissions,
      [mod]: {
        ...tempPermissions[mod],
        [type]: !tempPermissions[mod]?.[type],
      },
    });
  };

  const handleSavePermissions = () => {
    if (!editingPermissionsUser || !tempPermissions) return;
    const updated = {
      ...editingPermissionsUser,
      permissions: tempPermissions,
    };
    onUpdateUser(updated);
    setEditingPermissionsUser(null);
    setTempPermissions(null);
  };

  const handleResetToRoleDefault = () => {
    if (!editingPermissionsUser) return;
    const defaultPerms = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[editingPermissionsUser.role]));
    setTempPermissions(defaultPerms);
  };

  const handleSaveUserProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const roleTitles: Record<RoleType, string> = {
      super_admin: 'Super Administrador',
      obra_admin: 'Administrador de Obra',
      supervisor: 'Supervisor de Terreno',
      auditor: 'Auditor Financiero',
      viewer: 'Cliente / Observador',
    };

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: '123456789',
      role: newUserRole,
      roleTitle: roleTitles[newUserRole] || 'Usuario Técnico',
      department: newUserDept.trim() || 'General',
      status: 'active',
      lastActive: 'Recién creado',
      createdAt: new Date().toISOString().slice(0, 10),
      permissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[newUserRole])),
    };

    onAddUser(newUser);
    setIsAddingUser(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clean Hazard Striping & Title */}
      <div className="relative bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Panel de Administración y Control de Cuentas
                </h1>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                  Seguridad & Roles
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Supervisa la actividad de los usuarios, gestiona credenciales y configura permisos de acceso y edición específicos por cada módulo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEditUsers && (
              <button
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Cuenta
              </button>
            )}
            <button
              onClick={() => exportUsersToExcel(users)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              title="Descargar lista de cuentas en formato Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Gestión de Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'activity'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Supervisión de Actividad en Vivo ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            Matriz de Roles y Privilegios
          </button>
        </div>
      </div>

      {/* TAB 1: USERS LIST & MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, correo o departamento..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
              >
                <option value="all">Todos los roles</option>
                <option value="super_admin">Super Administrador</option>
                <option value="obra_admin">Administrador de Obra</option>
                <option value="supervisor">Supervisor de Terreno</option>
                <option value="auditor">Auditor Financiero</option>
                <option value="viewer">Cliente / Observador</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 md:px-6">Usuario & Cargo</th>
                  <th className="py-3.5 px-4">Rol & Área</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Última Actividad</th>
                  <th className="py-3.5 px-4">Permisos Clave</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map(user => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono-numbers">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{user.roleTitle}</div>
                        <div className="text-[11px] text-slate-400">{user.department}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.status === 'inactive'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`} />
                          {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono-numbers text-[11px]">
                        {user.lastActive}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-mono ${
                            user.permissions.obras?.canEdit ? 'bg-teal-100 text-teal-800 font-semibold' : 'bg-slate-100 text-slate-400'
                          }`}>
                            Obras: {user.permissions.obras?.canEdit ? 'Edit' : user.permissions.obras?.canAccess ? 'Ver' : '—'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-mono ${
                            user.permissions.finanzas?.canEdit ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-slate-100 text-slate-400'
                          }`}>
                            Finanzas: {user.permissions.finanzas?.canEdit ? 'Edit' : user.permissions.finanzas?.canAccess ? 'Ver' : '—'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-mono ${
                            user.permissions.admin?.canAccess ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-slate-100 text-slate-400'
                          }`}>
                            Admin: {user.permissions.admin?.canAccess ? 'Sí' : 'No'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPermissionsModal(user)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Configurar permisos y privilegios específicos por módulo"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          {canEditUsers && (
                            <>
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Editar perfil y estado"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {user.id !== currentUser.id && user.role !== 'super_admin' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Eliminar la cuenta de ${user.name}?`)) {
                                      onDeleteUser(user.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE AUDIT LOG & SUPERVISION */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header controls */}
          <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar en el registro de actividad..."
                  className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700"
              >
                <option value="all">Todas las severidades</option>
                <option value="critical">Críticas</option>
                <option value="warning">Advertencias</option>
                <option value="info">Informativas</option>
                <option value="success">Completadas</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSimulateLog}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200"
                title="Generar un evento de auditoría en vivo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Simular Actividad en Vivo
              </button>
              <button
                onClick={() => exportAuditLogsToExcel(logs)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Log
              </button>
            </div>
          </div>

          {/* Activity Feed Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 md:px-6">Momento</th>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Acción Realizada</th>
                  <th className="py-3.5 px-4">Módulo</th>
                  <th className="py-3.5 px-4">Detalle de la Operación</th>
                  <th className="py-3.5 px-4">Severidad</th>
                  <th className="py-3.5 px-4 md:px-6">Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map(log => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 md:px-6 text-slate-500 font-mono-numbers text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {log.timestamp}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400">{log.userRole}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {log.action}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
                          {log.module.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        {log.details}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : log.severity === 'success'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 md:px-6 text-slate-400 text-[10px] font-mono-numbers">
                        <div>{log.ipAddress || '190.220.14.33'}</div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{log.device || 'Navegador'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & PRIVILEGES REFERENCE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-hidden space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Arquitectura de Roles y Privilegios del Sistema
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Esquema de permisos predeterminados por perfil. El Super Administrador puede personalizar estos privilegios de forma granular para cada usuario individual.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Módulo</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Admin de Obra</th>
                  <th className="p-3 text-center">Supervisor</th>
                  <th className="p-3 text-center">Auditor</th>
                  <th className="p-3 text-center">Cliente/Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULE_DEFINITIONS.map(mod => (
                  <tr key={mod.key} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{mod.label}</div>
                      <div className="text-[11px] text-slate-400">{mod.desc}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 font-bold rounded text-[10px]">Total (C/R/U/D)</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        DEFAULT_ROLE_PERMISSIONS.obra_admin[mod.key].canEdit
                          ? 'bg-teal-100 text-teal-800'
                          : DEFAULT_ROLE_PERMISSIONS.obra_admin[mod.key].canAccess
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {DEFAULT_ROLE_PERMISSIONS.obra_admin[mod.key].canEdit ? 'Edición' : DEFAULT_ROLE_PERMISSIONS.obra_admin[mod.key].canAccess ? 'Lectura' : 'Denegado'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        DEFAULT_ROLE_PERMISSIONS.supervisor[mod.key].canEdit
                          ? 'bg-teal-100 text-teal-800'
                          : DEFAULT_ROLE_PERMISSIONS.supervisor[mod.key].canAccess
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {DEFAULT_ROLE_PERMISSIONS.supervisor[mod.key].canEdit ? 'Edición' : DEFAULT_ROLE_PERMISSIONS.supervisor[mod.key].canAccess ? 'Lectura' : 'Denegado'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        DEFAULT_ROLE_PERMISSIONS.auditor[mod.key].canEdit
                          ? 'bg-teal-100 text-teal-800'
                          : DEFAULT_ROLE_PERMISSIONS.auditor[mod.key].canAccess
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {DEFAULT_ROLE_PERMISSIONS.auditor[mod.key].canEdit ? 'Edición' : DEFAULT_ROLE_PERMISSIONS.auditor[mod.key].canAccess ? 'Lectura' : 'Denegado'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        DEFAULT_ROLE_PERMISSIONS.viewer[mod.key].canAccess
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {DEFAULT_ROLE_PERMISSIONS.viewer[mod.key].canAccess ? 'Lectura' : 'Denegado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: GRANULAR PERMISSIONS EDITOR */}
      <AnimatePresence>
        {editingPermissionsUser && tempPermissions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-teal-400" />
                    Permisos Específicos: {editingPermissionsUser.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingPermissionsUser.roleTitle} · {editingPermissionsUser.department}
                  </p>
                </div>
                <button
                  onClick={() => setEditingPermissionsUser(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span>Marca o desmarca los privilegios específicos que deseas asignar a este usuario:</span>
                  <button
                    onClick={handleResetToRoleDefault}
                    className="text-teal-700 font-semibold hover:underline"
                  >
                    Restablecer a valores de rol
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {MODULE_DEFINITIONS.map(mod => {
                    const p = tempPermissions[mod.key] || { canAccess: false, canEdit: false, canDelete: false };
                    return (
                      <div key={mod.key} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-slate-900">{mod.label}</h4>
                          <p className="text-[11px] text-slate-500">{mod.desc}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Access checkbox */}
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p.canAccess}
                              onChange={() => handleTogglePermission(mod.key, 'canAccess')}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span>Acceso</span>
                          </label>

                          {/* Edit checkbox */}
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p.canEdit}
                              onChange={() => handleTogglePermission(mod.key, 'canEdit')}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span>Edición</span>
                          </label>

                          {/* Delete checkbox */}
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p.canDelete}
                              onChange={() => handleTogglePermission(mod.key, 'canDelete')}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <span>Eliminar</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingPermissionsUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
                >
                  Guardar Permisos Específicos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT USER PROFILE */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <form onSubmit={handleSaveUserProfile}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">Editar Perfil de Cuenta</h3>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rol</label>
                      <select
                        value={editingUser.role}
                        onChange={e => {
                          const r = e.target.value as RoleType;
                          setEditingUser({
                            ...editingUser,
                            role: r,
                            permissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS[r])),
                          });
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="obra_admin">Admin de Obra</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="auditor">Auditor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
                      <select
                        value={editingUser.status}
                        onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento</label>
                    <input
                      type="text"
                      value={editingUser.department}
                      onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD NEW USER */}
      <AnimatePresence>
        {isAddingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <form onSubmit={handleCreateNewUser}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5 text-teal-400" />
                    Registrar Nueva Cuenta de Usuario
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="Ej: Ing. Laura Mendoza"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      placeholder="laura.mendoza@hogacor.com"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rol Inicial</label>
                      <select
                        value={newUserRole}
                        onChange={e => setNewUserRole(e.target.value as RoleType)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="obra_admin">Admin de Obra</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="auditor">Auditor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento</label>
                      <input
                        type="text"
                        value={newUserDept}
                        onChange={e => setNewUserDept(e.target.value)}
                        placeholder="Ej: Obras Civiles"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
                  >
                    Crear y Asignar Permisos
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
