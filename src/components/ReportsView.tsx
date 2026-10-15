import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';
import { Project, ActivityLog, User } from '../types';
import { calculateProjectStats, formatCurrency } from '../utils/storage';
import { 
  exportProjectsToExcel, 
  exportExpensesToExcel, 
  exportAuditLogsToExcel, 
  exportUsersToExcel,
  generatePrintablePDFReport 
} from '../utils/exportUtils';

interface ReportsViewProps {
  currentUser: User;
  projects: Project[];
  logs: ActivityLog[];
  users: User[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  projects,
  logs,
  users,
}) => {
  const [reportType, setReportType] = useState<'projects' | 'expenses' | 'audit' | 'users'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const filteredProjects = selectedProjectId === 'all'
    ? projects
    : projects.filter(p => p.id === selectedProjectId);

  const handleExportExcel = () => {
    switch (reportType) {
      case 'projects':
        exportProjectsToExcel(filteredProjects);
        break;
      case 'expenses':
        exportExpensesToExcel(filteredProjects);
        break;
      case 'audit':
        exportAuditLogsToExcel(logs);
        break;
      case 'users':
        exportUsersToExcel(users);
        break;
    }
  };

  const handleExportPDF = () => {
    const titles = {
      projects: 'Informe Ejecutivo Consolidado de Obras y Finanzas',
      expenses: 'Detalle Oficial de Costos y Facturación Operativa',
      audit: 'Auditoría de Actividad y Seguridad de Usuarios',
      users: 'Matriz de Permisos y Cuentas de Acceso',
    };
    generatePrintablePDFReport(titles[reportType], filteredProjects, currentUser.name);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Centro de Informes y Exportación
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Genera informes ejecutivos auditables y expórtalos en formatos PDF de alta resolución y planillas Excel (XLSX/CSV).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
              title="Descargar datos en formato Excel compatible con fórmulas y totales"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar a Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
              title="Generar e imprimir documento PDF oficial"
            >
              <Printer className="w-4 h-4" />
              Imprimir en PDF
            </button>
          </div>
        </div>

        {/* Configuration Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tipo de Informe Oficial
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="projects">1. Resumen Ejecutivo Consolidado de Obras y Finanzas</option>
              <option value="expenses">2. Libro Detallado de Gastos, Facturas y Comprobantes</option>
              <option value="audit">3. Auditoría de Actividad y Trazabilidad de Usuarios</option>
              <option value="users">4. Padrón de Usuarios, Departamentos y Matriz de Permisos</option>
            </select>
          </div>

          {reportType !== 'audit' && reportType !== 'users' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Filtrar por Obra / Proyecto
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Todas las Obras (Consolidado General)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Report Preview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Vista Previa del Informe
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">
            Generado: {new Date().toLocaleDateString('es-AR')}
          </span>
        </div>

        {/* Tabular Preview */}
        {reportType === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Obra / Proyecto</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3 text-center">Avance</th>
                  <th className="p-3 text-right">Presupuesto</th>
                  <th className="p-3 text-right">Cobrado</th>
                  <th className="p-3 text-right">Costos</th>
                  <th className="p-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredProjects.map(p => {
                  const s = calculateProjectStats(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900 font-sans">{p.name}</td>
                      <td className="p-3 text-slate-600 font-sans">{p.client}</td>
                      <td className="p-3 text-center font-bold text-teal-700">{s.progressPct}%</td>
                      <td className="p-3 text-right">{formatCurrency(p.budget)}</td>
                      <td className="p-3 text-right text-emerald-700">{formatCurrency(s.incomeTotal)}</td>
                      <td className="p-3 text-right text-rose-700">{formatCurrency(s.totalCost)}</td>
                      <td className={`p-3 text-right font-bold ${s.operatingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(s.operatingBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Obra</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Concepto</th>
                  <th className="p-3">Comprobante</th>
                  <th className="p-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredProjects.flatMap(p => 
                  (p.expenses || []).map(ex => (
                    <tr key={ex.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500">{ex.date}</td>
                      <td className="p-3 font-bold text-slate-900 font-sans">{p.name}</td>
                      <td className="p-3 font-sans text-slate-700">{ex.category}</td>
                      <td className="p-3 font-sans text-slate-800">{ex.concept}</td>
                      <td className="p-3 text-slate-500">{ex.receiptNumber || '-'}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(ex.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Momento</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Detalle</th>
                  <th className="p-3 text-center">Severidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400">{l.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900 font-sans">{l.userName}</td>
                    <td className="p-3 font-sans font-semibold text-slate-700">{l.module.toUpperCase()}</td>
                    <td className="p-3 font-sans text-slate-800">{l.action}</td>
                    <td className="p-3 font-sans text-slate-600">{l.details}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {l.severity.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Área</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Último Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3 font-semibold text-slate-800">{u.roleTitle}</td>
                    <td className="p-3 text-slate-600">{u.department}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{u.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
