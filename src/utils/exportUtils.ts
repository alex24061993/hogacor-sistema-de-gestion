import { Project, ActivityLog, User } from '../types';
import { calculateProjectStats, formatCurrency } from './storage';

// Helper to download text file with UTF-8 BOM for Microsoft Excel compatibility
export const downloadCSV = (content: string, filename: string): void => {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportProjectsToExcel = (projects: Project[]): void => {
  const rows: string[][] = [];
  
  // Header Info
  rows.push(['HOGACOR SUITE - INFORME GENERAL DE OBRAS']);
  rows.push([`Generado el: ${new Date().toLocaleString('es-AR')}`]);
  rows.push([]);
  
  // Table Header
  rows.push([
    'ID',
    'Obra / Proyecto',
    'Cliente',
    'Dirección',
    'Estado',
    'Avance Físico (%)',
    'Presupuesto Total (ARS)',
    'Fondos Cobrados (ARS)',
    'Costos Totales (ARS)',
    'Saldo Operativo (ARS)',
    'Ejecución Presupuestaria (%)',
    'Fecha Inicio',
    'Fecha Fin Estimada',
  ]);

  projects.forEach(p => {
    const stats = calculateProjectStats(p);
    rows.push([
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.client.replace(/"/g, '""')}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      p.status,
      `${stats.progressPct}%`,
      `${p.budget}`,
      `${stats.incomeTotal}`,
      `${stats.totalCost}`,
      `${stats.operatingBalance}`,
      `${Math.round(stats.budgetExecutionRatio * 100)}%`,
      p.start || '-',
      p.end || '-',
    ]);
  });

  // Summary Totals
  const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalCost = projects.reduce((acc, p) => acc + calculateProjectStats(p).totalCost, 0);
  const totalIncome = projects.reduce((acc, p) => acc + calculateProjectStats(p).incomeTotal, 0);
  const totalBalance = totalIncome - totalCost;

  rows.push([]);
  rows.push([
    'TOTALES GENERALES',
    '',
    '',
    '',
    '',
    '',
    `${totalBudget}`,
    `${totalIncome}`,
    `${totalCost}`,
    `${totalBalance}`,
    '',
    '',
    '',
  ]);

  const csvString = rows.map(r => r.join(';')).join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvString, `HOGACOR_Informe_Obras_${dateStr}.csv`);
};

export const exportExpensesToExcel = (projects: Project[]): void => {
  const rows: string[][] = [];

  rows.push(['HOGACOR SUITE - DETALLE DE GASTOS Y COSTOS OPERATIVOS']);
  rows.push([`Fecha de Emisión: ${new Date().toLocaleString('es-AR')}`]);
  rows.push([]);

  rows.push([
    'Obra',
    'Fecha Comprobante',
    'N° Comprobante / Factura',
    'Categoría',
    'Concepto',
    'Monto (ARS)',
  ]);

  projects.forEach(p => {
    (p.expenses || []).forEach(ex => {
      rows.push([
        `"${p.name.replace(/"/g, '""')}"`,
        ex.date,
        ex.receiptNumber ? `"${ex.receiptNumber}"` : '-',
        ex.category,
        `"${ex.concept.replace(/"/g, '""')}"`,
        `${ex.amount}`,
      ]);
    });
  });

  const csvString = rows.map(r => r.join(';')).join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvString, `HOGACOR_Gastos_Detallados_${dateStr}.csv`);
};

export const exportAuditLogsToExcel = (logs: ActivityLog[]): void => {
  const rows: string[][] = [];

  rows.push(['HOGACOR SUITE - AUDITORÍA Y SUPERVISIÓN DE ACTIVIDAD DE USUARIOS']);
  rows.push([`Exportado el: ${new Date().toLocaleString('es-AR')}`]);
  rows.push([]);

  rows.push([
    'ID Evento',
    'Fecha y Hora',
    'Usuario',
    'Rol',
    'Módulo Afectado',
    'Acción Realizada',
    'Detalles de la Operación',
    'Severidad',
    'Dirección IP',
    'Dispositivo',
  ]);

  logs.forEach(l => {
    rows.push([
      l.id,
      l.timestamp,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userRole,
      l.module.toUpperCase(),
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.severity.toUpperCase(),
      l.ipAddress || '-',
      l.device || '-',
    ]);
  });

  const csvString = rows.map(r => r.join(';')).join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvString, `HOGACOR_Auditoria_Actividad_${dateStr}.csv`);
};

export const exportUsersToExcel = (users: User[]): void => {
  const rows: string[][] = [];

  rows.push(['HOGACOR SUITE - REPORTE DE USUARIOS Y GESTIÓN DE ACCESOS']);
  rows.push([`Fecha: ${new Date().toLocaleString('es-AR')}`]);
  rows.push([]);

  rows.push([
    'ID',
    'Nombre Completo',
    'Correo Electrónico',
    'Rol Asignado',
    'Departamento',
    'Estado',
    'Última Actividad',
    'Fecha de Registro',
    'Permiso Obras (Acc/Edit)',
    'Permiso Finanzas (Acc/Edit)',
    'Permiso Admin (Acc/Edit)',
  ]);

  users.forEach(u => {
    rows.push([
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.roleTitle,
      `"${u.department.replace(/"/g, '""')}"`,
      u.status.toUpperCase(),
      u.lastActive,
      u.createdAt,
      `${u.permissions.obras?.canAccess ? 'Sí' : 'No'} / ${u.permissions.obras?.canEdit ? 'Sí' : 'No'}`,
      `${u.permissions.finanzas?.canAccess ? 'Sí' : 'No'} / ${u.permissions.finanzas?.canEdit ? 'Sí' : 'No'}`,
      `${u.permissions.admin?.canAccess ? 'Sí' : 'No'} / ${u.permissions.admin?.canEdit ? 'Sí' : 'No'}`,
    ]);
  });

  const csvString = rows.map(r => r.join(';')).join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(csvString, `HOGACOR_Usuarios_Permisos_${dateStr}.csv`);
};

// Generates printable HTML in a dedicated clean window with complete executive styling
export const generatePrintablePDFReport = (
  title: string,
  projects: Project[],
  authorName: string
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor permite ventanas emergentes para abrir el informe de impresión.');
    return;
  }

  const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalCost = projects.reduce((acc, p) => acc + calculateProjectStats(p).totalCost, 0);
  const totalIncome = projects.reduce((acc, p) => acc + calculateProjectStats(p).incomeTotal, 0);
  const totalBalance = totalIncome - totalCost;

  const rowsHtml = projects.map(p => {
    const s = calculateProjectStats(p);
    return `
      <tr>
        <td style="font-weight: 600; color: #0f172a;">${p.name}</td>
        <td>${p.client}</td>
        <td><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0369a1;">${p.status}</span></td>
        <td style="text-align: right; font-weight: 600;">${s.progressPct}%</td>
        <td style="text-align: right;">${formatCurrency(p.budget)}</td>
        <td style="text-align: right; color: #059669;">${formatCurrency(s.incomeTotal)}</td>
        <td style="text-align: right; color: #dc2626;">${formatCurrency(s.totalCost)}</td>
        <td style="text-align: right; font-weight: 700; color: ${s.operatingBalance >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(s.operatingBalance)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>${title} - HOGACOR</title>
      <style>
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 32px;
          background: #ffffff;
          font-size: 13px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-box {
          background: #0d9488;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }
        .brand h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .brand p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }
        .meta {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }
        .meta strong {
          color: #0f172a;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .kpi-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          background: #f8fafc;
        }
        .kpi-card small {
          display: block;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .kpi-card b {
          display: block;
          font-size: 18px;
          margin-top: 4px;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #f1f5f9;
          text-align: left;
          padding: 10px 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          border-top: 1px solid #cbd5e1;
          border-bottom: 1px solid #cbd5e1;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .totals-row td {
          font-weight: 800;
          background: #f8fafc;
          border-top: 2px solid #0f172a;
          border-bottom: 2px solid #0f172a;
        }
        .signatures {
          margin-top: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        .signature-box {
          border-top: 1px dashed #94a3b8;
          padding-top: 8px;
          text-align: center;
          color: #475569;
          font-size: 12px;
        }
        .print-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0d9488;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        @media print {
          .print-btn { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          <div class="logo-box">⚙️</div>
          <div>
            <h1>HOGACOR</h1>
            <p>Plataforma de Ingeniería, Control de Obras y Auditoría</p>
          </div>
        </div>
        <div class="meta">
          <div>Documento: <strong>${title}</strong></div>
          <div>Fecha: <strong>${new Date().toLocaleDateString('es-AR')}</strong></div>
          <div>Emitido por: <strong>${authorName}</strong></div>
          <div>Ref: <strong>DOC-HOG-${Date.now().toString().slice(-6)}</strong></div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <small>Presupuesto Total</small>
          <b>${formatCurrency(totalBudget)}</b>
        </div>
        <div class="kpi-card">
          <small>Cobrado Cliente</small>
          <b style="color: #059669;">${formatCurrency(totalIncome)}</b>
        </div>
        <div class="kpi-card">
          <small>Costos Totales</small>
          <b style="color: #dc2626;">${formatCurrency(totalCost)}</b>
        </div>
        <div class="kpi-card">
          <small>Resultado Neto</small>
          <b style="color: ${totalBalance >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(totalBalance)}</b>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Obra</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th style="text-align: right;">Avance</th>
            <th style="text-align: right;">Presupuesto</th>
            <th style="text-align: right;">Cobrado</th>
            <th style="text-align: right;">Costos</th>
            <th style="text-align: right;">Margen</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="totals-row">
            <td colspan="4">TOTALIZADOR CONSOLIDADO</td>
            <td style="text-align: right;">${formatCurrency(totalBudget)}</td>
            <td style="text-align: right; color: #059669;">${formatCurrency(totalIncome)}</td>
            <td style="text-align: right; color: #dc2626;">${formatCurrency(totalCost)}</td>
            <td style="text-align: right; color: ${totalBalance >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(totalBalance)}</td>
          </tr>
        </tbody>
      </table>

      <div class="signatures">
        <div class="signature-box">
          <strong>Firma Responsable Técnico / Jefe de Obra</strong><br>
          HOGACOR Construcciones
        </div>
        <div class="signature-box">
          <strong>Firma Auditor / Dirección Financiera</strong><br>
          Revisión Contable Oficial
        </div>
      </div>

      <button class="print-btn" onclick="window.print()">Imprimir / Guardar en PDF</button>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
