export type RoleType = 
  | 'super_admin' 
  | 'obra_admin' 
  | 'supervisor' 
  | 'auditor' 
  | 'viewer';

export type ModuleKey = 
  | 'dashboard'
  | 'obras' 
  | 'finanzas' 
  | 'personal' 
  | 'herramientas' 
  | 'planos' 
  | 'reportes' 
  | 'admin'
  | 'inventario'
  | 'costos'
  | 'calculos';

export interface ModulePermission {
  canAccess: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export type UserPermissions = Record<ModuleKey, ModulePermission>;

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: RoleType;
  roleTitle: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  createdAt: string;
  phone?: string;
  permissions: UserPermissions;
}

export type SeverityType = 'info' | 'warning' | 'critical' | 'success';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: ModuleKey;
  details: string;
  timestamp: string;
  severity: SeverityType;
  ipAddress?: string;
  device?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: SeverityType;
  read: boolean;
  module?: ModuleKey;
  actionUrl?: string;
}

export interface Stage {
  id: string;
  name: string;
  pct: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  rate: number;
  days: number;
  phone?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  rate: number;
  days: number;
}

export interface Tool {
  id: string;
  name: string;
  qty: number;
  cost: number;
  kind: 'Propia' | 'Alquilada' | 'Comprada para la obra';
}

export interface Expense {
  id: string;
  date: string;
  concept: string;
  category: string;
  amount: number;
  receiptNumber?: string;
}

export interface Income {
  id: string;
  date: string;
  concept: string;
  amount: number;
}

export interface Note {
  id: string;
  date: string;
  text: string;
  author?: string;
}

export interface PlanFile {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  note?: string;
  dataUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  address: string;
  status: 'Planificada' | 'En curso' | 'Pausada' | 'Terminada';
  start: string;
  end: string;
  budget: number;
  stages: Stage[];
  employees: Employee[];
  vehicles: Vehicle[];
  tools: Tool[];
  expenses: Expense[];
  income: Income[];
  notes: Note[];
  plans: PlanFile[];
}

export type WidgetId = 
  | 'kpi_summary' 
  | 'projects_progress' 
  | 'expenses_distribution' 
  | 'financial_timeline' 
  | 'active_team' 
  | 'activity_stream' 
  | 'critical_alerts';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  description: string;
  visible: boolean;
  width: 'half' | 'full';
  order: number;
}

// INVENTARIO: Herramientas e Insumos
export interface InventoryToolItem {
  id: string;
  nombre: string;
  tipo: string; // Eléctrica, Manual, Batería, Pesada, etc.
  marca: string;
  cantidad: number;
  estado: 'Nueva' | 'Buen estado' | 'Regular' | 'En reparación' | 'Baja';
  observacion: string;
  createdAt: string;
}

export interface InventorySupplyItem {
  id: string;
  nombre: string;
  tipo: string; // Tornillería, Discos de corte, Electrodos, Pintura, Aislación, etc.
  cantidad: number;
  unidad?: string; // un, kg, m, lts, cajas
  marca: string;
  observacion: string;
  createdAt: string;
}

// COSTOS: Servicios, Impuestos, Alquileres, Otros
export type CostCategory = 'servicios' | 'impuestos' | 'alquileres' | 'otros';

export interface CostItem {
  id: string;
  categoria: CostCategory;
  concepto: string;
  empresa: string;
  monto: number;
  vencimiento: string;
  recargo: number;
  pagado: boolean;
  fechaPago?: string;
  observacion?: string;
}

// PERSONAL: Ficha de Personal de la Empresa con Archivos Adjuntos
export interface StaffAttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  note?: string;
  dataUrl?: string;
}

export interface StaffMember {
  id: string;
  nombreApellido: string;
  edad: number;
  dni: string;
  jornal: number;
  observacion: string;
  archivos: StaffAttachedFile[];
  activo: boolean;
  createdAt: string;
}

// MENSAJERÍA Y ASISTENTE IA
export interface AIActionExecution {
  type: 'ADD_TOOLS_AND_STAFF' | 'ADD_TOOL_PROJECT' | 'ADD_STAFF_PROJECT' | 'UPDATE_STAGE' | 'ADD_COST' | 'ADD_INVENTORY_TOOL' | 'ADD_INVENTORY_SUPPLY' | 'QUERY_INFO';
  projectName?: string;
  projectId?: string;
  toolsAdded?: { name: string; quantity: number; source?: string }[];
  staffAdded?: { role: string; count: number; name?: string }[];
  stageUpdated?: { stageName: string; pct: number };
  costAdded?: { category: string; concept: string; amount: number; company: string };
  status: 'executed' | 'denied' | 'error';
  reason?: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRoleTitle?: string;
  recipientId?: string; // Para mensajes directos 1 a 1
  channelId?: string;   // Para canales grupales o IA
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isAi?: boolean;
  priority?: 'normal' | 'importante' | 'urgente';
  projectName?: string;
  actionExecution?: AIActionExecution;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'ai';
  description?: string;
  avatarIcon?: string;
  participants?: string[];
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}
