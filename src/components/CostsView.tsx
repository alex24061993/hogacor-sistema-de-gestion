import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Download, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Landmark, 
  FileText,
  Percent,
  Layers,
  Info
} from 'lucide-react';
import { CostItem, CostCategory, User } from '../types';
import { formatCurrency } from '../utils/storage';
import { downloadCSV } from '../utils/exportUtils';

interface CostsViewProps {
  currentUser: User;
  costs: CostItem[];
  onUpdateCosts: (costs: CostItem[]) => void;
}

export const CostsView: React.FC<CostsViewProps> = ({
  currentUser,
  costs,
  onUpdateCosts,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canEdit = isSuperAdmin || Boolean(currentUser.permissions?.costos?.canEdit);
  const canDelete = isSuperAdmin || Boolean(currentUser.permissions?.costos?.canDelete);

  const [activeCategory, setActiveCategory] = useState<CostCategory | 'todas'>('todas');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);
  const [costForm, setCostForm] = useState<Partial<CostItem>>({
    categoria: 'servicios',
    concepto: '',
    empresa: '',
    monto: 0,
    vencimiento: new Date().toISOString().split('T')[0],
    recargo: 0,
    pagado: false,
    observacion: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to test if overdue
  const isOverdue = (cost: CostItem) => {
    return !cost.pagado && cost.vencimiento < todayStr;
  };

  const isDueSoon = (cost: CostItem) => {
    if (cost.pagado) return false;
    const diffDays = Math.ceil((new Date(cost.vencimiento).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 5;
  };

  // Filtered costs
  const filteredCosts = costs.filter(c => {
    const matchesCategory = activeCategory === 'todas' || c.categoria === activeCategory;
    const matchesSearch = 
      c.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.observacion || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = !c.pagado && !isOverdue(c);
    } else if (filterStatus === 'paid') {
      matchesStatus = c.pagado;
    } else if (filterStatus === 'overdue') {
      matchesStatus = isOverdue(c);
    }

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalMonto = costs.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const totalPagado = costs.filter(c => c.pagado).reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const totalPendiente = costs.filter(c => !c.pagado).reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const totalRecargos = costs.filter(c => !c.pagado).reduce((acc, c) => acc + (Number(c.recargo) || 0), 0);
  const overdueCount = costs.filter(isOverdue).length;

  // Handlers
  const handleOpenAdd = (preselectedCategory?: CostCategory) => {
    setEditingCost(null);
    setCostForm({
      categoria: preselectedCategory || (activeCategory !== 'todas' ? activeCategory : 'servicios'),
      concepto: '',
      empresa: '',
      monto: 0,
      vencimiento: new Date().toISOString().split('T')[0],
      recargo: 0,
      pagado: false,
      observacion: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cost: CostItem) => {
    setEditingCost(cost);
    setCostForm({ ...cost });
    setIsModalOpen(true);
  };

  const handleSaveCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costForm.empresa?.trim() || !costForm.concepto?.trim() || !costForm.vencimiento) return;

    if (editingCost) {
      onUpdateCosts(costs.map(c => c.id === editingCost.id ? {
        ...editingCost,
        categoria: costForm.categoria || 'servicios',
        concepto: costForm.concepto || '',
        empresa: costForm.empresa || '',
        monto: Number(costForm.monto) || 0,
        vencimiento: costForm.vencimiento || todayStr,
        recargo: Number(costForm.recargo) || 0,
        pagado: Boolean(costForm.pagado),
        fechaPago: costForm.pagado ? (costForm.fechaPago || todayStr) : undefined,
        observacion: costForm.observacion || '',
      } : c));
    } else {
      const newCost: CostItem = {
        id: `cost-${Date.now()}`,
        categoria: costForm.categoria || 'servicios',
        concepto: costForm.concepto || '',
        empresa: costForm.empresa || '',
        monto: Number(costForm.monto) || 0,
        vencimiento: costForm.vencimiento || todayStr,
        recargo: Number(costForm.recargo) || 0,
        pagado: Boolean(costForm.pagado),
        fechaPago: costForm.pagado ? todayStr : undefined,
        observacion: costForm.observacion || '',
      };
      onUpdateCosts([newCost, ...costs]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('¿Confirma que desea eliminar este registro de costo?')) {
      onUpdateCosts(costs.filter(c => c.id !== id));
    }
  };

  const handleTogglePaid = (cost: CostItem) => {
    if (!canEdit) return;
    const willBePaid = !cost.pagado;
    onUpdateCosts(costs.map(c => c.id === cost.id ? {
      ...c,
      pagado: willBePaid,
      fechaPago: willBePaid ? todayStr : undefined,
    } : c));
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Categoría', 'Empresa', 'Concepto', 'Monto', 'Vencimiento', 'Recargo', 'Estado', 'Fecha de Pago', 'Observación'];
    const rows = filteredCosts.map(c => [
      `"${c.categoria.toUpperCase()}"`,
      `"${c.empresa.replace(/"/g, '""')}"`,
      `"${c.concepto.replace(/"/g, '""')}"`,
      c.monto,
      `"${c.vencimiento}"`,
      c.recargo,
      c.pagado ? '"PAGADO"' : isOverdue(c) ? '"VENCIDO"' : '"PENDIENTE"',
      `"${c.fechaPago || '-'}"`,
      `"${(c.observacion || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csv, `HOGACOR_Costos_${activeCategory}_${todayStr}.csv`);
  };

  const getCategoryBadge = (cat: CostCategory) => {
    switch (cat) {
      case 'servicios':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Servicios</span>;
      case 'impuestos':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Impuestos</span>;
      case 'alquileres':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Alquileres</span>;
      case 'otros':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">Otros</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Módulo de Control de Egresos & Obligaciones</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Costos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Seguimiento de Servicios, Impuestos fiscales, Alquileres operativos y Otros egresos con control de vencimiento y recargos.
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

          <button
            onClick={() => handleOpenAdd()}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
              canEdit 
                ? 'bg-teal-700 hover:bg-teal-800 active:scale-95' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            Cargar Costo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Obligaciones</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {formatCurrency(totalMonto)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {costs.length} registros cargados
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pendiente de Pago</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono-numbers">
            {formatCurrency(totalPendiente)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Por regularizar
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pagado / Cancelado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono-numbers">
            {formatCurrency(totalPagado)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Comprobantes al día
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Vencidos / Recargos</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono-numbers">
            {overdueCount} <span className="text-xs font-normal text-slate-500">({formatCurrency(totalRecargos)} recargo)</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Obligaciones fuera de término
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation (Servicios, Impuestos, Alquileres, Otros) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('todas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'todas'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos los Costos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-numbers ${
              activeCategory === 'todas' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {costs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('servicios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'servicios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Servicios</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-numbers ${
              activeCategory === 'servicios' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {costs.filter(c => c.categoria === 'servicios').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('impuestos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'impuestos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Impuestos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-numbers ${
              activeCategory === 'impuestos' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {costs.filter(c => c.categoria === 'impuestos').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('alquileres')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'alquileres'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Alquileres</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-numbers ${
              activeCategory === 'alquileres' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {costs.filter(c => c.categoria === 'alquileres').length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('otros')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'otros'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Otros</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-numbers ${
              activeCategory === 'otros' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {costs.filter(c => c.categoria === 'otros').length}
            </span>
          </button>
        </div>

        {!canEdit && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shrink-0">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Permiso de solo lectura en Costos</span>
          </div>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa, concepto u observación..."
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium">Estado:</span>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'overdue' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Vencidos ({overdueCount})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'paid' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Pagados
            </button>
          </div>
        </div>
      </div>

      {/* Main Costs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Empresa / Entidad</th>
                <th className="py-3 px-4">Concepto del Costo</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Vencimiento</th>
                <th className="py-3 px-4 text-right">Recargo</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron costos cargados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCosts.map((cost) => {
                  const overdue = isOverdue(cost);
                  const soon = isDueSoon(cost);

                  return (
                    <tr 
                      key={cost.id} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        overdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getCategoryBadge(cost.categoria)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {cost.empresa}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={cost.concepto}>
                        <div className="font-semibold text-slate-900">{cost.concepto}</div>
                        {cost.observacion && (
                          <div className="text-[11px] text-slate-400 truncate">{cost.observacion}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono-numbers font-black text-slate-900 text-sm whitespace-nowrap">
                        {formatCurrency(cost.monto)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono-numbers">
                        <div className="flex flex-col items-center">
                          <span className={`font-semibold ${
                            overdue ? 'text-rose-600' : soon ? 'text-amber-600' : 'text-slate-700'
                          }`}>
                            {cost.vencimiento}
                          </span>
                          {overdue && (
                            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">
                              Vencido
                            </span>
                          )}
                          {soon && (
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tight">
                              Por vencer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono-numbers">
                        {cost.recargo > 0 ? (
                          <span className="text-rose-600 font-bold">
                            +{formatCurrency(cost.recargo)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePaid(cost)}
                          disabled={!canEdit}
                          title={cost.pagado ? "Marcar como pendiente" : "Marcar como pagado"}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            cost.pagado
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : overdue
                              ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300 animate-pulse'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                          } ${!canEdit ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                        >
                          {cost.pagado ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Pagado</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendiente</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(cost)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Editar costo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteCost(cost.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar costo"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nuevo / Editar Costo */}
      <AnimatePresence>
        {isModalOpen && (
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
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingCost ? 'Editar Registro de Costo' : 'Cargar Nuevo Costo'}
                    </h3>
                    <p className="text-xs text-slate-500">Servicios, Impuestos, Alquileres u Otros</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCost} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría del Costo *
                  </label>
                  <select
                    value={costForm.categoria || 'servicios'}
                    onChange={(e) => setCostForm({ ...costForm, categoria: e.target.value as CostCategory })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="servicios">Servicios (Electricidad, Agua, Gas, Conectividad)</option>
                    <option value="impuestos">Impuestos (AFIP/ARCA, ARBA, Tasas Municipales, Sellados)</option>
                    <option value="alquileres">Alquileres (Galpones, Maquinaria, Andamios, Predios)</option>
                    <option value="otros">Otros (Seguros ART, Caución, Gestoría, Profesionales)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Empresa / Entidad *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Edenor, AFIP, Delta Inmobiliaria, Prevención ART"
                      value={costForm.empresa || ''}
                      onChange={(e) => setCostForm({ ...costForm, empresa: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Concepto o Detalle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Suministro eléctrico obrador, Anticipo IIBB"
                      value={costForm.concepto || ''}
                      onChange={(e) => setCostForm({ ...costForm, concepto: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Monto ($ ARS) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={costForm.monto || ''}
                      onChange={(e) => setCostForm({ ...costForm, monto: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vencimiento *
                    </label>
                    <input
                      type="date"
                      required
                      value={costForm.vencimiento || todayStr}
                      onChange={(e) => setCostForm({ ...costForm, vencimiento: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recargo por Mora ($ ARS)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={costForm.recargo ?? 0}
                      onChange={(e) => setCostForm({ ...costForm, recargo: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono-numbers"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(costForm.pagado)}
                        onChange={(e) => setCostForm({ ...costForm, pagado: e.target.checked })}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-800">¿Ya está Pagado?</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observaciones / Datos del Comprobante
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Número de factura o VEP, método de pago, cuenta bancaria u observaciones..."
                    value={costForm.observacion || ''}
                    onChange={(e) => setCostForm({ ...costForm, observacion: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
                  >
                    {editingCost ? 'Guardar Cambios' : 'Registrar Costo'}
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
