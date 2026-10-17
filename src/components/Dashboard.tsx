import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  X,
  TrendingUp, 
  DollarSign, 
  Building, 
  Users, 
  AlertCircle, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Truck, 
  ShieldAlert, 
  FileText,
  Clock,
  ArrowRight,
  Calculator,
  Database
} from 'lucide-react';
import { Project, ActivityLog, WidgetConfig, SystemNotification, User } from '../types';
import { calculateProjectStats, formatCurrency, formatCompactNumber } from '../utils/storage';
import { DEFAULT_WIDGET_CONFIGS } from '../utils/mockData';
import { CALCULATORS_LIST } from './CalculatorsView';

interface DashboardProps {
  currentUser: User;
  projects: Project[];
  logs: ActivityLog[];
  notifications: SystemNotification[];
  widgetConfigs: WidgetConfig[];
  onUpdateWidgetConfigs: (configs: WidgetConfig[]) => void;
  onNavigateTo: (module: string, projectId?: string) => void;
  onSimulateEvent: () => void;
  onOpenBackupModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  projects,
  logs,
  notifications,
  widgetConfigs,
  onUpdateWidgetConfigs,
  onNavigateTo,
  onSimulateEvent,
  onOpenBackupModal,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [localConfigs, setLocalConfigs] = useState<WidgetConfig[]>(widgetConfigs);

  // Sync local configs when props change
  React.useEffect(() => {
    setLocalConfigs(widgetConfigs);
  }, [widgetConfigs]);

  // Aggregate stats across all projects
  const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const projectStats = projects.map(p => calculateProjectStats(p));
  const totalCost = projectStats.reduce((acc, s) => acc + s.totalCost, 0);
  const totalIncome = projectStats.reduce((acc, s) => acc + s.incomeTotal, 0);
  const totalBalance = totalIncome - totalCost;
  const overallExecutionRatio = totalBudget > 0 ? (totalCost / totalBudget) * 100 : 0;
  const activeProjectsCount = projects.filter(p => p.status === 'En curso').length;
  
  // Total workers across projects
  const totalWorkers = projects.reduce((acc, p) => acc + (p.employees?.length || 0), 0);
  const totalVehicles = projects.reduce((acc, p) => acc + (p.vehicles?.length || 0), 0);

  // Consolidated expense categories
  const categoryTotals: Record<string, number> = {};
  projectStats.forEach(s => {
    Object.entries(s.categoryBreakdown).forEach(([cat, amount]) => {
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
    });
  });

  const sortedCategories = Object.entries(categoryTotals)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);

  const maxCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  // Widget management handlers
  const handleToggleVisible = (id: string) => {
    setLocalConfigs(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleToggleWidth = (id: string) => {
    setLocalConfigs(prev =>
      prev.map(w => (w.id === id ? { ...w, width: w.width === 'half' ? 'full' : 'half' } : w))
    );
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localConfigs.length) return;

    const newArr = [...localConfigs];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // re-assign order numbers
    const updated = newArr.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLocalConfigs(updated);
  };

  const handleSaveConfigs = () => {
    onUpdateWidgetConfigs(localConfigs);
    setIsCustomizing(false);
  };

  const handleResetDefaults = () => {
    setLocalConfigs(DEFAULT_WIDGET_CONFIGS);
  };

  // Sort active visible configs
  const sortedVisibleWidgets = [...widgetConfigs]
    .sort((a, b) => a.order - b.order)
    .filter(w => w.visible);

  return (
    <div className="space-y-6">
      {/* Welcome & Customization Bar with Construction Motif */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👷</span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Bienvenido, {currentUser.name}
            </h1>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              {currentUser.roleTitle}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tablero ejecutivo con métricas de obras, supervisión financiera y registro de actividad en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenBackupModal && (
            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200 shadow-sm hover:scale-[1.02]"
              title="Copia de Seguridad y Respaldo de Datos (Backup JSON)"
            >
              <Database className="w-3.5 h-3.5 text-red-700" />
              Backup Data (.JSON)
            </button>
          )}

          <button
            onClick={() => setIsCustomizing(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 shadow-sm"
            title="Personalizar, reordenar y organizar widgets"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-600" />
            Personalizar Widgets ({sortedVisibleWidgets.length}/{widgetConfigs.length})
          </button>
        </div>
      </div>

      {/* 3 Modular Cards (Matching "dashboard estilo rodo.jpg" YouTube/Instagram/Facebook style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Obras */}
        <div 
          onClick={() => onNavigateTo('obras')}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-red-600" />
              Obras & Proyectos
            </span>
            <span className="text-slate-300 group-hover:text-red-600 transition-colors">···</span>
          </div>

          <div className="py-6 text-center">
            <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight block font-mono-numbers">
              {projects.length}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1 block">
              Obras Registradas
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold uppercase">PLANIF.</span>
              <strong className="text-slate-800 text-xs font-mono">{projects.filter(p => p.status === 'Planificada').length}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase">EN CURSO</span>
              <strong className="text-red-700 text-xs font-mono">{projects.filter(p => p.status === 'En curso').length}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase">FINALIZ.</span>
              <strong className="text-emerald-700 text-xs font-mono">{projects.filter(p => p.status === 'Terminada').length}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Pañol & Inventario */}
        <div 
          onClick={() => onNavigateTo('inventario')}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-600" />
              Pañol & Inventario
            </span>
            <span className="text-slate-300 group-hover:text-slate-700 transition-colors">···</span>
          </div>

          <div className="py-6 text-center">
            <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight block font-mono-numbers">
              0
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1 block">
              Herramientas & Insumos
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold uppercase">EN PAÑOL</span>
              <strong className="text-slate-800 text-xs font-mono">0</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase">EN OBRA</span>
              <strong className="text-slate-800 text-xs font-mono">0</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase">MANTEN.</span>
              <strong className="text-slate-800 text-xs font-mono">0</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Calculadoras CIRSOC */}
        <div 
          onClick={() => onNavigateTo('calculos')}
          className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group border-t-4 border-t-red-600"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-red-600" />
              Cálculos Estructurales
            </span>
            <span className="text-slate-300 group-hover:text-red-600 transition-colors">···</span>
          </div>

          <div className="py-6 text-center">
            <span className="text-4xl md:text-5xl font-black text-red-700 tracking-tight block font-mono-numbers">
              13
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1 block">
              Calculadoras CIRSOC / INTI
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold uppercase">STEEL FRAME</span>
              <strong className="text-slate-800 text-xs font-mono">5</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase">FUNDACIONES</span>
              <strong className="text-slate-800 text-xs font-mono">4</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase">CARGAS</span>
              <strong className="text-slate-800 text-xs font-mono">4</strong>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER WIDGETS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {sortedVisibleWidgets.map(widget => {
          const isFullWidth = widget.width === 'full';
          const containerClass = isFullWidth ? 'lg:col-span-2' : 'col-span-1';

          return (
            <motion.div
              key={widget.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`${containerClass} bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-hidden flex flex-col`}
            >
              {/* Widget Title Header */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {widget.title}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {widget.description}
                </span>
              </div>

              {/* WIDGET CONTENT BASED ON ID */}
              {widget.id === 'kpi_summary' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Presupuesto Total
                    </div>
                    <div className="text-xl md:text-2xl font-black text-slate-900 mt-1 font-mono-numbers">
                      {formatCurrency(totalBudget)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {projects.length} obras registradas
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                    <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                      Cobrado del Cliente
                    </div>
                    <div className="text-xl md:text-2xl font-black text-teal-800 mt-1 font-mono-numbers">
                      {formatCurrency(totalIncome)}
                    </div>
                    <div className="text-xs text-teal-600 mt-1">
                      Saldo a cobrar: {formatCurrency(Math.max(0, totalBudget - totalIncome))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100">
                    <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                      Costos Ejecutados
                    </div>
                    <div className="text-xl md:text-2xl font-black text-rose-800 mt-1 font-mono-numbers">
                      {formatCurrency(totalCost)}
                    </div>
                    <div className="text-xs text-rose-600 mt-1">
                      {Math.round(overallExecutionRatio)}% del presupuesto consumido
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                    <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      Margen Operativo
                    </div>
                    <div className={`text-xl md:text-2xl font-black mt-1 font-mono-numbers ${
                      totalBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(totalBalance)}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1 font-medium">
                      {totalBalance >= 0 ? 'Superávit en cobranzas' : 'Déficit transitorio'}
                    </div>
                  </div>
                </div>
              )}

              {widget.id === 'critical_alerts' && (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                        n.severity === 'critical'
                          ? 'bg-red-50/70 border-red-200 text-red-950'
                          : n.severity === 'warning'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {n.severity === 'critical' ? (
                          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="text-xs font-bold">{n.title}</h4>
                          <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono-numbers opacity-60 shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {widget.id === 'projects_progress' && (
                <div className="space-y-4">
                  {projects.map(p => {
                    const stats = calculateProjectStats(p);
                    return (
                      <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <button
                              onClick={() => onNavigateTo('obras', p.id)}
                              className="text-xs font-bold text-slate-900 hover:text-teal-700 text-left transition-colors"
                            >
                              {p.name}
                            </button>
                            <div className="text-[11px] text-slate-400">
                              {p.client} · {p.status}
                            </div>
                          </div>
                          <span className="text-xs font-black text-slate-900 font-mono-numbers">
                            {stats.progressPct}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${stats.progressPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono-numbers">
                          <span>Presupuesto: {formatCurrency(p.budget)}</span>
                          <span>Costos: {formatCurrency(stats.totalCost)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {widget.id === 'expenses_distribution' && (
                <div className="space-y-3">
                  {sortedCategories.slice(0, 5).map(([cat, amount]) => {
                    const pctOfTotal = totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <span className="font-mono-numbers text-slate-900 font-bold">
                            {formatCurrency(amount)} ({pctOfTotal}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${(amount / maxCategoryAmount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {widget.id === 'financial_timeline' && (
                <div className="space-y-3">
                  {projects.map(p => {
                    const stats = calculateProjectStats(p);
                    return (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between font-bold text-slate-900 mb-1">
                          <span>{p.name}</span>
                          <span className={stats.operatingBalance >= 0 ? 'text-teal-700' : 'text-red-600'}>
                            Balance: {formatCurrency(stats.operatingBalance)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-numbers text-slate-500">
                          <div>Cobrado: <strong className="text-teal-700">{formatCurrency(stats.incomeTotal)}</strong></div>
                          <div>Costos: <strong className="text-red-700">{formatCurrency(stats.totalCost)}</strong></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {widget.id === 'active_team' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                    <Users className="w-6 h-6 text-teal-700 mx-auto mb-1" />
                    <div className="text-2xl font-black text-slate-900 font-mono-numbers">
                      {totalWorkers}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      Operarios en Terreno
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                    <Truck className="w-6 h-6 text-sky-700 mx-auto mb-1" />
                    <div className="text-2xl font-black text-slate-900 font-mono-numbers">
                      {totalVehicles}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      Vehículos y Equipos
                    </div>
                  </div>
                </div>
              )}

              {widget.id === 'activity_stream' && (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{log.userName}:</span>{' '}
                        <span className="text-slate-600">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono-numbers shrink-0 ml-2">
                        {log.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* SECCIÓN INTERACTIVA: 13 CALCULADORAS ESTRUCTURALES CIRSOC / EDICI EN EL DASHBOARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                13 Calculadoras Online
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                · Basado en Normativa CIRSOC, INTI e IRAM Argentina
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              Suite de Cálculos Estructurales & Steel Frame
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Acceso rápido desde el dashboard para predimensionado de vigas, columnas, montantes, fundaciones y solicitaciones de viento, sismo, nieve y fuego.
            </p>
          </div>

          <button
            onClick={() => onNavigateTo('calculos')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#9a1417] hover:bg-[#830e11] rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span>Abrir Suite Completa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 13 Calculator Grid in Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {CALCULATORS_LIST.map(calc => (
            <div
              key={calc.id}
              onClick={() => onNavigateTo('calculos', calc.id)}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-red-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${calc.badgeColor}`}>
                    {calc.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {calc.norma.split('/')[0]}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                  {calc.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {calc.desc}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="font-bold text-red-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Calcular ahora <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-slate-400 text-[10px]">CIRSOC</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CUSTOMIZE WIDGETS */}
      <AnimatePresence>
        {isCustomizing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-teal-400" />
                    Personalizar Widgets del Dashboard
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reordena, muestra u oculta widgets y define su ancho en pantalla según tus prioridades.
                  </p>
                </div>
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                  <span>Organiza los widgets en pantalla:</span>
                  <button
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1 text-teal-700 hover:underline font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restablecer diseño
                  </button>
                </div>

                {localConfigs.map((cfg, idx) => (
                  <div
                    key={cfg.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      cfg.visible
                        ? 'border-slate-200 bg-white shadow-sm'
                        : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="Mover arriba"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === localConfigs.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="Mover abajo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cfg.title}</h4>
                        <p className="text-[11px] text-slate-500">{cfg.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleWidth(cfg.id)}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Cambiar ancho (Media columna vs Completa)"
                      >
                        {cfg.width === 'full' ? 'Ancho Completo' : 'Media Columna'}
                      </button>

                      <button
                        onClick={() => handleToggleVisible(cfg.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          cfg.visible
                            ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={cfg.visible ? 'Ocultar widget' : 'Mostrar widget'}
                      >
                        {cfg.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveConfigs}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
                >
                  Guardar Preferencias
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
