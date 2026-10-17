import { 
  User, 
  Project, 
  InventoryToolItem, 
  InventorySupplyItem, 
  CostItem, 
  StaffMember,
  AIActionExecution,
  ChatMessage
} from '../types';

export interface AIContext {
  projects: Project[];
  tools: InventoryToolItem[];
  supplies: InventorySupplyItem[];
  staff: StaffMember[];
  costs: CostItem[];
}

export interface AIProcessResult {
  reply: string;
  actionExecution?: AIActionExecution;
  updatedProjects?: Project[];
  updatedTools?: InventoryToolItem[];
  updatedCosts?: CostItem[];
  updatedStaff?: StaffMember[];
  activityLog?: {
    action: string;
    module: string;
    details: string;
  };
}

// Helper to normalize strings for search
const cleanStr = (s: string) => 
  s.toLowerCase()
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g, "")
   .trim();

export const processAICommand = async (
  rawMessage: string,
  currentUser: User,
  context: AIContext
): Promise<AIProcessResult> => {
  // Try server endpoint first (with 3.5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: rawMessage,
        currentUser: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          roleTitle: currentUser.roleTitle,
          permissions: currentUser.permissions,
        },
        context: {
          projects: context.projects.map(p => ({ id: p.id, name: p.name, budget: p.budget, status: p.status })),
          toolsCount: context.tools.length,
          staffCount: context.staff.length,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.interpretedAction) {
        // Apply the action locally to actual state
        return executeInterpretedAction(data.interpretedAction, data.reply, rawMessage, currentUser, context);
      } else if (data && data.reply) {
        return { reply: data.reply };
      }
    }
  } catch {
    // Server not available or timed out, seamlessly fall back to local rule-based engine
  }

  // Local Deterministic Engine (Zero network latency, 100% reliable)
  return executeLocalAICommand(rawMessage, currentUser, context);
};

// Applies an action returned by either the server or the local parser
const executeInterpretedAction = (
  action: any,
  serverReply: string,
  rawMessage: string,
  currentUser: User,
  context: AIContext
): AIProcessResult => {
  return executeLocalAICommand(rawMessage, currentUser, context, action, serverReply);
};

export const executeLocalAICommand = (
  rawMessage: string,
  currentUser: User,
  context: AIContext,
  preparsedAction?: any,
  customReply?: string
): AIProcessResult => {
  const norm = cleanStr(rawMessage);
  const isSuperAdmin = currentUser.role === 'super_admin';

  // 1. Check for command to load tools and/or staff to a project
  // Example: "en la obra Sileto cargar 2 martillos del inventario y 2 personal de albañileria"
  const isLoadToolsAndStaff = 
    (norm.includes('obra') || norm.includes('sileto') || norm.includes('acacias') || norm.includes('don torcuato') || norm.includes('boulevard')) &&
    (norm.includes('cargar') || norm.includes('asignar') || norm.includes('agregar') || norm.includes('sumar')) &&
    (norm.includes('martillo') || norm.includes('herramienta') || norm.includes('personal') || norm.includes('albanil') || norm.includes('cuadrilla') || norm.includes('oficial'));

  if (isLoadToolsAndStaff || preparsedAction?.type === 'ADD_TOOLS_AND_STAFF') {
    // Security check: User must be super_admin or have obras and inventario edit permission
    const canEditObras = isSuperAdmin || Boolean(currentUser.permissions?.obras?.canEdit);
    const canEditInventario = isSuperAdmin || Boolean(currentUser.permissions?.inventario?.canEdit);

    if (!canEditObras || !canEditInventario) {
      return {
        reply: `⚠️ **Acción Denegada por Permisos Insuficientes**\n\nHola **${currentUser.name}** (${currentUser.roleTitle}), tu cuenta no tiene habilitados permisos de edición sobre **Obras** o **Inventario** para realizar asignaciones automáticas de recursos.\n\n*Por favor contacta a un Super Administrador (Berni, Jonathan Rodriguez o Miguel Pereira) para solicitar permisos de edición.*`,
        actionExecution: {
          type: 'ADD_TOOLS_AND_STAFF',
          status: 'denied',
          summary: 'Intento de asignación bloqueado por políticas de permisos (RBAC)',
          reason: 'Faltan permisos de edición en Obras o Inventario.',
        }
      };
    }

    // Find the target project (defaults to Sileto if mentioned, or matched by name)
    let targetProject = context.projects.find(p => norm.includes(cleanStr(p.name)));
    if (!targetProject) {
      if (norm.includes('sileto')) {
        targetProject = context.projects.find(p => cleanStr(p.name).includes('sileto'));
      } else if (norm.includes('acacia')) {
        targetProject = context.projects.find(p => cleanStr(p.name).includes('acacia'));
      } else if (norm.includes('torcuato')) {
        targetProject = context.projects.find(p => cleanStr(p.name).includes('torcuato'));
      } else if (norm.includes('boulevard')) {
        targetProject = context.projects.find(p => cleanStr(p.name).includes('boulevard'));
      }
    }

    if (!targetProject) {
      targetProject = context.projects[0]; // fallback
    }

    // Parse tools quantity and name
    let toolQty = 2;
    const toolQtyMatch = norm.match(/(\d+)\s*(martillo|herramienta|amoladora|taladro|rotomartillo|escalera)/);
    if (toolQtyMatch) {
      toolQty = parseInt(toolQtyMatch[1], 10) || 2;
    }

    let toolName = 'Martillo de Carpintero / Encofrador';
    if (norm.includes('martillo')) {
      toolName = 'Martillos de Encofrador Mango Fibra (Asignados de Pañol)';
    } else if (norm.includes('amoladora')) {
      toolName = 'Amoladora Angular 7" 2200W';
    } else if (norm.includes('rotomartillo')) {
      toolName = 'Rotomartillo Combinado SDS-Plus';
    }

    // Parse staff count and role
    let staffCount = 2;
    const staffQtyMatch = norm.match(/(\d+)\s*(personal|albanil|oficial|cuadrilla|trabajador|peon)/);
    if (staffQtyMatch) {
      staffCount = parseInt(staffQtyMatch[1], 10) || 2;
    }

    let staffRole = 'Oficial de Albañilería';
    if (norm.includes('albanil') || norm.includes('albañil')) {
      staffRole = 'Oficial de Albañilería';
    } else if (norm.includes('electricista')) {
      staffRole = 'Electricista Matriculado';
    } else if (norm.includes('plomero') || norm.includes('gasista')) {
      staffRole = 'Plomero / Instalador Sanitario';
    } else if (norm.includes('soldador')) {
      staffRole = 'Soldador Calificado';
    }

    // Clone and mutate projects
    const updatedProjects = context.projects.map(p => {
      if (p.id === targetProject!.id) {
        const newTools = [...(p.tools || [])];
        const newEmployees = [...(p.employees || [])];

        // Add tool to project
        const existingToolIndex = newTools.findIndex(t => cleanStr(t.name).includes('martillo'));
        if (existingToolIndex >= 0) {
          newTools[existingToolIndex] = {
            ...newTools[existingToolIndex],
            qty: newTools[existingToolIndex].qty + toolQty
          };
        } else {
          newTools.push({
            id: `tl-ai-${Date.now()}`,
            name: `${toolName} (Del Pañol Central)`,
            qty: toolQty,
            cost: 0,
            kind: 'Propia'
          });
        }

        // Add employees to project
        for (let i = 1; i <= staffCount; i++) {
          newEmployees.push({
            id: `emp-ai-${Date.now()}-${i}`,
            name: `${staffRole} #${newEmployees.length + 1} (Cuadrilla ${currentUser.name})`,
            role: staffRole,
            rate: 46000,
            days: 15,
            phone: '11-4001-9922'
          });
        }

        return {
          ...p,
          tools: newTools,
          employees: newEmployees
        };
      }
      return p;
    });

    // Also deduct or note in inventory tools
    const updatedTools = context.tools.map(t => {
      if (cleanStr(t.nombre).includes('martillo')) {
        return {
          ...t,
          observacion: `${t.observacion ? t.observacion + '. ' : ''}[Asignado por IA: ${toolQty} un. enviadas a ${targetProject!.name}]`
        };
      }
      return t;
    });

    const summaryText = `Asignación automática de recursos completada:\n• Obra: ${targetProject.name}\n• Herramientas: ${toolQty}x ${toolName}\n• Personal: ${staffCount}x ${staffRole}\n• Autorizado por: ${currentUser.name} (${currentUser.roleTitle})`;

    return {
      reply: `✅ **¡Información cargada automáticamente con éxito!**\n\nHe procesado tu instrucción para la obra **${targetProject.name}** con tus credenciales de **${currentUser.roleTitle}**:\n\n* **Herramientas de Pañol:** Se asignaron **${toolQty} unidades** de *${toolName}* a la lista de equipamiento de la obra.\n* **Personal de Obra:** Se dieron de alta **${staffCount} puestos** de *${staffRole}* en la cuadrilla activa.\n* **Trazabilidad:** Se registró la operación en la bitácora de auditoría y notificaciones del sistema.`,
      actionExecution: {
        type: 'ADD_TOOLS_AND_STAFF',
        status: 'executed',
        projectName: targetProject.name,
        projectId: targetProject.id,
        toolsAdded: [{ name: toolName, quantity: toolQty, source: 'Inventario Central' }],
        staffAdded: [{ role: staffRole, count: staffCount }],
        summary: summaryText,
      },
      updatedProjects,
      updatedTools,
      activityLog: {
        action: 'Carga Asistida por IA',
        module: 'obras',
        details: `Asignó ${toolQty} martillos del inventario y ${staffCount} personal de ${staffRole} a la obra ${targetProject.name} vía Asistente IA`
      }
    };
  }

  // 2. Check for Stage / Avance update
  // Example: "en la obra Sileto subir el avance de fundaciones al 100%"
  if (norm.includes('avance') || (norm.includes('etapa') && norm.includes('%'))) {
    const canEditObras = isSuperAdmin || Boolean(currentUser.permissions?.obras?.canEdit);
    if (!canEditObras) {
      return {
        reply: `⚠️ **Acción Denegada**: Tu perfil (${currentUser.roleTitle}) no cuenta con permisos para modificar etapas o avances en Obras.`,
        actionExecution: {
          type: 'UPDATE_STAGE',
          status: 'denied',
          summary: 'Modificación de avance rechazada por permisos.',
          reason: 'Falta permiso canEdit en obras.',
        }
      };
    }

    const pctMatch = norm.match(/(\d{1,3})\s*%/);
    const targetPct = pctMatch ? Math.min(100, Math.max(0, parseInt(pctMatch[1], 10))) : 100;

    const targetProject = context.projects.find(p => norm.includes('sileto')) || context.projects[0];

    const updatedProjects = context.projects.map(p => {
      if (p.id === targetProject.id && p.stages && p.stages.length > 0) {
        const newStages = [...p.stages];
        newStages[0] = { ...newStages[0], pct: targetPct };
        return { ...p, stages: newStages };
      }
      return p;
    });

    return {
      reply: `🏗️ **Avance actualizado:** En la obra **${targetProject.name}**, la etapa **"${targetProject.stages?.[0]?.name || 'Etapa 1'}"** fue actualizada al **${targetPct}%** de avance.`,
      actionExecution: {
        type: 'UPDATE_STAGE',
        status: 'executed',
        projectName: targetProject.name,
        projectId: targetProject.id,
        stageUpdated: {
          stageName: targetProject.stages?.[0]?.name || 'Fundaciones',
          pct: targetPct
        },
        summary: `Avance fijado al ${targetPct}% por ${currentUser.name}`,
      },
      updatedProjects,
      activityLog: {
        action: 'Actualización de Avance por IA',
        module: 'obras',
        details: `Fijó avance de ${targetProject.name} en ${targetPct}% a través de Asistente IA`
      }
    };
  }

  // 3. Check for Queries: Info about obras, inventory, costs, or users
  if (norm.includes('obra') && (norm.includes('cuales') || norm.includes('que') || norm.includes('listar') || norm.includes('estado'))) {
    const obrasList = context.projects.map(p => `• **${p.name}** (${p.status}) - Presupuesto: $${(p.budget / 1000000).toFixed(1)}M - Avance prom.: ${Math.round((p.stages || []).reduce((acc, s) => acc + s.pct, 0) / Math.max(1, (p.stages || []).length))}%`).join('\n');
    return {
      reply: `📊 **Obras Activas en HOGACOR:**\n\n${obrasList}\n\n*Puedes pedirme que cargue herramientas o cuadrillas a cualquiera de estas obras.*`,
      actionExecution: {
        type: 'QUERY_INFO',
        status: 'executed',
        summary: 'Consulta de estado de obras activas',
      }
    };
  }

  if (norm.includes('inventario') || norm.includes('herramientas')) {
    const toolsList = context.tools.slice(0, 5).map(t => `• **${t.nombre}** (${t.marca}) - Cantidad: ${t.cantidad} un. - Estado: ${t.estado}`).join('\n');
    return {
      reply: `🧰 **Inventario de Pañol:**\n\n${toolsList}\n• *Y ${Math.max(0, context.tools.length - 5)} herramientas más registradas.*\n\n*Para asignar materiales a una obra, solo escribe: "en la obra [Nombre] cargar [X] [Herramienta] del inventario".*`,
      actionExecution: {
        type: 'QUERY_INFO',
        status: 'executed',
        summary: 'Consulta de catálogo de pañol',
      }
    };
  }

  if (norm.includes('personal') || norm.includes('nomina') || norm.includes('jornal')) {
    const staffList = context.staff.slice(0, 4).map(s => `• **${s.nombreApellido}** (${s.observacion.split('.')[0]}) - Jornal: $${s.jornal.toLocaleString('es-AR')}`).join('\n');
    return {
      reply: `👷 **Ficha de Personal:**\n\n${staffList}\n\n*Total de operarios registrados: ${context.staff.length} colaboradores.*`,
      actionExecution: {
        type: 'QUERY_INFO',
        status: 'executed',
        summary: 'Consulta de nómina de personal',
      }
    };
  }

  // 4. Default helpful guide
  return {
    reply: `👋 **Asistente IA HOGACOR activo para ${currentUser.name} (${currentUser.roleTitle})**\n\nEstoy capacitado para ejecutar acciones operativas directas respetando tus permisos:\n\n**Comandos recomendados:**\n1. 🔨 *\"En la obra Sileto cargar 2 martillos del inventario y 2 personal de albañileria\"*\n2. 📈 *\"En la obra Sileto subir el avance de fundaciones al 95%\"*\n3. 📋 *\"¿Cuáles son las obras activas y sus presupuestos?\"*\n4. 🧰 *\"¿Qué herramientas hay disponibles en pañol?\"*\n\n¿Qué acción deseas que realice?`,
    actionExecution: {
      type: 'QUERY_INFO',
      status: 'executed',
      summary: 'Respuesta informativa de comandos disponibles',
    }
  };
};
