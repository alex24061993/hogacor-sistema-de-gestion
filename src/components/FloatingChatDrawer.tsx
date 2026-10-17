import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Wrench, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { 
  User, 
  Project, 
  InventoryToolItem, 
  InventorySupplyItem, 
  CostItem, 
  StaffMember, 
  ChatMessage, 
  ChatChannel 
} from '../types';
import { processAICommand, AIContext } from '../utils/aiAssistant';

interface FloatingChatDrawerProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  tools: InventoryToolItem[];
  supplies: InventorySupplyItem[];
  staff: StaffMember[];
  costs: CostItem[];
  chatMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateTools: (tools: InventoryToolItem[]) => void;
  onNavigate: (module: string) => void;
}

export const FloatingChatDrawer: React.FC<FloatingChatDrawerProps> = ({
  currentUser,
  users,
  projects,
  tools,
  supplies,
  staff,
  costs,
  chatMessages,
  onSendMessage,
  onUpdateProjects,
  onUpdateTools,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for AI assistant
  const aiMessages = chatMessages.filter(m => m.channelId === 'chan-ai');

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, aiMessages, isProcessing]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRoleTitle: currentUser.roleTitle,
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      channelId: 'chan-ai',
    };

    onSendMessage(userMessage);
    if (!customPrompt) setInputText('');
    setIsProcessing(true);

    try {
      const aiContext: AIContext = {
        projects,
        tools,
        supplies,
        staff,
        costs,
      };

      const result = await processAICommand(textToSend.trim(), currentUser, aiContext);

      if (result.updatedProjects) {
        onUpdateProjects(result.updatedProjects);
      }
      if (result.updatedTools) {
        onUpdateTools(result.updatedTools);
      }

      const aiResponseMsg: ChatMessage = {
        id: `ai-res-${Date.now()}`,
        senderId: 'ai-assistant',
        senderName: 'Asistente IA (HOGACOR)',
        senderRoleTitle: 'Copilot Inteligente de Obra',
        content: result.reply,
        timestamp: new Date().toISOString(),
        status: 'delivered',
        isAi: true,
        channelId: 'chan-ai',
        actionExecution: result.actionExecution,
      };

      onSendMessage(aiResponseMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-slate-800 border border-slate-700 transition-all hover:scale-105 group"
            title="Abrir Asistente IA y Mensajería"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block pr-1">
              <div className="text-xs font-black tracking-tight leading-tight flex items-center gap-1.5">
                <span>Asistente IA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Carga en obras por voz/texto
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[92vw] sm:w-[420px] h-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
                    <span>HOGACOR Copilot</span>
                    <span className="bg-teal-500/20 text-teal-300 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      IA Activa
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    {currentUser.name} · {currentUser.roleTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('mensajes');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Ampliar a pantalla completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Bar */}
            <div className="p-2.5 bg-teal-50 border-b border-teal-100 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-teal-800 font-bold text-[10px] uppercase truncate">
                💡 Prueba:
              </span>
              <button
                onClick={() => handleSend('En la obra Sileto cargar 2 martillos del inventario y 2 personal de albañileria')}
                disabled={isProcessing}
                className="truncate text-[10px] text-teal-700 bg-white border border-teal-200 px-2 py-0.5 rounded-md hover:bg-teal-100 font-medium disabled:opacity-50"
              >
                "Cargar 2 martillos y 2 albañiles a Sileto"
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50">
              {aiMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                        isMe
                          ? 'bg-teal-700 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <div className="space-y-1 whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {msg.actionExecution && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          {msg.actionExecution.status === 'executed' ? (
                            <div className="bg-emerald-50 text-emerald-900 text-[11px] p-2 rounded-lg border border-emerald-200">
                              <div className="font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Asignación ejecutada en {msg.actionExecution.projectName}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-red-50 text-red-900 text-[11px] p-2 rounded-lg border border-red-200">
                              <div className="font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                {msg.actionExecution.summary}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-teal-700 font-bold p-2 bg-white rounded-xl border border-teal-200">
                  <Bot className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Procesando orden según permisos...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ej: en Sileto cargar 2 martillos y 2 albañiles..."
                  className="w-full text-xs bg-transparent border-0 px-2 py-1 focus:outline-none font-medium"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isProcessing}
                  className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
