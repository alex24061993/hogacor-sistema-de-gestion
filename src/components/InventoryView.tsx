import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Download, 
  ShieldAlert,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { InventoryToolItem, InventorySupplyItem, User } from '../types';
import { downloadCSV } from '../utils/exportUtils';

interface InventoryViewProps {
  currentUser: User;
  tools: InventoryToolItem[];
  supplies: InventorySupplyItem[];
  onUpdateTools: (tools: InventoryToolItem[]) => void;
  onUpdateSupplies: (supplies: InventorySupplyItem[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  currentUser,
  tools,
  supplies,
  onUpdateTools,
  onUpdateSupplies,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canEdit = isSuperAdmin || Boolean(currentUser.permissions?.inventario?.canEdit);
  const canDelete = isSuperAdmin || Boolean(currentUser.permissions?.inventario?.canDelete);

  const [activeTab, setActiveTab] = useState<'herramientas' | 'insumos'>('herramientas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  // Modal states
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<InventoryToolItem | null>(null);
  const [toolForm, setToolForm] = useState<Partial<InventoryToolItem>>({
    nombre: '',
    tipo: 'Eléctrica',
    marca: '',
    cantidad: 1,
    estado: 'Buen estado',
    observacion: '',
  });

  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<InventorySupplyItem | null>(null);
  const [supplyForm, setSupplyForm] = useState<Partial<InventorySupplyItem>>({
    nombre: '',
    tipo: 'Fijaciones',
    marca: '',
    cantidad: 10,
    unidad: 'un',
    observacion: '',
  });

  // Unique types for filters
  const toolTypes = Array.from(new Set(tools.map(t => t.tipo))).filter(Boolean);
  const supplyTypes = Array.from(new Set(supplies.map(s => s.tipo))).filter(Boolean);

  // Filtered tools
  const filteredTools = tools.filter(t => {
    const matchesSearch = 
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.observacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || t.tipo === filterTipo;
    const matchesEstado = filterEstado === 'all' || t.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Filtered supplies
  const filteredSupplies = supplies.filter(s => {
    const matchesSearch = 
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.observacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || s.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  // KPI metrics
  const totalToolsCount = tools.reduce((acc, t) => acc + (Number(t.cantidad) || 0), 0);
  const toolsInRepair = tools.filter(t => t.estado === 'En reparación' || t.estado === 'Regular').length;
  const totalSuppliesUnits = supplies.reduce((acc, s) => acc + (Number(s.cantidad) || 0), 0);
  const lowStockSupplies = supplies.filter(s => s.cantidad < 20).length;

  // Handlers for Tool Modal
  const handleOpenAddTool = () => {
    setEditingTool(null);
    setToolForm({
      nombre: '',
      tipo: 'Eléctrica',
      marca: '',
      cantidad: 1,
      estado: 'Buen estado',
      observacion: '',
    });
    setIsToolModalOpen(true);
  };

  const handleOpenEditTool = (tool: InventoryToolItem) => {
    setEditingTool(tool);
    setToolForm({ ...tool });
    setIsToolModalOpen(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.nombre?.trim() || !toolForm.marca?.trim()) return;

    if (editingTool) {
      onUpdateTools(tools.map(t => t.id === editingTool.id ? {
        ...editingTool,
        nombre: toolForm.nombre || '',
        tipo: toolForm.tipo || 'General',
        marca: toolForm.marca || '',
        cantidad: Number(toolForm.cantidad) || 1,
        estado: toolForm.estado as any || 'Buen estado',
        observacion: toolForm.observacion || '',
      } : t));
    } else {
      const newTool: InventoryToolItem = {
        id: `tool-${Date.now()}`,
        nombre: toolForm.nombre || '',
        tipo: toolForm.tipo || 'General',
        marca: toolForm.marca || '',
        cantidad: Number(toolForm.cantidad) || 1,
        estado: (toolForm.estado as any) || 'Buen estado',
        observacion: toolForm.observacion || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdateTools([newTool, ...tools]);
    }
    setIsToolModalOpen(false);
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('¿Confirma que desea eliminar esta herramienta del inventario?')) {
      onUpdateTools(tools.filter(t => t.id !== id));
    }
  };

  const handleQuickAdjustToolQty = (id: string, delta: number) => {
    if (!canEdit) return;
    onUpdateTools(tools.map(t => {
      if (t.id === id) {
        const newQty = Math.max(0, (t.cantidad || 0) + delta);
        return { ...t, cantidad: newQty };
      }
      return t;
    }));
  };

  // Handlers for Supply Modal
  const handleOpenAddSupply = () => {
    setEditingSupply(null);
    setSupplyForm({
      nombre: '',
      tipo: 'Fijaciones',
      marca: '',
      cantidad: 10,
      unidad: 'un',
      observacion: '',
    });
    setIsSupplyModalOpen(true);
  };

  const handleOpenEditSupply = (supply: InventorySupplyItem) => {
    setEditingSupply(supply);
    setSupplyForm({ ...supply });
    setIsSupplyModalOpen(true);
  };

  const handleSaveSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyForm.nombre?.trim() || !supplyForm.marca?.trim()) return;

    if (editingSupply) {
      onUpdateSupplies(supplies.map(s => s.id === editingSupply.id ? {
        ...editingSupply,
        nombre: supplyForm.nombre || '',
        tipo: supplyForm.tipo || 'General',
        marca: supplyForm.marca || '',
        cantidad: Number(supplyForm.cantidad) || 0,
        unidad: supplyForm.unidad || 'un',
        observacion: supplyForm.observacion || '',
      } : s));
    } else {
      const newSupply: InventorySupplyItem = {
        id: `sup-${Date.now()}`,
        nombre: supplyForm.nombre || '',
        tipo: supplyForm.tipo || 'General',
        marca: supplyForm.marca || '',
        cantidad: Number(supplyForm.cantidad) || 0,
        unidad: supplyForm.unidad || 'un',
        observacion: supplyForm.observacion || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdateSupplies([newSupply, ...supplies]);
    }
    setIsSupplyModalOpen(false);
  };

  const handleDeleteSupply = (id: string) => {
    if (confirm('¿Confirma que desea eliminar este insumo del inventario?')) {
      onUpdateSupplies(supplies.filter(s => s.id !== id));
    }
  };

  const handleQuickAdjustSupplyQty = (id: string, delta: number) => {
    if (!canEdit) return;
    onUpdateSupplies(supplies.map(s => {
      if (s.id === id) {
        const newQty = Math.max(0, (s.cantidad || 0) + delta);
        return { ...s, cantidad: newQty };
      }
      return s;
    }));
  };

  // Export CSV
  const handleExportCSV = () => {
    if (activeTab === 'herramientas') {
      const headers = ['Tipo', 'Nombre / Descripción', 'Marca', 'Cantidad', 'Estado', 'Observación'];
      const rows = filteredTools.map(t => [
        `"${t.tipo.replace(/"/g, '""')}"`,
        `"${t.nombre.replace(/"/g, '""')}"`,
        `"${t.marca.replace(/"/g, '""')}"`,
        t.cantidad,
        `"${t.estado.replace(/"/g, '""')}"`,
        `"${(t.observacion || '').replace(/"/g, '""')}"`,
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csv, `HOGACOR_Inventario_Herramientas_${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      const headers = ['Tipo', 'Nombre / Insumo', 'Marca', 'Cantidad', 'Unidad', 'Observación'];
      const rows = filteredSupplies.map(s => [
        `"${s.tipo.replace(/"/g, '""')}"`,
        `"${s.nombre.replace(/"/g, '""')}"`,
        `"${s.marca.replace(/"/g, '""')}"`,
        s.cantidad,
        `"${(s.unidad || 'un').replace(/"/g, '""')}"`,
        `"${(s.observacion || '').replace(/"/g, '""')}"`,
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      downloadCSV(csv, `HOGACOR_Inventario_Insumos_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Nueva':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Nueva</span>;
      case 'Buen estado':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">Buen estado</span>;
      case 'Regular':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Regular</span>;
      case 'En reparación':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">En reparación</span>;
      case 'Baja':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Baja / Descarte</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            <Layers className="w-4 h-4" />
            <span>Módulo de Logística & Pañol Central</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventario de Obras
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Control de existencia, parque de herramientas, insumos consumibles y estados operativos.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          {activeTab === 'herramientas' ? (
            <button
              onClick={handleOpenAddTool}
              disabled={!canEdit}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                canEdit 
                  ? 'bg-teal-700 hover:bg-teal-800 active:scale-95' 
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Nueva Herramienta
            </button>
          ) : (
            <button
              onClick={handleOpenAddSupply}
              disabled={!canEdit}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                canEdit 
                  ? 'bg-teal-700 hover:bg-teal-800 active:scale-95' 
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Nuevo Insumo
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Herramientas Registradas</span>
            <Wrench className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {tools.length} <span className="text-xs font-medium text-slate-500">modelos</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalToolsCount} unidades físicas totales
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Atención / Taller</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono-numbers">
            {toolsInRepair}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            En reparación o estado regular
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Insumos en Pañol</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {supplies.length} <span className="text-xs font-medium text-slate-500">ítems</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalSuppliesUnits.toLocaleString()} unidades/kg en stock
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Stock Crítico</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono-numbers">
            {lowStockSupplies}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Insumos con menos de 20 un.
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('herramientas'); setFilterTipo('all'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'herramientas'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Herramientas</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono-numbers ${
              activeTab === 'herramientas' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tools.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('insumos'); setFilterTipo('all'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'insumos'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Insumos</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono-numbers ${
              activeTab === 'insumos' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {supplies.length}
            </span>
          </button>
        </div>

        {!canEdit && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Modo visualización (sin permisos de edición en Inventario)</span>
          </div>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'herramientas' ? "Buscar por herramienta, marca o tipo..." : "Buscar insumo, marca o tipo..."}
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

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Tipo:</span>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todos los tipos</option>
              {(activeTab === 'herramientas' ? toolTypes : supplyTypes).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {activeTab === 'herramientas' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Estado:</span>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Todos los estados</option>
                <option value="Nueva">Nueva</option>
                <option value="Buen estado">Buen estado</option>
                <option value="Regular">Regular</option>
                <option value="En reparación">En reparación</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* HERRAMIENTAS TAB */}
      {activeTab === 'herramientas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Herramienta / Equipo</th>
                  <th className="py-3 px-4">Marca</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Observación</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No se encontraron herramientas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          {tool.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tool.nombre}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-teal-700 whitespace-nowrap">
                        {tool.marca}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          {canEdit && (
                            <button
                              onClick={() => handleQuickAdjustToolQty(tool.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold"
                              title="Restar 1"
                            >
                              -
                            </button>
                          )}
                          <span className="font-mono-numbers font-bold text-slate-900 px-1 text-sm">
                            {tool.cantidad}
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => handleQuickAdjustToolQty(tool.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold"
                              title="Sumar 1"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getEstadoBadge(tool.estado)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={tool.observacion}>
                        {tool.observacion || <span className="text-slate-400 italic">Sin observaciones</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEditTool(tool)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Editar herramienta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteTool(tool.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar herramienta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="text-slate-400 italic text-[11px]">-</span>
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
      )}

      {/* INSUMOS TAB */}
      {activeTab === 'insumos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Insumo / Material</th>
                  <th className="py-3 px-4">Marca</th>
                  <th className="py-3 px-4 text-center">Cantidad en Stock</th>
                  <th className="py-3 px-4">Observación</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSupplies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No se encontraron insumos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredSupplies.map((supply) => (
                    <tr key={supply.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          {supply.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {supply.nombre}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-teal-700 whitespace-nowrap">
                        {supply.marca}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          {canEdit && (
                            <button
                              onClick={() => handleQuickAdjustSupplyQty(supply.id, -5)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold"
                              title="Restar 5"
                            >
                              -
                            </button>
                          )}
                          <span className={`font-mono-numbers font-bold px-1 text-sm ${
                            supply.cantidad < 20 ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {supply.cantidad.toLocaleString()} <span className="text-xs font-normal text-slate-500">{supply.unidad || 'un'}</span>
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => handleQuickAdjustSupplyQty(supply.id, 5)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold"
                              title="Sumar 5"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={supply.observacion}>
                        {supply.observacion || <span className="text-slate-400 italic">Sin observaciones</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEditSupply(supply)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Editar insumo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteSupply(supply.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar insumo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="text-slate-400 italic text-[11px]">-</span>
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
      )}

      {/* MODAL: Nueva / Editar Herramienta */}
      <AnimatePresence>
        {isToolModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingTool ? 'Editar Herramienta' : 'Cargar Nueva Herramienta'}
                    </h3>
                    <p className="text-xs text-slate-500">Parque de maquinaria e instrumentos de obra</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsToolModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTool} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre o Modelo de la Herramienta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Amoladora Angular 7, Rotomartillo SDS, Nivel Láser"
                    value={toolForm.nombre || ''}
                    onChange={(e) => setToolForm({ ...toolForm, nombre: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Herramienta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Eléctrica, Manual, Batería, Pesada, Medición"
                      value={toolForm.tipo || ''}
                      onChange={(e) => setToolForm({ ...toolForm, tipo: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Bosch, DeWalt, Makita, Milwaukee, Stihl"
                      value={toolForm.marca || ''}
                      onChange={(e) => setToolForm({ ...toolForm, marca: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={toolForm.cantidad || 1}
                      onChange={(e) => setToolForm({ ...toolForm, cantidad: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estado *
                    </label>
                    <select
                      value={toolForm.estado || 'Buen estado'}
                      onChange={(e) => setToolForm({ ...toolForm, estado: e.target.value as any })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Nueva">Nueva</option>
                      <option value="Buen estado">Buen estado</option>
                      <option value="Regular">Regular</option>
                      <option value="En reparación">En reparación</option>
                      <option value="Baja">Baja / Descarte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campo de Observación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ubicación de almacenamiento, accesorios incluidos, número de serie o historial de services..."
                    value={toolForm.observacion || ''}
                    onChange={(e) => setToolForm({ ...toolForm, observacion: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsToolModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
                  >
                    {editingTool ? 'Guardar Cambios' : 'Registrar Herramienta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Nuevo / Editar Insumo */}
      <AnimatePresence>
        {isSupplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingSupply ? 'Editar Insumo' : 'Cargar Nuevo Insumo'}
                    </h3>
                    <p className="text-xs text-slate-500">Materiales consumibles de obra y pañol</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSupplyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSupply} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Insumo / Material *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tornillos T1 Punta Mecha 8x1/2, Discos de corte 115mm, Electrodos 6013"
                    value={supplyForm.nombre || ''}
                    onChange={(e) => setSupplyForm({ ...supplyForm, nombre: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Insumo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Fijaciones, Abrasivos, Soldadura, Selladores, EPP"
                      value={supplyForm.tipo || ''}
                      onChange={(e) => setSupplyForm({ ...supplyForm, tipo: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Fischer, Norton, Sika, Conarco, Sinteplast"
                      value={supplyForm.marca || ''}
                      onChange={(e) => setSupplyForm({ ...supplyForm, marca: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cantidad en Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={supplyForm.cantidad || 0}
                      onChange={(e) => setSupplyForm({ ...supplyForm, cantidad: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Unidad de Medida
                    </label>
                    <select
                      value={supplyForm.unidad || 'un'}
                      onChange={(e) => setSupplyForm({ ...supplyForm, unidad: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="un">Unidades (un)</option>
                      <option value="cajas">Cajas</option>
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="m">Metros (m)</option>
                      <option value="lts">Litros (lts)</option>
                      <option value="pares">Pares</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campo de Observación
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalle de uso, advertencias de seguridad, fecha de vencimiento o proveedor..."
                    value={supplyForm.observacion || ''}
                    onChange={(e) => setSupplyForm({ ...supplyForm, observacion: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSupplyModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
                  >
                    {editingSupply ? 'Guardar Cambios' : 'Registrar Insumo'}
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
