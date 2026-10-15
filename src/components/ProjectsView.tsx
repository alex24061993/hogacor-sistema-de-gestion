import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  FileUp, 
  Eye, 
  Edit2, 
  Check, 
  X, 
  Lock, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Users, 
  Truck, 
  Wrench, 
  Receipt, 
  FileText, 
  Paperclip,
  CheckCircle2,
  FolderOpen,
  Download,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { Project, User, Stage, Employee, Vehicle, Tool, Expense, Income, Note, PlanFile } from '../types';
import { calculateProjectStats, formatCurrency } from '../utils/storage';

interface ProjectsViewProps {
  currentUser: User;
  projects: Project[];
  selectedProjectId?: string;
  onUpdateProject: (updated: Project) => void;
  onCreateProject: (newProj: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  currentUser,
  projects,
  selectedProjectId,
  onUpdateProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [activeProjId, setActiveProjId] = useState<string>(
    selectedProjectId || (projects.length > 0 ? projects[0].id : '')
  );
  const [activeTab, setActiveTab] = useState<'avance' | 'personal' | 'vehiculos' | 'herramientas' | 'gastos' | 'finanzas' | 'planos' | 'notas'>('avance');
  
  // Project creation modal
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjBudget, setNewProjBudget] = useState('25000000');
  const [newProjAddress, setNewProjAddress] = useState('');

  // Project edit general info modal
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [editGeneralName, setEditGeneralName] = useState('');
  const [editGeneralClient, setEditGeneralClient] = useState('');
  const [editGeneralAddress, setEditGeneralAddress] = useState('');
  const [editGeneralBudget, setEditGeneralBudget] = useState(0);
  const [editGeneralStatus, setEditGeneralStatus] = useState<'Planificada' | 'En curso' | 'Pausada' | 'Terminada'>('En curso');
  const [editGeneralStart, setEditGeneralStart] = useState('');
  const [editGeneralEnd, setEditGeneralEnd] = useState('');

  // CRUD item modals state
  const [stageModal, setStageModal] = useState<{ open: boolean; stage?: Stage }>({ open: false });
  const [stageName, setStageName] = useState('');
  const [stagePct, setStagePct] = useState(0);

  const [employeeModal, setEmployeeModal] = useState<{ open: boolean; emp?: Employee }>({ open: false });
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empRate, setEmpRate] = useState(45000);
  const [empDays, setEmpDays] = useState(1);
  const [empPhone, setEmpPhone] = useState('');

  const [vehicleModal, setVehicleModal] = useState<{ open: boolean; veh?: Vehicle }>({ open: false });
  const [vehName, setVehName] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehRate, setVehRate] = useState(25000);
  const [vehDays, setVehDays] = useState(1);

  const [toolModal, setToolModal] = useState<{ open: boolean; tool?: Tool }>({ open: false });
  const [toolName, setToolName] = useState('');
  const [toolKind, setToolKind] = useState<'Propia' | 'Alquilada' | 'Comprada para la obra'>('Propia');
  const [toolQty, setToolQty] = useState(1);
  const [toolCost, setToolCost] = useState(100000);

  const [expenseModal, setExpenseModal] = useState<{ open: boolean; exp?: Expense }>({ open: false });
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expConcept, setExpConcept] = useState('');
  const [expCategory, setExpCategory] = useState('Materiales');
  const [expAmount, setExpAmount] = useState(0);
  const [expReceipt, setExpReceipt] = useState('');

  const [incomeModal, setIncomeModal] = useState<{ open: boolean; inc?: Income }>({ open: false });
  const [incDate, setIncDate] = useState(new Date().toISOString().slice(0, 10));
  const [incConcept, setIncConcept] = useState('');
  const [incAmount, setIncAmount] = useState(0);

  const [noteModal, setNoteModal] = useState<{ open: boolean; note?: Note }>({ open: false });
  const [noteText, setNoteText] = useState('');

  // Plans file preview modal
  const [previewPlan, setPreviewPlan] = useState<PlanFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Module permissions
  const canAccessObras = currentUser.permissions.obras?.canAccess;
  const canEditObras = currentUser.permissions.obras?.canEdit;
  const canAccessFinanzas = currentUser.permissions.finanzas?.canAccess;
  const canEditFinanzas = currentUser.permissions.finanzas?.canEdit;
  const canAccessPersonal = currentUser.permissions.personal?.canAccess;
  const canEditPersonal = currentUser.permissions.personal?.canEdit;
  const canAccessHerramientas = currentUser.permissions.herramientas?.canAccess;
  const canEditHerramientas = currentUser.permissions.herramientas?.canEdit;
  const canAccessPlanos = currentUser.permissions.planos?.canAccess;
  const canEditPlanos = currentUser.permissions.planos?.canEdit;

  if (!canAccessObras) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-red-200 text-center shadow-lg">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Módulo Restringido por Privilegios</h2>
        <p className="text-xs text-slate-600 mb-4">
          Tu cuenta actual no tiene privilegios de lectura para el módulo de Gestión de Obras.
        </p>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === activeProjId) || projects[0];
  const stats = currentProject ? calculateProjectStats(currentProject) : null;

  // General Edit Open
  const openEditGeneral = () => {
    if (!currentProject) return;
    setEditGeneralName(currentProject.name);
    setEditGeneralClient(currentProject.client);
    setEditGeneralAddress(currentProject.address);
    setEditGeneralBudget(currentProject.budget);
    setEditGeneralStatus(currentProject.status);
    setEditGeneralStart(currentProject.start || '');
    setEditGeneralEnd(currentProject.end || '');
    setIsEditingGeneral(true);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      name: editGeneralName.trim() || currentProject.name,
      client: editGeneralClient.trim() || currentProject.client,
      address: editGeneralAddress.trim() || currentProject.address,
      budget: Number(editGeneralBudget) || 0,
      status: editGeneralStatus,
      start: editGeneralStart,
      end: editGeneralEnd,
    });
    setIsEditingGeneral(false);
  };

  // Stage Handlers
  const handleStagePctChange = (stageId: string, newPct: number) => {
    if (!canEditObras || !currentProject) return;
    const updatedStages = currentProject.stages.map(s =>
      s.id === stageId ? { ...s, pct: Math.min(100, Math.max(0, newPct)) } : s
    );
    onUpdateProject({ ...currentProject, stages: updatedStages });
  };

  const openStageModal = (stg?: Stage) => {
    if (stg) {
      setStageModal({ open: true, stage: stg });
      setStageName(stg.name);
      setStagePct(stg.pct);
    } else {
      setStageModal({ open: true });
      setStageName('');
      setStagePct(0);
    }
  };

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !stageName.trim()) return;

    if (stageModal.stage) {
      // update
      const updatedStages = currentProject.stages.map(s =>
        s.id === stageModal.stage!.id ? { ...s, name: stageName.trim(), pct: stagePct } : s
      );
      onUpdateProject({ ...currentProject, stages: updatedStages });
    } else {
      // add
      const newStg: Stage = {
        id: `stg-${Date.now()}`,
        name: stageName.trim(),
        pct: stagePct,
      };
      onUpdateProject({ ...currentProject, stages: [...currentProject.stages, newStg] });
    }
    setStageModal({ open: false });
  };

  const handleDeleteStage = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      stages: currentProject.stages.filter(s => s.id !== id),
    });
  };

  // Employee Handlers
  const openEmployeeModal = (emp?: Employee) => {
    if (emp) {
      setEmployeeModal({ open: true, emp });
      setEmpName(emp.name);
      setEmpRole(emp.role);
      setEmpRate(emp.rate);
      setEmpDays(emp.days);
      setEmpPhone(emp.phone || '');
    } else {
      setEmployeeModal({ open: true });
      setEmpName('');
      setEmpRole('Oficial');
      setEmpRate(45000);
      setEmpDays(1);
      setEmpPhone('');
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !empName.trim()) return;

    if (employeeModal.emp) {
      const updated = currentProject.employees.map(em =>
        em.id === employeeModal.emp!.id
          ? { ...em, name: empName.trim(), role: empRole.trim(), rate: Number(empRate), days: Number(empDays), phone: empPhone.trim() }
          : em
      );
      onUpdateProject({ ...currentProject, employees: updated });
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: empName.trim(),
        role: empRole.trim(),
        rate: Number(empRate),
        days: Number(empDays),
        phone: empPhone.trim(),
      };
      onUpdateProject({ ...currentProject, employees: [...currentProject.employees, newEmp] });
    }
    setEmployeeModal({ open: false });
  };

  const handleDeleteEmployee = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      employees: currentProject.employees.filter(e => e.id !== id),
    });
  };

  // Vehicle Handlers
  const openVehicleModal = (veh?: Vehicle) => {
    if (veh) {
      setVehicleModal({ open: true, veh });
      setVehName(veh.name);
      setVehPlate(veh.plate);
      setVehRate(veh.rate);
      setVehDays(veh.days);
    } else {
      setVehicleModal({ open: true });
      setVehName('');
      setVehPlate('');
      setVehRate(25000);
      setVehDays(1);
    }
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !vehName.trim()) return;

    if (vehicleModal.veh) {
      const updated = currentProject.vehicles.map(v =>
        v.id === vehicleModal.veh!.id
          ? { ...v, name: vehName.trim(), plate: vehPlate.trim(), rate: Number(vehRate), days: Number(vehDays) }
          : v
      );
      onUpdateProject({ ...currentProject, vehicles: updated });
    } else {
      const newVeh: Vehicle = {
        id: `veh-${Date.now()}`,
        name: vehName.trim(),
        plate: vehPlate.trim(),
        rate: Number(vehRate),
        days: Number(vehDays),
      };
      onUpdateProject({ ...currentProject, vehicles: [...currentProject.vehicles, newVeh] });
    }
    setVehicleModal({ open: false });
  };

  const handleDeleteVehicle = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      vehicles: currentProject.vehicles.filter(v => v.id !== id),
    });
  };

  // Tool Handlers
  const openToolModal = (tool?: Tool) => {
    if (tool) {
      setToolModal({ open: true, tool });
      setToolName(tool.name);
      setToolKind(tool.kind);
      setToolQty(tool.qty);
      setToolCost(tool.cost);
    } else {
      setToolModal({ open: true });
      setToolName('');
      setToolKind('Propia');
      setToolQty(1);
      setToolCost(100000);
    }
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !toolName.trim()) return;

    if (toolModal.tool) {
      const updated = currentProject.tools.map(t =>
        t.id === toolModal.tool!.id
          ? { ...t, name: toolName.trim(), kind: toolKind, qty: Number(toolQty), cost: Number(toolCost) }
          : t
      );
      onUpdateProject({ ...currentProject, tools: updated });
    } else {
      const newTool: Tool = {
        id: `tl-${Date.now()}`,
        name: toolName.trim(),
        kind: toolKind,
        qty: Number(toolQty),
        cost: Number(toolCost),
      };
      onUpdateProject({ ...currentProject, tools: [...currentProject.tools, newTool] });
    }
    setToolModal({ open: false });
  };

  const handleDeleteTool = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      tools: currentProject.tools.filter(t => t.id !== id),
    });
  };

  // Expense Handlers
  const openExpenseModal = (exp?: Expense) => {
    if (exp) {
      setExpenseModal({ open: true, exp });
      setExpDate(exp.date);
      setExpConcept(exp.concept);
      setExpCategory(exp.category);
      setExpAmount(exp.amount);
      setExpReceipt(exp.receiptNumber || '');
    } else {
      setExpenseModal({ open: true });
      setExpDate(new Date().toISOString().slice(0, 10));
      setExpConcept('');
      setExpCategory('Materiales');
      setExpAmount(0);
      setExpReceipt('');
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !expConcept.trim()) return;

    if (expenseModal.exp) {
      const updated = currentProject.expenses.map(x =>
        x.id === expenseModal.exp!.id
          ? { ...x, date: expDate, concept: expConcept.trim(), category: expCategory, amount: Number(expAmount), receiptNumber: expReceipt.trim() }
          : x
      );
      onUpdateProject({ ...currentProject, expenses: updated });
    } else {
      const newEx: Expense = {
        id: `exp-${Date.now()}`,
        date: expDate,
        concept: expConcept.trim(),
        category: expCategory,
        amount: Number(expAmount),
        receiptNumber: expReceipt.trim(),
      };
      onUpdateProject({ ...currentProject, expenses: [...currentProject.expenses, newEx] });
    }
    setExpenseModal({ open: false });
  };

  const handleDeleteExpense = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      expenses: currentProject.expenses.filter(x => x.id !== id),
    });
  };

  // Income Handlers
  const openIncomeModal = (inc?: Income) => {
    if (inc) {
      setIncomeModal({ open: true, inc });
      setIncDate(inc.date);
      setIncConcept(inc.concept);
      setIncAmount(inc.amount);
    } else {
      setIncomeModal({ open: true });
      setIncDate(new Date().toISOString().slice(0, 10));
      setIncConcept('');
      setIncAmount(0);
    }
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !incConcept.trim()) return;

    if (incomeModal.inc) {
      const updated = currentProject.income.map(i =>
        i.id === incomeModal.inc!.id
          ? { ...i, date: incDate, concept: incConcept.trim(), amount: Number(incAmount) }
          : i
      );
      onUpdateProject({ ...currentProject, income: updated });
    } else {
      const newInc: Income = {
        id: `inc-${Date.now()}`,
        date: incDate,
        concept: incConcept.trim(),
        amount: Number(incAmount),
      };
      onUpdateProject({ ...currentProject, income: [...currentProject.income, newInc] });
    }
    setIncomeModal({ open: false });
  };

  const handleDeleteIncome = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      income: currentProject.income.filter(i => i.id !== id),
    });
  };

  // Note Handlers
  const openNoteModal = (note?: Note) => {
    if (note) {
      setNoteModal({ open: true, note });
      setNoteText(note.text);
    } else {
      setNoteModal({ open: true });
      setNoteText('');
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !noteText.trim()) return;

    if (noteModal.note) {
      const updated = currentProject.notes.map(n =>
        n.id === noteModal.note!.id ? { ...n, text: noteText.trim() } : n
      );
      onUpdateProject({ ...currentProject, notes: updated });
    } else {
      const newNote: Note = {
        id: `nt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        author: currentUser.name,
        text: noteText.trim(),
      };
      onUpdateProject({ ...currentProject, notes: [newNote, ...currentProject.notes] });
    }
    setNoteModal({ open: false });
  };

  const handleDeleteNote = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      notes: currentProject.notes.filter(n => n.id !== id),
    });
  };

  // File Upload Handlers (Images, PDF, Excel, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditPlanos || !currentProject || !e.target.files) return;

    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        const newPlan: PlanFile = {
          id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          date: new Date().toISOString().slice(0, 10),
          note: `Subido por ${currentUser.name}`,
          dataUrl,
        };

        onUpdateProject({
          ...currentProject,
          plans: [...currentProject.plans, newPlan],
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePlan = (id: string) => {
    if (!currentProject) return;
    onUpdateProject({
      ...currentProject,
      plans: currentProject.plans.filter(p => p.id !== id),
    });
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newP: Project = {
      id: `proj-${Date.now().toString(36)}`,
      name: newProjName.trim(),
      client: newProjClient.trim() || 'Cliente General',
      address: newProjAddress.trim() || 'A coordinar',
      status: 'Planificada',
      start: new Date().toISOString().slice(0, 10),
      end: '',
      budget: Number(newProjBudget) || 10000000,
      stages: [
        { id: `stg-${Date.now()}-1`, name: 'Movimiento de suelos y fundaciones', pct: 0 },
        { id: `stg-${Date.now()}-2`, name: 'Estructuras principales', pct: 0 },
        { id: `stg-${Date.now()}-3`, name: 'Cerramientos y cubiertas', pct: 0 },
        { id: `stg-${Date.now()}-4`, name: 'Instalaciones y terminaciones', pct: 0 },
      ],
      employees: [],
      vehicles: [],
      tools: [],
      expenses: [],
      income: [],
      notes: [{ id: `nt-${Date.now()}`, date: new Date().toISOString().slice(0, 10), text: 'Obra creada en el sistema.', author: currentUser.name }],
      plans: [],
    };

    onCreateProject(newP);
    setActiveProjId(newP.id);
    setIsCreatingModal(false);
    setNewProjName('');
  };

  const getFileBadge = (type: string, name: string) => {
    if (type.startsWith('image/') || name.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
      return <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-[10px]">IMG</span>;
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">PDF</span>;
    }
    if (type.includes('sheet') || type.includes('excel') || name.match(/\.(xlsx|xls|csv)$/i)) {
      return <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">XLS</span>;
    }
    return <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">DOC</span>;
  };

  return (
    <div className="space-y-6">
      {/* Project selector bar & quick action */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Obra activa:
          </span>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProjId(p.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                activeProjId === p.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {canEditObras && (
          <button
            onClick={() => setIsCreatingModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Obra
          </button>
        )}
      </div>

      {currentProject && stats && (
        <div className="space-y-6">
          {/* Project Details Banner with Edit General Button */}
          <div className="relative bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#e40901]" />
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {currentProject.name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    currentProject.status === 'En curso' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentProject.status}
                  </span>
                  {canEditObras && (
                    <button
                      onClick={openEditGeneral}
                      className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                      title="Editar datos generales de la obra"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Cliente: <strong className="text-slate-800">{currentProject.client}</strong></span>
                  <span>Ubicación: <strong className="text-slate-800">{currentProject.address}</strong></span>
                  <span>Inicio: <strong className="text-slate-800">{currentProject.start || '-'}</strong></span>
                </div>
              </div>

              {/* Status pill summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-numbers">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Avance</span>
                  <span className="text-base font-black text-teal-700">{stats.progressPct}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Presupuesto</span>
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(currentProject.budget)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Costos</span>
                  <span className="text-xs font-bold text-rose-700">{formatCurrency(stats.totalCost)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Cobrado</span>
                  <span className="text-xs font-bold text-emerald-700">{formatCurrency(stats.incomeTotal)}</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs for project modules */}
            <div className="flex items-center gap-1.5 mt-6 border-b border-slate-100 pb-1 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('avance')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === 'avance' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Etapas y Avance ({currentProject.stages?.length || 0})
              </button>
              
              {canAccessPersonal && (
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                    activeTab === 'personal' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Personal ({currentProject.employees?.length || 0})
                </button>
              )}

              {canAccessHerramientas && (
                <>
                  <button
                    onClick={() => setActiveTab('vehiculos')}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      activeTab === 'vehiculos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Vehículos ({currentProject.vehicles?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('herramientas')}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      activeTab === 'herramientas' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Herramientas ({currentProject.tools?.length || 0})
                  </button>
                </>
              )}

              {canAccessFinanzas && (
                <>
                  <button
                    onClick={() => setActiveTab('gastos')}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      activeTab === 'gastos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Gastos ({currentProject.expenses?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('finanzas')}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      activeTab === 'finanzas' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Contabilidad
                  </button>
                </>
              )}

              {canAccessPlanos && (
                <button
                  onClick={() => setActiveTab('planos')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                    activeTab === 'planos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Planos & Docs ({currentProject.plans?.length || 0})
                </button>
              )}

              <button
                onClick={() => setActiveTab('notas')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === 'notas' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Bitácora ({currentProject.notes?.length || 0})
              </button>
            </div>
          </div>

          {/* TAB 1: ETAPAS Y AVANCE */}
          {activeTab === 'avance' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Etapas Constructivas ({stats.progressPct}% Completado)
                  </h3>
                  <p className="text-xs text-slate-400">Ajusta el avance o edita y agrega nuevas etapas</p>
                </div>
                {canEditObras && (
                  <button
                    onClick={() => openStageModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Agregar Etapa
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {currentProject.stages.map((stg, idx) => (
                  <div key={stg.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">{stg.name}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono-numbers font-bold text-teal-700">
                          {stg.pct}%
                        </span>
                        {canEditObras && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openStageModal(stg)}
                              className="p-1 text-slate-400 hover:text-slate-800"
                              title="Editar nombre o porcentaje"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStage(stg.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Eliminar etapa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        disabled={!canEditObras}
                        value={stg.pct}
                        onChange={e => handleStagePctChange(stg.id, Number(e.target.value))}
                        className="w-full accent-teal-600 cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal y Cuadrillas</h3>
                  <p className="text-xs text-slate-400">Total costo mano de obra: {formatCurrency(stats.laborCost)}</p>
                </div>
                {canEditPersonal && (
                  <button
                    onClick={() => openEmployeeModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Agregar Operario
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Operario</th>
                      <th className="p-3">Rol / Especialidad</th>
                      <th className="p-3 text-right">Jornal Diario</th>
                      <th className="p-3 text-right">Días</th>
                      <th className="p-3 text-right">Total Acumulado</th>
                      {canEditPersonal && <th className="p-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {currentProject.employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 font-sans">{emp.name}</td>
                        <td className="p-3 font-sans text-slate-600">{emp.role}</td>
                        <td className="p-3 text-right">{formatCurrency(emp.rate)}</td>
                        <td className="p-3 text-right">{emp.days}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(emp.rate * emp.days)}</td>
                        {canEditPersonal && (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEmployeeModal(emp)}
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VEHÍCULOS */}
          {activeTab === 'vehiculos' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Vehículos y Flota</h3>
                  <p className="text-xs text-slate-400">Costo total: {formatCurrency(stats.vehicleCost)}</p>
                </div>
                {canEditHerramientas && (
                  <button
                    onClick={() => openVehicleModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Agregar Vehículo
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Vehículo</th>
                      <th className="p-3">Patente / Dominio</th>
                      <th className="p-3 text-right">Costo Diario</th>
                      <th className="p-3 text-right">Días Uso</th>
                      <th className="p-3 text-right">Total</th>
                      {canEditHerramientas && <th className="p-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {currentProject.vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 font-sans">{v.name}</td>
                        <td className="p-3 text-slate-600">{v.plate}</td>
                        <td className="p-3 text-right">{formatCurrency(v.rate)}</td>
                        <td className="p-3 text-right">{v.days}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(v.rate * v.days)}</td>
                        {canEditHerramientas && (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openVehicleModal(v)}
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(v.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HERRAMIENTAS */}
          {activeTab === 'herramientas' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Herramientas y Equipamiento</h3>
                  <p className="text-xs text-slate-400">Costo total: {formatCurrency(stats.toolCost)}</p>
                </div>
                {canEditHerramientas && (
                  <button
                    onClick={() => openToolModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Agregar Herramienta
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Equipo</th>
                      <th className="p-3">Condición</th>
                      <th className="p-3 text-right">Cantidad</th>
                      <th className="p-3 text-right">Costo Unitario</th>
                      <th className="p-3 text-right">Total</th>
                      {canEditHerramientas && <th className="p-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {currentProject.tools.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900 font-sans">{t.name}</td>
                        <td className="p-3 font-sans text-slate-600">{t.kind}</td>
                        <td className="p-3 text-right">{t.qty}</td>
                        <td className="p-3 text-right">{formatCurrency(t.cost)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(t.qty * t.cost)}</td>
                        {canEditHerramientas && (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openToolModal(t)}
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTool(t.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: GASTOS */}
          {activeTab === 'gastos' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Libro de Gastos y Materiales</h3>
                  <p className="text-xs text-slate-500">Total egresos: {formatCurrency(stats.expenseCost)}</p>
                </div>
                {canEditFinanzas && (
                  <button
                    onClick={() => openExpenseModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Registrar Gasto
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3">Comprobante</th>
                      <th className="p-3 text-right">Importe</th>
                      {canEditFinanzas && <th className="p-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {currentProject.expenses.map(ex => (
                      <tr key={ex.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500">{ex.date}</td>
                        <td className="p-3 font-sans text-slate-700">{ex.category}</td>
                        <td className="p-3 font-sans font-bold text-slate-900">{ex.concept}</td>
                        <td className="p-3 text-slate-500">{ex.receiptNumber || '-'}</td>
                        <td className="p-3 text-right font-bold text-rose-700">{formatCurrency(ex.amount)}</td>
                        {canEditFinanzas && (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openExpenseModal(ex)}
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(ex.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: FINANZAS / CONTABILIDAD */}
          {activeTab === 'finanzas' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Presupuesto Aprobado</span>
                    <div className="text-xl font-black text-slate-900 mt-1 font-mono-numbers">
                      {formatCurrency(currentProject.budget)}
                    </div>
                  </div>
                  {canEditFinanzas && (
                    <button
                      onClick={openEditGeneral}
                      className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold"
                    >
                      Editar
                    </button>
                  )}
                </div>
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                  <span className="text-[11px] font-bold text-teal-800 uppercase">Fondos Cobrados</span>
                  <div className="text-xl font-black text-teal-800 mt-1 font-mono-numbers">
                    {formatCurrency(stats.incomeTotal)}
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">Resultado Operativo</span>
                  <div className={`text-xl font-black mt-1 font-mono-numbers ${stats.operatingBalance >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                    {formatCurrency(stats.operatingBalance)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Cobros Registrados del Cliente</h4>
                  {canEditFinanzas && (
                    <button
                      onClick={() => openIncomeModal()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Registrar Cobro
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Concepto</th>
                        <th className="p-3 text-right">Monto</th>
                        {canEditFinanzas && <th className="p-3 text-right">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono-numbers">
                      {currentProject.income.map(inc => (
                        <tr key={inc.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-500">{inc.date}</td>
                          <td className="p-3 font-sans font-bold text-slate-900">{inc.concept}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(inc.amount)}</td>
                          {canEditFinanzas && (
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openIncomeModal(inc)}
                                  className="p-1 text-slate-400 hover:text-slate-800"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIncome(inc.id)}
                                  className="p-1 text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PLANOS Y DOCUMENTOS CON SUBIDA REAL */}
          {activeTab === 'planos' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Planos Técnicos y Documentación de Obra</h3>
                  <p className="text-xs text-slate-400">Sube planos en PDF, imágenes de obra, planillas Excel o documentos técnicos</p>
                </div>

                {canEditPlanos && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="plan-file-upload"
                    />
                    <label
                      htmlFor="plan-file-upload"
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      <FileUp className="w-4 h-4" />
                      + Subir Archivos (PDF, Excel, Img)
                    </label>
                  </div>
                )}
              </div>

              {currentProject.plans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No hay documentos ni planos subidos</p>
                  <p className="text-xs text-slate-400 mt-1">Usa el botón "+ Subir Archivos" para cargar planos en PDF, Excel o fotos de obra.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentProject.plans.map(pl => (
                    <div key={pl.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {getFileBadge(pl.type, pl.name)}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{pl.name}</h4>
                          <p className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                            {pl.date} · {(pl.size / 1048576).toFixed(2)} MB
                          </p>
                          {pl.note && <p className="text-[11px] text-slate-600 mt-1 italic">{pl.note}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewPlan(pl)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                          title="Ver / Previsualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {pl.dataUrl && (
                          <a
                            href={pl.dataUrl}
                            download={pl.name}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-200 rounded-lg"
                            title="Descargar archivo"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        {canEditPlanos && (
                          <button
                            onClick={() => handleDeletePlan(pl.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: NOTAS / BITÁCORA */}
          {activeTab === 'notas' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bitácora de Inspección y Novedades</h3>
                  <p className="text-xs text-slate-400">Registros y observaciones del personal de terreno</p>
                </div>
                <button
                  onClick={() => openNoteModal()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Agregar Nota
                </button>
              </div>

              <div className="space-y-3">
                {currentProject.notes.map(n => (
                  <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-numbers mb-1">
                        <span>{n.date}</span>
                        {n.author && <span className="font-semibold text-slate-700">· Por: {n.author}</span>}
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{n.text}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openNoteModal(n)}
                        className="p-1 text-slate-400 hover:text-slate-800"
                        title="Editar nota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT GENERAL PROJECT INFO */}
      <AnimatePresence>
        {isEditingGeneral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveGeneral}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">Editar Datos Generales de la Obra</h3>
                  <button type="button" onClick={() => setIsEditingGeneral(false)} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre de la Obra</label>
                    <input type="text" value={editGeneralName} onChange={e => setEditGeneralName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cliente</label>
                    <input type="text" value={editGeneralClient} onChange={e => setEditGeneralClient(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dirección / Ubicación</label>
                    <input type="text" value={editGeneralAddress} onChange={e => setEditGeneralAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Presupuesto (ARS)</label>
                      <input type="number" value={editGeneralBudget} onChange={e => setEditGeneralBudget(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Estado</label>
                      <select value={editGeneralStatus} onChange={e => setEditGeneralStatus(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                        <option value="Planificada">Planificada</option>
                        <option value="En curso">En curso</option>
                        <option value="Pausada">Pausada</option>
                        <option value="Terminada">Terminada</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fecha Inicio</label>
                      <input type="date" value={editGeneralStart} onChange={e => setEditGeneralStart(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fecha Fin Estimada</label>
                      <input type="date" value={editGeneralEnd} onChange={e => setEditGeneralEnd(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditingGeneral(false)} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar Cambios</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT STAGE */}
      <AnimatePresence>
        {stageModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveStage}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{stageModal.stage ? 'Editar Etapa' : 'Nueva Etapa de Obra'}</h3>
                  <button type="button" onClick={() => setStageModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre de la Etapa *</label>
                    <input type="text" required value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Ej: Techado y aislamiento" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Porcentaje de Avance Actual: {stagePct}%</label>
                    <input type="range" min="0" max="100" step="5" value={stagePct} onChange={e => setStagePct(Number(e.target.value))} className="w-full accent-teal-600" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setStageModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      <AnimatePresence>
        {employeeModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveEmployee}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{employeeModal.emp ? 'Editar Operario' : 'Registrar Operario'}</h3>
                  <button type="button" onClick={() => setEmployeeModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                    <input type="text" required value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Ej: Manuel Ortiz" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rol / Especialidad</label>
                    <input type="text" value={empRole} onChange={e => setEmpRole(e.target.value)} placeholder="Ej: Oficial Albañil, Capataz, Electricista" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Jornal Diario (ARS)</label>
                      <input type="number" required value={empRate} onChange={e => setEmpRate(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Días Trabajados</label>
                      <input type="number" required value={empDays} onChange={e => setEmpDays(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto</label>
                    <input type="text" value={empPhone} onChange={e => setEmpPhone(e.target.value)} placeholder="11-4455-6677" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setEmployeeModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT VEHICLE */}
      <AnimatePresence>
        {vehicleModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveVehicle}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{vehicleModal.veh ? 'Editar Vehículo' : 'Registrar Vehículo'}</h3>
                  <button type="button" onClick={() => setVehicleModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Vehículo / Maquinaria *</label>
                    <input type="text" required value={vehName} onChange={e => setVehName(e.target.value)} placeholder="Ej: Camión Volcador" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Patente / Identificador</label>
                    <input type="text" value={vehPlate} onChange={e => setVehPlate(e.target.value)} placeholder="Ej: AF 123 CD" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Costo por Día (ARS)</label>
                      <input type="number" required value={vehRate} onChange={e => setVehRate(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Días de Uso</label>
                      <input type="number" required value={vehDays} onChange={e => setVehDays(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setVehicleModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT TOOL */}
      <AnimatePresence>
        {toolModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveTool}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{toolModal.tool ? 'Editar Herramienta' : 'Registrar Herramienta'}</h3>
                  <button type="button" onClick={() => setToolModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre del Equipo / Herramienta *</label>
                    <input type="text" required value={toolName} onChange={e => setToolName(e.target.value)} placeholder="Ej: Hormigonera 400L" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Condición</label>
                    <select value={toolKind} onChange={e => setToolKind(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                      <option value="Propia">Propia</option>
                      <option value="Alquilada">Alquilada</option>
                      <option value="Comprada para la obra">Comprada para la obra</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Cantidad</label>
                      <input type="number" required value={toolQty} onChange={e => setToolQty(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Costo Unitario (ARS)</label>
                      <input type="number" required value={toolCost} onChange={e => setToolCost(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setToolModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT EXPENSE */}
      <AnimatePresence>
        {expenseModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveExpense}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{expenseModal.exp ? 'Editar Gasto' : 'Registrar Gasto de Obra'}</h3>
                  <button type="button" onClick={() => setExpenseModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Concepto *</label>
                    <input type="text" required value={expConcept} onChange={e => setExpConcept(e.target.value)} placeholder="Ej: Compra de cemento y arena" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                      <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white">
                        <option value="Materiales">Materiales</option>
                        <option value="Mano de obra extra">Mano de obra extra</option>
                        <option value="Combustible">Combustible</option>
                        <option value="Alquileres">Alquileres</option>
                        <option value="Permisos y honorarios">Permisos y honorarios</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fecha</label>
                      <input type="date" required value={expDate} onChange={e => setExpDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Monto (ARS) *</label>
                      <input type="number" required value={expAmount} onChange={e => setExpAmount(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">N° Comprobante / Factura</label>
                      <input type="text" value={expReceipt} onChange={e => setExpReceipt(e.target.value)} placeholder="FAC-0001-9988" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setExpenseModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT INCOME */}
      <AnimatePresence>
        {incomeModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveIncome}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{incomeModal.inc ? 'Editar Cobro' : 'Registrar Cobro de Cliente'}</h3>
                  <button type="button" onClick={() => setIncomeModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Concepto de Cobro *</label>
                    <input type="text" required value={incConcept} onChange={e => setIncConcept(e.target.value)} placeholder="Ej: Certificado de Avance N° 2" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fecha</label>
                      <input type="date" required value={incDate} onChange={e => setIncDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Monto Cobrado (ARS) *</label>
                      <input type="number" required value={incAmount} onChange={e => setIncAmount(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setIncomeModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT NOTE */}
      <AnimatePresence>
        {noteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleSaveNote}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">{noteModal.note ? 'Editar Nota' : 'Nueva Entrada en Bitácora'}</h3>
                  <button type="button" onClick={() => setNoteModal({ open: false })} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Observación / Anotación de Obra *</label>
                    <textarea rows={4} required value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Escribe el avance, problemas detectados o novedades..." className="w-full p-3 border border-slate-300 rounded-xl" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setNoteModal({ open: false })} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Guardar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PLAN PREVIEW */}
      <AnimatePresence>
        {previewPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold truncate max-w-md">{previewPlan.name}</h3>
                  <p className="text-[11px] text-slate-400">{previewPlan.date} · {(previewPlan.size / 1048576).toFixed(2)} MB</p>
                </div>
                <button onClick={() => setPreviewPlan(null)} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-50">
                {previewPlan.dataUrl && (previewPlan.type.startsWith('image/') || previewPlan.name.match(/\.(png|jpg|jpeg|webp|svg)$/i)) ? (
                  <img src={previewPlan.dataUrl} alt={previewPlan.name} className="max-h-[55vh] object-contain rounded-xl border border-slate-200 shadow" />
                ) : previewPlan.dataUrl && (previewPlan.type.includes('pdf') || previewPlan.name.endsWith('.pdf')) ? (
                  <iframe src={previewPlan.dataUrl} title={previewPlan.name} className="w-full h-[55vh] rounded-xl border border-slate-200" />
                ) : (
                  <div className="text-center p-8">
                    <FileSpreadsheet className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-800">{previewPlan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Archivo técnico listo para descargar y consultar en tu equipo.</p>
                  </div>
                )}
                {previewPlan.note && (
                  <div className="w-full mt-4 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700">
                    <strong>Nota:</strong> {previewPlan.note}
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                {previewPlan.dataUrl ? (
                  <a href={previewPlan.dataUrl} download={previewPlan.name} className="px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Descargar Archivo
                  </a>
                ) : <span />}
                <button onClick={() => setPreviewPlan(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl">Cerrar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE NEW PROJECT */}
      <AnimatePresence>
        {isCreatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
              <form onSubmit={handleCreateNewProject}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-base font-bold">Registrar Nueva Obra</h3>
                  <button type="button" onClick={() => setIsCreatingModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre de la Obra *</label>
                    <input type="text" required value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="Ej: Torres del Parque" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cliente / Comitente</label>
                    <input type="text" value={newProjClient} onChange={e => setNewProjClient(e.target.value)} placeholder="Ej: Fideicomiso San Telmo" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Presupuesto Inicial (ARS)</label>
                    <input type="number" value={newProjBudget} onChange={e => setNewProjBudget(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dirección / Emplazamiento</label>
                    <input type="text" value={newProjAddress} onChange={e => setNewProjAddress(e.target.value)} placeholder="Ej: Av. Costanera 1420" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCreatingModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow">Crear Obra</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
