import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Paperclip, 
  FileText, 
  Download, 
  Eye, 
  X, 
  Check, 
  DollarSign, 
  Calendar, 
  Upload, 
  FileUp, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  FileCheck2,
  Info
} from 'lucide-react';
import { StaffMember, StaffAttachedFile, User } from '../types';
import { formatCurrency } from '../utils/storage';
import { downloadCSV } from '../utils/exportUtils';

interface StaffViewProps {
  currentUser: User;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  currentUser,
  staff,
  onUpdateStaff,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canEdit = isSuperAdmin || Boolean(currentUser.permissions?.personal?.canEdit);
  const canDelete = isSuperAdmin || Boolean(currentUser.permissions?.personal?.canDelete);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    nombreApellido: '',
    edad: 30,
    dni: '',
    jornal: 40000,
    observacion: '',
    activo: true,
    archivos: [],
  });

  // Drawer / Detail modal for viewing full legajo
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);

  // File upload temporary state inside modal or drawer
  const [newFileNote, setNewFileNote] = useState('');

  // Filtered staff
  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.nombreApellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.observacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && s.activo) || 
      (filterStatus === 'inactive' && !s.activo);
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalStaffCount = staff.length;
  const activeStaffCount = staff.filter(s => s.activo).length;
  const totalDailyPayroll = staff.filter(s => s.activo).reduce((acc, s) => acc + (Number(s.jornal) || 0), 0);
  const avgJornal = activeStaffCount > 0 ? Math.round(totalDailyPayroll / activeStaffCount) : 0;
  const totalAttachedFiles = staff.reduce((acc, s) => acc + (s.archivos?.length || 0), 0);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingStaff(null);
    setStaffForm({
      nombreApellido: '',
      edad: 32,
      dni: '',
      jornal: 42000,
      observacion: '',
      activo: true,
      archivos: [],
    });
    setNewFileNote('');
    setIsStaffModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffForm({ 
      ...member,
      archivos: [...(member.archivos || [])]
    });
    setNewFileNote('');
    setIsStaffModalOpen(true);
  };

  const handleFileUploadToForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: StaffAttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          date: new Date().toISOString().split('T')[0],
          dataUrl: reader.result as string,
        };

        setStaffForm(prev => ({
          ...prev,
          archivos: [...(prev.archivos || []), newAttachment]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFileFromForm = (fileId: string) => {
    setStaffForm(prev => ({
      ...prev,
      archivos: (prev.archivos || []).filter(f => f.id !== fileId)
    }));
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.nombreApellido?.trim() || !staffForm.dni?.trim()) return;

    if (editingStaff) {
      const updated: StaffMember = {
        ...editingStaff,
        nombreApellido: staffForm.nombreApellido || '',
        edad: Number(staffForm.edad) || 18,
        dni: staffForm.dni || '',
        jornal: Number(staffForm.jornal) || 0,
        observacion: staffForm.observacion || '',
        activo: staffForm.activo ?? true,
        archivos: staffForm.archivos || [],
      };
      onUpdateStaff(staff.map(s => s.id === editingStaff.id ? updated : s));
      if (viewingStaff?.id === editingStaff.id) {
        setViewingStaff(updated);
      }
    } else {
      const newMember: StaffMember = {
        id: `stf-${Date.now()}`,
        nombreApellido: staffForm.nombreApellido || '',
        edad: Number(staffForm.edad) || 18,
        dni: staffForm.dni || '',
        jornal: Number(staffForm.jornal) || 0,
        observacion: staffForm.observacion || '',
        activo: staffForm.activo ?? true,
        createdAt: new Date().toISOString().split('T')[0],
        archivos: staffForm.archivos || [],
      };
      onUpdateStaff([newMember, ...staff]);
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('¿Confirma que desea eliminar este operario/colaborador de la plantilla de personal?')) {
      onUpdateStaff(staff.filter(s => s.id !== id));
      if (viewingStaff?.id === id) {
        setViewingStaff(null);
      }
    }
  };

  // Upload file directly inside Legajo Detail view
  const handleUploadFileToDetail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!viewingStaff) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: StaffAttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          date: new Date().toISOString().split('T')[0],
          dataUrl: reader.result as string,
        };

        const updated: StaffMember = {
          ...viewingStaff,
          archivos: [...(viewingStaff.archivos || []), newAttachment]
        };
        setViewingStaff(updated);
        onUpdateStaff(staff.map(s => s.id === updated.id ? updated : s));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteFileFromDetail = (fileId: string) => {
    if (!viewingStaff) return;
    const updated: StaffMember = {
      ...viewingStaff,
      archivos: (viewingStaff.archivos || []).filter(f => f.id !== fileId)
    };
    setViewingStaff(updated);
    onUpdateStaff(staff.map(s => s.id === updated.id ? updated : s));
  };

  // Helper file icon
  const getFileIcon = (name: string, type: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-500 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '') || type.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />;
    }
    return <Paperclip className="w-5 h-5 text-slate-500 shrink-0" />;
  };

  // Download attached file
  const handleDownloadFile = (file: StaffAttachedFile) => {
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Mock dummy download
      const blob = new Blob([`Contenido del archivo: ${file.name}\nFecha de carga: ${file.date}`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Nombre y Apellido', 'Edad', 'DNI', 'Jornal Diario ($)', 'Archivos Adjuntos', 'Estado', 'Observación'];
    const rows = filteredStaff.map(s => [
      `"${s.nombreApellido.replace(/"/g, '""')}"`,
      s.edad,
      `"${s.dni}"`,
      s.jornal,
      s.archivos?.length || 0,
      s.activo ? '"ACTIVO"' : '"INACTIVO"',
      `"${(s.observacion || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csv, `HOGACOR_Nomina_Personal_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            <Users className="w-4 h-4" />
            <span>Módulo de Recursos Humanos & Cuadrillas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Nómina de Personal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Legajos digitales de operarios, capataces y colaboradores con control de jornales y documentación adjunta.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Nómina
          </button>

          <button
            onClick={handleOpenAdd}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
              canEdit 
                ? 'bg-teal-700 hover:bg-teal-800 active:scale-95' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            Cargar Personal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Dotación Total</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {totalStaffCount} <span className="text-xs font-medium text-slate-500">operarios</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {activeStaffCount} activos en obras
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Costo Jornal Promedio</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono-numbers">
            {formatCurrency(avgJornal)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Por jornada diaria de 8 hs
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Nómina Diaria Activa</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {formatCurrency(totalDailyPayroll)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Monto diario de cuadrillas
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Documentos Digitales</span>
            <Paperclip className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono-numbers">
            {totalAttachedFiles}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Archivos y legajos adjuntos
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI u observación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Todos ({staff.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'active' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Activos ({activeStaffCount})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'inactive' ? 'bg-white text-slate-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Inactivos ({staff.length - activeStaffCount})
            </button>
          </div>

          {!canEdit && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Modo consulta</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Operario / Colaborador</th>
                <th className="py-3 px-4 text-center">Edad</th>
                <th className="py-3 px-4">DNI</th>
                <th className="py-3 px-4 text-right">Jornal Diario</th>
                <th className="py-3 px-4">Observación / Perfil</th>
                <th className="py-3 px-4 text-center">Archivos Adjuntos</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontró personal cargado con los criterios ingresados.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black flex items-center justify-center text-xs shrink-0">
                          {member.nombreApellido.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{member.nombreApellido}</div>
                          <div className="text-[11px] text-slate-400 font-normal">Alta: {member.createdAt || '2025'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-numbers text-slate-700">
                      {member.edad} <span className="text-[10px] text-slate-400">años</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono-numbers font-semibold text-slate-800">
                      {member.dni}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-numbers font-black text-teal-700 text-sm">
                      {formatCurrency(member.jornal)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={member.observacion}>
                      {member.observacion || <span className="text-slate-400 italic">Sin observaciones</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setViewingStaff(member)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          (member.archivos?.length || 0) > 0
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="Ver archivos adjuntos"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{member.archivos?.length || 0} archivos</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        member.activo
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {member.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingStaff(member)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Ver Ficha y Legajo Completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Editar operario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar operario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Cargar / Editar Personal */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingStaff ? 'Editar Ficha de Personal' : 'Cargar Nuevo Personal'}
                    </h3>
                    <p className="text-xs text-slate-500">Datos filiatorios, remuneración y documentación digital</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsStaffModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Carlos Ramos, Martín Benítez"
                    value={staffForm.nombreApellido || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, nombreApellido: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Edad *
                    </label>
                    <input
                      type="number"
                      required
                      min={18}
                      max={80}
                      value={staffForm.edad || ''}
                      onChange={(e) => setStaffForm({ ...staffForm, edad: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      DNI / Documento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 34.521.890"
                      value={staffForm.dni || ''}
                      onChange={(e) => setStaffForm({ ...staffForm, dni: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jornal Diario ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={staffForm.jornal || ''}
                      onChange={(e) => setStaffForm({ ...staffForm, jornal: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campo de Observación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Especialidad (oficial albañil, electricista, ayudante), certificaciones, aptitud médica, asignaciones..."
                    value={staffForm.observacion || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, observacion: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Adjuntar Archivos section */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                      <span>Adjuntar Archivos (Imágenes, PDF, Planillas Excel)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {staffForm.archivos?.length || 0} cargados
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors">
                      <FileUp className="w-3.5 h-3.5 text-teal-600" />
                      <span>Seleccionar archivos desde la PC</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                        onChange={handleFileUploadToForm}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Soporta DNI digitalizado, constancia de ART, apto médico, certificados y planillas
                    </p>
                  </div>

                  {/* List of currently attached files in form */}
                  {staffForm.archivos && staffForm.archivos.length > 0 && (
                    <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {staffForm.archivos.map(file => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {getFileIcon(file.name, file.type)}
                            <span className="truncate font-medium text-slate-800">{file.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono-numbers">
                              ({(file.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFileFromForm(file.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Quitar archivo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(staffForm.activo)}
                      onChange={(e) => setStaffForm({ ...staffForm, activo: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-700">Operario en servicio activo</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsStaffModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
                    >
                      {editingStaff ? 'Guardar Cambios' : 'Registrar Personal'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL / DRAWER: Ficha de Legajo Completo del Colaborador */}
      <AnimatePresence>
        {viewingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black flex items-center justify-center text-lg shadow-sm">
                    {viewingStaff.nombreApellido.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {viewingStaff.nombreApellido}
                    </h2>
                    <p className="text-xs text-slate-500">
                      DNI: <span className="font-mono-numbers font-semibold text-slate-700">{viewingStaff.dni}</span> · {viewingStaff.edad} años
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingStaff(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Jornal Diario</span>
                  <span className="text-base font-black text-teal-700 font-mono-numbers">
                    {formatCurrency(viewingStaff.jornal)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Estado Laboral</span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                    viewingStaff.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {viewingStaff.activo ? 'En Cuadrilla Activa' : 'Inactivo / Licencia'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Legajo Digital</span>
                  <span className="text-base font-black text-slate-800 font-mono-numbers">
                    {viewingStaff.archivos?.length || 0} docs
                  </span>
                </div>
              </div>

              {/* Observation / Speciality */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observaciones & Especialidad Técnica
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {viewingStaff.observacion || 'Sin observaciones registradas para este operario.'}
                </p>
              </div>

              {/* Attached Files Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-teal-600" />
                    <span>Archivos Adjuntos al Legajo ({viewingStaff.archivos?.length || 0})</span>
                  </h4>

                  {canEdit && (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors border border-teal-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Nuevo Archivo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                        onChange={handleUploadFileToDetail}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {(!viewingStaff.archivos || viewingStaff.archivos.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No hay archivos adjuntos en el legajo de {viewingStaff.nombreApellido}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {viewingStaff.archivos.map(file => (
                      <div 
                        key={file.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-between gap-2 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getFileIcon(file.name, file.type)}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                              {file.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {file.date} · {(file.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Descargar archivo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteFileFromDetail(file.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar archivo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100">
                {canEdit ? (
                  <button
                    onClick={() => {
                      const toEdit = viewingStaff;
                      setViewingStaff(null);
                      handleOpenEdit(toEdit);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Datos del Operario</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => setViewingStaff(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
                >
                  Cerrar Ficha
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
