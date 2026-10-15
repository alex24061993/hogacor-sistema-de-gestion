import React, { useState, useEffect } from 'react';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getCurrentUserId, 
  saveCurrentUserId, 
  getStoredProjects, 
  saveStoredProjects, 
  getStoredLogs, 
  saveStoredLogs, 
  getStoredNotifications, 
  saveStoredNotifications, 
  getStoredWidgets, 
  saveStoredWidgets,
  getStoredInventoryTools,
  saveStoredInventoryTools,
  getStoredInventorySupplies,
  saveStoredInventorySupplies,
  getStoredCosts,
  saveStoredCosts,
  getStoredStaff,
  saveStoredStaff
} from './utils/storage';
import { 
  User, 
  Project, 
  ActivityLog, 
  SystemNotification, 
  WidgetConfig, 
  ModuleKey,
  InventoryToolItem,
  InventorySupplyItem,
  CostItem,
  StaffMember
} from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { ProjectsView } from './components/ProjectsView';
import { ReportsView } from './components/ReportsView';
import { InventoryView } from './components/InventoryView';
import { CostsView } from './components/CostsView';
import { StaffView } from './components/StaffView';
import { AuthModal } from './components/AuthModal';
import { NotificationToast } from './components/NotificationToast';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(getCurrentUserId);
  const [projects, setProjects] = useState<Project[]>(getStoredProjects);
  const [logs, setLogs] = useState<ActivityLog[]>(getStoredLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(getStoredNotifications);

  // Inventario, Costos & Personal State
  const [tools, setTools] = useState<InventoryToolItem[]>(getStoredInventoryTools);
  const [supplies, setSupplies] = useState<InventorySupplyItem[]>(getStoredInventorySupplies);
  const [costs, setCosts] = useState<CostItem[]>(getStoredCosts);
  const [staff, setStaff] = useState<StaffMember[]>(getStoredStaff);
  
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(() => getStoredWidgets(currentUser.id));

  // Gatekeeper: Require user login before showing any platform information
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hogacor_auth_session') === 'true';
    } catch {
      return false;
    }
  });

  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveCurrentUserId(currentUserId);
    setWidgetConfigs(getStoredWidgets(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveStoredInventoryTools(tools);
  }, [tools]);

  useEffect(() => {
    saveStoredInventorySupplies(supplies);
  }, [supplies]);

  useEffect(() => {
    saveStoredCosts(costs);
  }, [costs]);

  useEffect(() => {
    saveStoredStaff(staff);
  }, [staff]);

  // Log activity helper
  const addActivityLog = (
    action: string,
    module: ModuleKey,
    details: string,
    severity: 'info' | 'warning' | 'critical' | 'success' = 'info'
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      action,
      module,
      details,
      timestamp: 'Ahora mismo',
      severity,
      ipAddress: '190.220.14.33',
      device: 'Cliente Web',
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Trigger system notification helper
  const triggerNotification = (
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'critical' | 'success',
    module?: ModuleKey
  ) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Ahora mismo',
      severity,
      read: false,
      module,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Simulate critical event
  const simulateCriticalEvent = () => {
    const sampleEvents = [
      {
        title: 'Desvío de Presupuesto Crítico',
        message: 'El Complejo Residencial Las Acacias superó el 85% de costos proyectados en la partida de Hormigón.',
        severity: 'critical' as const,
        action: 'Alerta Presupuestaria Activada',
        module: 'finanzas' as ModuleKey,
      },
      {
        title: 'Intento de Acceso No Autorizado',
        message: 'Se detectó y bloqueó un intento de edición de privilegios administrativos sin credencial de Super Admin.',
        severity: 'warning' as const,
        action: 'Bloqueo de Seguridad',
        module: 'admin' as ModuleKey,
      },
      {
        title: 'Inspección de Obra Aprobada',
        message: 'La Dirección de Obras Particulares aprobó el certificado de avance de estructura metálica.',
        severity: 'success' as const,
        action: 'Hito Aprobado',
        module: 'obras' as ModuleKey,
      },
      {
        title: 'Certificado de Cómputo Emitido',
        message: 'Se generó un nuevo informe contable con firmas electrónicas de los inspectores asignados.',
        severity: 'info' as const,
        action: 'Emisión Documental',
        module: 'reportes' as ModuleKey,
      },
    ];

    const randomEvt = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
    triggerNotification(randomEvt.title, randomEvt.message, randomEvt.severity, randomEvt.module);
    addActivityLog(randomEvt.action, randomEvt.module, randomEvt.message, randomEvt.severity);
  };

  // Notifications handlers
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDismissToast = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // User management handlers
  const handleSelectUser = (id: string) => {
    setCurrentUserId(id);
    const u = users.find(x => x.id === id);
    if (u) {
      addActivityLog('Cambio de Sesión Activa', 'admin', `Inició sesión activa como ${u.name} (${u.roleTitle})`, 'info');
    }
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    addActivityLog('Nueva Cuenta Registrada', 'admin', `Se registró la cuenta de ${newUser.name} con rol ${newUser.roleTitle}`, 'success');
    triggerNotification('Nuevo Usuario en el Sistema', `Se registró ${newUser.name} asignado al área ${newUser.department}.`, 'info', 'admin');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    addActivityLog('Actualización de Privilegios / Cuenta', 'admin', `Se modificaron los datos o permisos de ${updatedUser.name}`, 'warning');
    triggerNotification('Permisos Modificados', `Se actualizaron los privilegios de ${updatedUser.name}.`, 'warning', 'admin');
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (target) {
      addActivityLog('Baja de Cuenta de Usuario', 'admin', `Se eliminó del sistema la cuenta de ${target.name}`, 'warning');
    }
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPass } : u)));
    addActivityLog('Actualización de Contraseña', 'admin', `El usuario ${currentUser.name} actualizó su contraseña de acceso`, 'info');
    triggerNotification('Contraseña Actualizada', 'Tu contraseña de acceso fue actualizada correctamente.', 'success', 'admin');
  };

  // Project handlers
  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    addActivityLog('Actualización de Obra', 'obras', `Se modificaron datos o avances en ${updated.name}`, 'info');
  };

  const handleCreateProject = (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);
    addActivityLog('Creación de Obra', 'obras', `Se registró la obra ${newProj.name} con presupuesto ${newProj.budget}`, 'success');
    triggerNotification('Nueva Obra Registrada', `Se dio de alta el proyecto ${newProj.name}.`, 'success', 'obras');
  };

  const handleDeleteProject = (id: string) => {
    const target = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (target) {
      addActivityLog('Eliminación de Obra', 'obras', `Se eliminó el proyecto ${target.name}`, 'warning');
    }
  };

  // Inventory, Costs and Staff Handlers
  const handleUpdateTools = (newTools: InventoryToolItem[]) => {
    setTools(newTools);
    addActivityLog('Actualización de Herramientas', 'inventario', 'Se modificó el inventario de herramientas de obra', 'info');
  };

  const handleUpdateSupplies = (newSupplies: InventorySupplyItem[]) => {
    setSupplies(newSupplies);
    addActivityLog('Actualización de Insumos', 'inventario', 'Se actualizó el stock de insumos y consumibles de pañol', 'info');
  };

  const handleUpdateCosts = (newCosts: CostItem[]) => {
    setCosts(newCosts);
    addActivityLog('Gestión de Costos', 'costos', 'Se modificó el registro de servicios, impuestos, alquileres u otros costos', 'info');
  };

  const handleUpdateStaff = (newStaff: StaffMember[]) => {
    setStaff(newStaff);
    addActivityLog('Actualización de Personal', 'personal', 'Se actualizó la nómina de colaboradores y legajos digitales', 'info');
  };

  // Widgets update handler
  const handleUpdateWidgetConfigs = (configs: WidgetConfig[]) => {
    setWidgetConfigs(configs);
    saveStoredWidgets(currentUser.id, configs);
    addActivityLog('Personalización de Dashboard', 'dashboard', 'Reorganizó los widgets y métricas de pantalla', 'info');
  };

  const handleLoginSuccess = (userId: string) => {
    setCurrentUserId(userId);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('hogacor_auth_session', 'true');
    } catch {}
    const u = users.find(x => x.id === userId);
    if (u) {
      addActivityLog('Inicio de Sesión', 'admin', `El usuario ${u.name} inició sesión en la plataforma`, 'info');
      triggerNotification('Sesión Iniciada', `Bienvenido al sistema, ${u.name}.`, 'info', 'admin');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('hogacor_auth_session');
    } catch {}
    addActivityLog('Cierre de Sesión', 'admin', `El usuario ${currentUser.name} cerró su sesión`, 'info');
  };

  const handleNavigateTo = (module: string, projectId?: string) => {
    setActiveNav(module);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  // Require user authentication before showing any data
  if (!isAuthenticated) {
    return (
      <LoginScreen
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Floating Animated Toasts for Real-Time Alerts */}
      <NotificationToast
        notifications={notifications}
        onDismiss={handleDismissToast}
      />

      {/* Top Bar with Brand, Nav Links and Account Switcher */}
      <Header
        currentUser={currentUser}
        activeNav={activeNav}
        onNavigate={setActiveNav}
        notifications={notifications}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearNotifications}
        onToggleRead={handleToggleRead}
        onSimulateEvent={simulateCriticalEvent}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeNav === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            projects={projects}
            logs={logs}
            notifications={notifications}
            widgetConfigs={widgetConfigs}
            onUpdateWidgetConfigs={handleUpdateWidgetConfigs}
            onNavigateTo={handleNavigateTo}
            onSimulateEvent={simulateCriticalEvent}
          />
        )}

        {activeNav === 'obras' && (
          <ProjectsView
            currentUser={currentUser}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onUpdateProject={handleUpdateProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {activeNav === 'inventario' && (
          <InventoryView
            currentUser={currentUser}
            tools={tools}
            supplies={supplies}
            onUpdateTools={handleUpdateTools}
            onUpdateSupplies={handleUpdateSupplies}
          />
        )}

        {activeNav === 'costos' && (
          <CostsView
            currentUser={currentUser}
            costs={costs}
            onUpdateCosts={handleUpdateCosts}
          />
        )}

        {activeNav === 'personal' && (
          <StaffView
            currentUser={currentUser}
            staff={staff}
            onUpdateStaff={handleUpdateStaff}
          />
        )}

        {activeNav === 'reportes' && (
          <ReportsView
            currentUser={currentUser}
            projects={projects}
            logs={logs}
            users={users}
          />
        )}

        {activeNav === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            users={users}
            logs={logs}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleRegisterUser}
            onSimulateLog={simulateCriticalEvent}
          />
        )}
      </main>

      {/* Auth & Profile Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUserId={currentUserId}
        onSelectUser={handleSelectUser}
        onUpdateUserPassword={handleUpdateUserPassword}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">HOGACOR Suite</span>
            <span aria-hidden="true">·</span>
            <span>Seguimiento de Obras & Control Administrativo</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono-numbers">
            <span>Sesión: {currentUser.name} ({currentUser.roleTitle})</span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-700 font-semibold">Sistema Operativo Conectado</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
