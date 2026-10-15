import { 
  User, 
  Project, 
  ActivityLog, 
  SystemNotification, 
  WidgetConfig,
  InventoryToolItem,
  InventorySupplyItem,
  CostItem,
  StaffMember
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PROJECTS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_WIDGET_CONFIGS,
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_INVENTORY_TOOLS,
  INITIAL_INVENTORY_SUPPLIES,
  INITIAL_COSTS,
  INITIAL_STAFF
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'hogacor_users_v4',
  CURRENT_USER_ID: 'hogacor_current_user_id_v4',
  PROJECTS: 'hogacor_projects_v2',
  LOGS: 'hogacor_logs_v2',
  NOTIFICATIONS: 'hogacor_notifications_v2',
  WIDGETS: 'hogacor_widgets_v2',
  INVENTORY_TOOLS: 'hogacor_inv_tools_v1',
  INVENTORY_SUPPLIES: 'hogacor_inv_supplies_v1',
  COSTS: 'hogacor_costs_v1',
  STAFF: 'hogacor_staff_v1',
};

export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed: User[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(u => {
          const roleDefaults = DEFAULT_ROLE_PERMISSIONS[u.role] || DEFAULT_ROLE_PERMISSIONS.obra_admin;
          const mergedPerms = {
            ...roleDefaults,
            ...(u.permissions || {}),
          };

          // Guarantee costos and inventario permissions exist
          if (!mergedPerms.costos) {
            mergedPerms.costos = roleDefaults.costos ? { ...roleDefaults.costos } : { canAccess: true, canEdit: true, canDelete: true };
          }
          if (!mergedPerms.inventario) {
            mergedPerms.inventario = roleDefaults.inventario ? { ...roleDefaults.inventario } : { canAccess: true, canEdit: true, canDelete: true };
          }

          // Super admin always has full permissions on all modules without exception
          if (u.role === 'super_admin') {
            mergedPerms.costos = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.inventario = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.personal = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.obras = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.dashboard = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.finanzas = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.herramientas = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.planos = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.reportes = { canAccess: true, canEdit: true, canDelete: true };
            mergedPerms.admin = { canAccess: true, canEdit: true, canDelete: true };
          }

          return {
            ...u,
            password: u.password || '123456789',
            permissions: mergedPerms,
          };
        });
      }
    }
  } catch (e) {
    console.error('Error loading users from storage', e);
  }
  return INITIAL_USERS;
};

export const saveStoredUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage', e);
  }
};

export const getCurrentUserId = (): string => {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (id) return id;
  } catch (e) {
    console.error('Error getting current user id', e);
  }
  return INITIAL_USERS[0].id;
};

export const saveCurrentUserId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  } catch (e) {
    console.error('Error saving current user id', e);
  }
};

export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading projects from storage', e);
  }
  return INITIAL_PROJECTS;
};

export const saveStoredProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects to storage', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading logs from storage', e);
  }
  return INITIAL_ACTIVITY_LOGS;
};

export const saveStoredLogs = (logs: ActivityLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs to storage', e);
  }
};

export const getStoredNotifications = (): SystemNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading notifications from storage', e);
  }
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifications: SystemNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications to storage', e);
  }
};

export const getStoredWidgets = (userId: string): WidgetConfig[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.WIDGETS}_${userId}`);
    if (raw) return JSON.parse(raw);
    const globalRaw = localStorage.getItem(STORAGE_KEYS.WIDGETS);
    if (globalRaw) return JSON.parse(globalRaw);
  } catch (e) {
    console.error('Error loading widgets from storage', e);
  }
  return DEFAULT_WIDGET_CONFIGS;
};

export const saveStoredWidgets = (userId: string, configs: WidgetConfig[]): void => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.WIDGETS}_${userId}`, JSON.stringify(configs));
    localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(configs));
  } catch (e) {
    console.error('Error saving widgets to storage', e);
  }
};

// INVENTORY: Tools
export const getStoredInventoryTools = (): InventoryToolItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_TOOLS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading inventory tools', e);
  }
  return INITIAL_INVENTORY_TOOLS;
};

export const saveStoredInventoryTools = (items: InventoryToolItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_TOOLS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving inventory tools', e);
  }
};

// INVENTORY: Supplies
export const getStoredInventorySupplies = (): InventorySupplyItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_SUPPLIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading inventory supplies', e);
  }
  return INITIAL_INVENTORY_SUPPLIES;
};

export const saveStoredInventorySupplies = (items: InventorySupplyItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_SUPPLIES, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving inventory supplies', e);
  }
};

// COSTS
export const getStoredCosts = (): CostItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COSTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading costs', e);
  }
  return INITIAL_COSTS;
};

export const saveStoredCosts = (items: CostItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving costs', e);
  }
};

// STAFF
export const getStoredStaff = (): StaffMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading staff', e);
  }
  return INITIAL_STAFF;
};

export const saveStoredStaff = (items: StaffMember[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving staff', e);
  }
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const formatCompactNumber = (val: number): string => {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return `$${val}`;
};

export interface ProjectCalculatedStats {
  laborCost: number;
  vehicleCost: number;
  toolCost: number;
  expenseCost: number;
  totalCost: number;
  incomeTotal: number;
  progressPct: number;
  operatingBalance: number;
  budgetExecutionRatio: number;
  pendingToCollect: number;
  categoryBreakdown: Record<string, number>;
}

export const calculateProjectStats = (p: Project): ProjectCalculatedStats => {
  const laborCost = (p.employees || []).reduce((acc, e) => acc + (Number(e.rate) || 0) * (Number(e.days) || 0), 0);
  const vehicleCost = (p.vehicles || []).reduce((acc, v) => acc + (Number(v.rate) || 0) * (Number(v.days) || 0), 0);
  const toolCost = (p.tools || []).reduce((acc, t) => acc + (Number(t.qty) || 0) * (Number(t.cost) || 0), 0);
  const expenseCost = (p.expenses || []).reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0);
  const incomeTotal = (p.income || []).reduce((acc, inc) => acc + (Number(inc.amount) || 0), 0);

  const totalCost = laborCost + vehicleCost + toolCost + expenseCost;
  const budget = Number(p.budget) || 0;

  const categoryBreakdown: Record<string, number> = {
    'Mano de obra': laborCost,
    'Vehículos y transporte': vehicleCost,
    'Herramientas y equipos': toolCost,
  };

  (p.expenses || []).forEach(ex => {
    const cat = ex.category || 'Otros';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (Number(ex.amount) || 0);
  });

  const progressPct = p.stages && p.stages.length > 0
    ? Math.round(p.stages.reduce((acc, s) => acc + (Number(s.pct) || 0), 0) / p.stages.length)
    : 0;

  const operatingBalance = incomeTotal - totalCost;
  const budgetExecutionRatio = budget > 0 ? totalCost / budget : 0;
  const pendingToCollect = Math.max(0, budget - incomeTotal);

  return {
    laborCost,
    vehicleCost,
    toolCost,
    expenseCost,
    totalCost,
    incomeTotal,
    progressPct,
    operatingBalance,
    budgetExecutionRatio,
    pendingToCollect,
    categoryBreakdown,
  };
};
