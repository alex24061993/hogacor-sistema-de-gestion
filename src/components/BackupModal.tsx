import React, { useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  X, 
  HardHat, 
  Building2, 
  Users, 
  Clock, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Project, User, ActivityLog, InventoryToolItem, InventorySupplyItem, CostItem, StaffMember } from '../types';
import { exportAppStateBackup, BackupDataPayload } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  projects: Project[];
  users: User[];
  logs: ActivityLog[];
  tools: InventoryToolItem[];
  supplies: InventorySupplyItem[];
  costs: CostItem[];
  staff: StaffMember[];
  onRestoreBackup: (backupData: BackupDataPayload['data']) => void;
  onShowNotification: (title: string, message: string, severity: 'success' | 'warning' | 'info' | 'critical') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  projects,
  users,
  logs,
  tools,
  supplies,
  costs,
  staff,
  onRestoreBackup,
  onShowNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupDataPayload | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportAppStateBackup({
        projects,
        users,
        logs,
        tools,
        supplies,
        costs,
        staff,
      }, currentUser.name);
      
      setExportSuccess(true);
      onShowNotification(
        'Copia de Seguridad Generada',
        'Se descargó el archivo JSON con todas las obras, usuarios, logs e inventario.',
        'success'
      );
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (e: any) {
      onShowNotification('Error en Exportación', e?.message || 'No se pudo generar el archivo', 'critical');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Determine if it's our structure or a raw array
        let extractedData: BackupDataPayload['data'] | null = null;

        if (parsed.data && typeof parsed.data === 'object') {
          extractedData = parsed.data;
        } else if (parsed.projects || parsed.users || parsed.logs) {
          extractedData = parsed;
        }

        if (!extractedData) {
          throw new Error('El archivo no posee un formato válido de respaldo de HOGACOR.');
        }

        setPendingBackup({
          appName: parsed.appName || 'HOGACOR Suite',
          version: parsed.version || '1.0',
          exportDate: parsed.exportDate || parsed.timestamp || new Date().toISOString(),
          exportedBy: parsed.exportedBy || 'Desconocido',
          data: extractedData,
        });
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo JSON');
        setPendingBackup(null);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingBackup) return;

    try {
      onRestoreBackup(pendingBackup.data);
      onShowNotification(
        'Base de Datos Restaurada',
        `Se han recuperado exitosamente los datos exportados por ${pendingBackup.exportedBy}.`,
        'success'
      );
      setPendingBackup(null);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Error al restaurar los datos en el sistema.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#9b1317] via-[#8c1014] to-[#7a0d10] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight">Copia de Seguridad y Respaldo</h2>
              <p className="text-xs text-white/80">Exportación e importación de base de datos en archivo JSON</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Current Database Summary Badges */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Estado actual de la base de datos local
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-xl font-black text-slate-900 block font-mono">{projects.length}</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Obras</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-xl font-black text-slate-900 block font-mono">{users.length}</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Usuarios</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-xl font-black text-slate-900 block font-mono">{tools.length + supplies.length}</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Pañol / Items</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-xl font-black text-slate-900 block font-mono">{logs.length}</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">Historial Logs</span>
              </div>
            </div>
          </div>

          {/* Section 1: Export Backup */}
          <div className="p-5 rounded-2xl border-2 border-red-100 bg-red-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-red-700" />
                <h3 className="text-sm font-bold text-slate-900">Descargar Copia de Seguridad (Backup Data)</h3>
              </div>
              <span className="text-[10px] font-bold bg-red-200/70 text-red-900 px-2 py-0.5 rounded-full">
                JSON Seguro
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Genera y descarga un archivo <code className="bg-white px-1.5 py-0.5 rounded text-red-800 font-mono text-[11px] border border-red-200">.json</code> con la totalidad de tus obras, costos, pañol, personal, cuentas de usuario y registros de auditoría.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                exportSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-red-700 hover:bg-red-800 text-white shadow-red-900/10'
              }`}
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Copia de Seguridad Descargada con Éxito!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar Copia de Seguridad Ahora (.JSON)
                </>
              )}
            </button>
          </div>

          {/* Section 2: Recovery / Restore */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Mecanismo de Recuperación / Restaurar Backup</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                Restaurar
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Si cambiaste de navegador, borraste caché o deseas migrar tu sistema, selecciona un archivo de respaldo previo para restaurar todos tus datos.
            </p>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />

            {!pendingBackup && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <FileJson className="w-4 h-4 text-slate-500" />
                Seleccionar Archivo de Respaldo (.JSON)
              </button>
            )}

            {importError && (
              <div className="p-3 bg-red-100/80 border border-red-300 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {pendingBackup && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Archivo de Respaldo Válido</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {new Date(pendingBackup.exportDate).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <p><strong>Exportado por:</strong> {pendingBackup.exportedBy}</p>
                  <p>
                    <strong>Contenido detectado:</strong>{' '}
                    {pendingBackup.data.projects?.length || 0} Obras,{' '}
                    {pendingBackup.data.users?.length || 0} Usuarios,{' '}
                    {pendingBackup.data.tools?.length || 0} Herramientas,{' '}
                    {pendingBackup.data.staff?.length || 0} Personal.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleConfirmRestore}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Confirmar y Restaurar Datos
                  </button>
                  <button
                    onClick={() => setPendingBackup(null)}
                    className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-white text-slate-600 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Datos cifrados y almacenados de manera segura</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
