import { 
  User, 
  UserPermissions, 
  Project, 
  ActivityLog, 
  SystemNotification, 
  WidgetConfig, 
  RoleType,
  InventoryToolItem,
  InventorySupplyItem,
  CostItem,
  StaffMember,
  ChatMessage,
  ChatChannel
} from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, UserPermissions> = {
  super_admin: {
    dashboard: { canAccess: true, canEdit: true, canDelete: true },
    obras: { canAccess: true, canEdit: true, canDelete: true },
    finanzas: { canAccess: true, canEdit: true, canDelete: true },
    personal: { canAccess: true, canEdit: true, canDelete: true },
    herramientas: { canAccess: true, canEdit: true, canDelete: true },
    planos: { canAccess: true, canEdit: true, canDelete: true },
    reportes: { canAccess: true, canEdit: true, canDelete: true },
    admin: { canAccess: true, canEdit: true, canDelete: true },
    inventario: { canAccess: true, canEdit: true, canDelete: true },
    costos: { canAccess: true, canEdit: true, canDelete: true },
    calculos: { canAccess: true, canEdit: true, canDelete: true },
  },
  obra_admin: {
    dashboard: { canAccess: true, canEdit: true, canDelete: false },
    obras: { canAccess: true, canEdit: true, canDelete: true },
    finanzas: { canAccess: true, canEdit: true, canDelete: false },
    personal: { canAccess: true, canEdit: true, canDelete: true },
    herramientas: { canAccess: true, canEdit: true, canDelete: true },
    planos: { canAccess: true, canEdit: true, canDelete: true },
    reportes: { canAccess: true, canEdit: true, canDelete: false },
    admin: { canAccess: false, canEdit: false, canDelete: false },
    inventario: { canAccess: true, canEdit: true, canDelete: true },
    costos: { canAccess: true, canEdit: true, canDelete: false },
    calculos: { canAccess: true, canEdit: true, canDelete: true },
  },
  supervisor: {
    dashboard: { canAccess: true, canEdit: false, canDelete: false },
    obras: { canAccess: true, canEdit: true, canDelete: false },
    finanzas: { canAccess: false, canEdit: false, canDelete: false },
    personal: { canAccess: true, canEdit: true, canDelete: false },
    herramientas: { canAccess: true, canEdit: true, canDelete: false },
    planos: { canAccess: true, canEdit: false, canDelete: false },
    reportes: { canAccess: false, canEdit: false, canDelete: false },
    admin: { canAccess: false, canEdit: false, canDelete: false },
    inventario: { canAccess: true, canEdit: true, canDelete: false },
    costos: { canAccess: false, canEdit: false, canDelete: false },
    calculos: { canAccess: true, canEdit: false, canDelete: false },
  },
  auditor: {
    dashboard: { canAccess: true, canEdit: false, canDelete: false },
    obras: { canAccess: true, canEdit: false, canDelete: false },
    finanzas: { canAccess: true, canEdit: true, canDelete: false },
    personal: { canAccess: true, canEdit: false, canDelete: false },
    herramientas: { canAccess: true, canEdit: false, canDelete: false },
    planos: { canAccess: true, canEdit: false, canDelete: false },
    reportes: { canAccess: true, canEdit: true, canDelete: false },
    admin: { canAccess: false, canEdit: false, canDelete: false },
    inventario: { canAccess: true, canEdit: false, canDelete: false },
    costos: { canAccess: true, canEdit: true, canDelete: false },
    calculos: { canAccess: true, canEdit: false, canDelete: false },
  },
  viewer: {
    dashboard: { canAccess: true, canEdit: false, canDelete: false },
    obras: { canAccess: true, canEdit: false, canDelete: false },
    finanzas: { canAccess: false, canEdit: false, canDelete: false },
    personal: { canAccess: false, canEdit: false, canDelete: false },
    herramientas: { canAccess: false, canEdit: false, canDelete: false },
    planos: { canAccess: true, canEdit: false, canDelete: false },
    reportes: { canAccess: false, canEdit: false, canDelete: false },
    admin: { canAccess: false, canEdit: false, canDelete: false },
    inventario: { canAccess: true, canEdit: false, canDelete: false },
    costos: { canAccess: false, canEdit: false, canDelete: false },
    calculos: { canAccess: true, canEdit: false, canDelete: false },
  },
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-berni',
    name: 'Berni',
    email: 'berni@hogacor.com',
    password: '123456789',
    role: 'super_admin',
    roleTitle: 'Senior Developer',
    department: 'Desarrollo & Sistemas',
    status: 'active',
    lastActive: 'En línea ahora',
    createdAt: '2025-01-10',
    phone: '+54 9 11 4001-8899',
    permissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS.super_admin)),
  },
  {
    id: 'usr-jonathan',
    name: 'Jonathan Rodriguez',
    email: 'jonathan.rodriguez@hogacor.com',
    password: '123456789',
    role: 'super_admin',
    roleTitle: 'Director General',
    department: 'Dirección General',
    status: 'active',
    lastActive: 'Hace 5 minutos',
    createdAt: '2025-01-12',
    phone: '+54 9 11 5522-3344',
    permissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS.super_admin)),
  },
  {
    id: 'usr-miguel',
    name: 'Miguel Pereira',
    email: 'miguel.pereira@hogacor.com',
    password: '123456789',
    role: 'super_admin',
    roleTitle: 'Director General',
    department: 'Dirección General',
    status: 'active',
    lastActive: 'Hace 15 minutos',
    createdAt: '2025-01-15',
    phone: '+54 9 11 6633-4455',
    permissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS.super_admin)),
  },
  {
    id: 'usr-supervisor',
    name: 'Supervisor',
    email: 'supervisor@hogacor.com',
    password: '123456789',
    role: 'obra_admin',
    roleTitle: 'Jefe de Obras',
    department: 'Ingeniería y Operaciones de Terreno',
    status: 'active',
    lastActive: 'Hace 20 minutos',
    createdAt: '2025-02-01',
    phone: '+54 9 11 7744-5566',
    permissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS.obra_admin)),
  },
];

// Clean state: All dummy project data removed
export const INITIAL_PROJECTS: Project[] = [];

// Clean state: Activity Logs
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-clean-1',
    userId: 'usr-berni',
    userName: 'Berni',
    userRole: 'Senior Developer',
    action: 'Plataforma HOGACOR Lista',
    module: 'admin',
    details: 'Base de datos limpia y suite de cálculo estructural CIRSOC operativa.',
    timestamp: new Date().toISOString(),
    severity: 'success',
  },
];

// Clean state: Notifications
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-clean-1',
    title: 'Bienvenido a HOGACOR',
    message: 'Base de datos inicializada. Puedes registrar nuevas obras, pañol y utilizar la suite de Cálculos.',
    timestamp: new Date().toISOString(),
    severity: 'info',
    read: false,
    module: 'admin',
  },
];

export const DEFAULT_WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'kpi_summary', title: 'Métricas Generales', description: 'Resumen ejecutivo de obras y finanzas', visible: true, width: 'full', order: 1 },
  { id: 'projects_progress', title: 'Estado y Avance de Obras', description: 'Progreso de proyectos activos', visible: true, width: 'half', order: 2 },
  { id: 'financial_timeline', title: 'Flujo Financiero', description: 'Ingresos vs Costos consolidados', visible: true, width: 'half', order: 3 },
  { id: 'activity_stream', title: 'Auditoría de Actividad', description: 'Registro de cambios del personal', visible: true, width: 'half', order: 4 },
  { id: 'critical_alerts', title: 'Alertas & Notificaciones', description: 'Alertas tempranas del sistema', visible: true, width: 'half', order: 5 },
];

// Clean state: Inventory
export const INITIAL_INVENTORY_TOOLS: InventoryToolItem[] = [];
export const INITIAL_INVENTORY_SUPPLIES: InventorySupplyItem[] = [];

// Clean state: Costs & Staff
export const INITIAL_COSTS: CostItem[] = [];
export const INITIAL_STAFF: StaffMember[] = [];

// Channels & Messages
export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'chan-general',
    name: '🏢 Canal General HOGACOR',
    type: 'group',
    description: 'Comunicaciones directas entre Dirección, Desarrolladores y Jefatura de Obras',
    avatarIcon: 'building',
    lastMessage: 'Sistema listo para recibir comunicaciones internas.',
    lastMessageTime: 'Ahora',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
