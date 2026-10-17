import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'app_state.json');

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // GET /api/state - Loads persistent application state across all browsers and sessions
  app.get('/api/state', (req, res) => {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const content = fs.readFileSync(STATE_FILE, 'utf-8');
        const data = JSON.parse(content);
        return res.json({ success: true, data });
      }
      return res.json({ success: true, data: null });
    } catch (err: any) {
      console.error('Error reading app_state.json:', err);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // POST /api/state - Saves persistent application state to server disk
  app.post('/api/state', (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid state payload' });
      }
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      return res.json({ success: true, savedAt: new Date().toISOString() });
    } catch (err: any) {
      console.error('Error writing app_state.json:', err);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Gemini AI Assistant Endpoint
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { message, currentUser, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

      if (!apiKey) {
        return res.json({ 
          status: 'fallback', 
          message: 'No API key configured on server, using local engine' 
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Eres el Asistente Inteligente de la plataforma de ingeniería y constructora HOGACOR Suite.
El usuario autenticado es:
- Nombre: ${currentUser?.name}
- Rol: ${currentUser?.role}
- Cargo: ${currentUser?.roleTitle}
- Permisos: ${JSON.stringify(currentUser?.permissions || {})}

Contexto de Obras del sistema:
${JSON.stringify(context?.projects || [])}

Mensaje del usuario:
"${message}"

INSTRUCCIONES DE PERMISOS:
- Si el usuario solicita modificar obras, asignar personal, cargar herramientas o alterar finanzas:
  * Si su rol es 'super_admin' o tiene permiso canEdit en obras/inventario: TIENE AUTORIZACIÓN TOTAL.
  * Si NO tiene permisos suficientes: DEBES DENEGAR LA ACCIÓN educadamente explicando que su perfil (${currentUser?.roleTitle}) no cuenta con privilegios de edición.

Si tiene permiso y pide cargar recursos (ejemplo: "en la obra Sileto cargar 2 martillos del inventario y 2 personal de albañileria"):
Responde con un JSON estructurado con el formato:
{
  "interpretedAction": {
    "type": "ADD_TOOLS_AND_STAFF",
    "projectName": "Edificio Residencial Sileto",
    "tools": [{"name": "Martillos de Encofrador Mango Fibra", "quantity": 2}],
    "staff": [{"role": "Oficial de Albañilería", "count": 2}]
  },
  "reply": "Respuesta en español explicando la asignación con tono técnico constructivo y profesional."
}

Si es una consulta informativa o denegación, responde con { "reply": "Tu respuesta detallada" }.
Devuelve EXCLUSIVAMENTE el JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json(parsed);
      } catch {
        return res.json({ reply: text });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back:', err?.message || err);
      return res.status(200).json({ status: 'fallback', error: err?.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`HOGACOR Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
