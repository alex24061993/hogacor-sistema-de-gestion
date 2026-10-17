import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Users, 
  Building2, 
  HardHat, 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  Briefcase, 
  Mail, 
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  Radio,
  Share2
} from 'lucide-react';
import { 
  User, 
  Project, 
  ChatMessage 
} from '../types';

interface MessengerViewProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  chatMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onNavigate: (module: string) => void;
}

export const MessengerView: React.FC<MessengerViewProps> = ({
  currentUser,
  users,
  projects,
  chatMessages,
  onSendMessage,
  onNavigate,
}) => {
  // Currently selected destination: either a user ID ('usr-xxx'), 'general', or null (shows full user selector)
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'obra_admin'>('all');
  
  // Message composer state
  const [inputText, setInputText] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [priority, setPriority] = useState<'normal' | 'importante' | 'urgente'>('normal');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available users to send messages to (excluding current user)
  const availableUsers = users.filter(u => u.id !== currentUser.id);

  // Filtered users for the user selector interface
  const filteredUsers = availableUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Selected user object (if a user is chosen)
  const selectedUser = selectedDestination && selectedDestination !== 'general'
    ? users.find(u => u.id === selectedDestination)
    : null;

  const isGeneralChannel = selectedDestination === 'general';

  // Get messages for current conversation
  const currentConversationMessages = chatMessages.filter(msg => {
    if (isGeneralChannel) {
      return msg.channelId === 'chan-general';
    }
    if (selectedUser) {
      return (
        (msg.senderId === currentUser.id && msg.recipientId === selectedUser.id) ||
        (msg.senderId === selectedUser.id && msg.recipientId === currentUser.id)
      );
    }
    return false;
  });

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversationMessages.length, selectedDestination]);

  // Helper: Get last message preview with a user
  const getLastMessageWithUser = (userId: string) => {
    const conversation = chatMessages.filter(
      msg =>
        (msg.senderId === currentUser.id && msg.recipientId === userId) ||
        (msg.senderId === userId && msg.recipientId === currentUser.id)
    );
    if (conversation.length === 0) return null;
    return conversation[conversation.length - 1];
  };

  // Helper: Count messages from this user to currentUser
  const getMessageCountWithUser = (userId: string) => {
    return chatMessages.filter(
      msg =>
        (msg.senderId === currentUser.id && msg.recipientId === userId) ||
        (msg.senderId === userId && msg.recipientId === currentUser.id)
    ).length;
  };

  // Handle sending message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedDestination) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRoleTitle: currentUser.roleTitle,
      recipientId: isGeneralChannel ? undefined : selectedUser?.id,
      channelId: isGeneralChannel ? 'chan-general' : undefined,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      priority: priority !== 'normal' ? priority : undefined,
      projectName: selectedProject || undefined,
    };

    onSendMessage(newMsg);
    setInputText('');
    setPriority('normal');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick message template insertion
  const applyQuickTemplate = (text: string) => {
    setInputText(prev => prev ? `${prev} ${text}` : text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Mensajería Interna HOGACOR
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              · Comunicaciones seguras entre personal autorizado
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Centro de Mensajes y Comunicaciones
          </h1>
        </div>

        {/* Current user badge & navigation back */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <span className="font-bold text-slate-800 block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">{currentUser.roleTitle}</span>
            </div>
          </div>

          {selectedDestination && (
            <button
              onClick={() => setSelectedDestination(null)}
              className="px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Volver a la selección de usuarios"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Elegir otro usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN / SIDEBAR: List of Users & Channels */}
        <div className={`lg:col-span-4 space-y-4 ${selectedDestination ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Usuarios Disponibles</span>
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">
                {availableUsers.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o cargo..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            {/* Channel: General Broadcast */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-2">
                Canal Corporativo
              </span>
              <button
                onClick={() => setSelectedDestination('general')}
                className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                  selectedDestination === 'general'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedDestination === 'general' ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-200'
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">🏢 Canal General</span>
                    <span className={`text-[10px] font-mono ${selectedDestination === 'general' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Equipo
                    </span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${selectedDestination === 'general' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Mensaje a todos los directores y supervisores
                  </p>
                </div>
              </button>
            </div>

            {/* Direct Users List */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-2">
                Mensaje Directo 1 a 1 (Elige un usuario)
              </span>

              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron usuarios con ese criterio.
                </div>
              ) : (
                filteredUsers.map(user => {
                  const lastMsg = getLastMessageWithUser(user.id);
                  const isSelected = selectedDestination === user.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => setSelectedDestination(user.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center gap-3 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/70 hover:border-teal-300'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs overflow-hidden ${
                          isSelected ? 'bg-teal-500 text-white' : 'bg-teal-600 text-white'
                        }`}>
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">{user.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                            isSelected 
                              ? 'bg-slate-800 text-teal-300' 
                              : user.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {user.role === 'super_admin' ? 'Admin' : 'Obra'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] mt-0.5">
                          <span className={`truncate max-w-[170px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {user.roleTitle}
                          </span>
                          {lastMsg && (
                            <span className={`text-[9px] shrink-0 font-mono ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                              {new Date(lastMsg.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat OR Full User Selection Interface */}
        <div className={`lg:col-span-8 ${!selectedDestination ? 'col-span-12' : ''}`}>
          {selectedDestination ? (
            /* CONVERSATION INTERFACE WITH CHOSEN DESTINATION */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[750px]">
              {/* Chat Header */}
              <div className="p-4 md:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedDestination(null)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold lg:hidden"
                    title="Volver a lista de usuarios"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver</span>
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-sm">
                      {isGeneralChannel ? (
                        <Building2 className="w-5 h-5 text-white" />
                      ) : selectedUser?.avatar ? (
                        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedUser?.name.slice(0, 2).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                        {isGeneralChannel ? 'Canal General HOGACOR' : selectedUser?.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-900/80 text-teal-300 border border-teal-700/60 font-mono">
                        {isGeneralChannel ? 'Todos los perfiles' : selectedUser?.roleTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{isGeneralChannel ? 'Comunicaciones oficiales' : selectedUser?.department}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Disponible
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right button to pick another user */}
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700"
                >
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  <span>Cambiar de Usuario</span>
                </button>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/70">
                {currentConversationMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="text-sm font-bold text-slate-800">
                        {isGeneralChannel
                          ? 'Comienza la conversación en el Canal General'
                          : `Conversación directa con ${selectedUser?.name}`}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isGeneralChannel
                          ? 'Este mensaje será visible para todos los miembros de la empresa (Berni, Jonathan Rodriguez, Miguel Pereira y Supervisor).'
                          : `Escribe un mensaje directo a ${selectedUser?.name} (${selectedUser?.roleTitle}). El mensaje quedará registrado en su bandeja y recibirá una notificación inmediata.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => applyQuickTemplate('¡Hola! ¿Cómo estás? Te consulto sobre las novedades de obra.')}
                        className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-xl shadow-xs transition-colors"
                      >
                        👋 Saludo y consulta general
                      </button>
                      <button
                        onClick={() => applyQuickTemplate('¿Podrías revisar el estado y avance de las fundaciones?')}
                        className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-xl shadow-xs transition-colors"
                      >
                        🏗️ Consulta de avance
                      </button>
                    </div>
                  </div>
                ) : (
                  currentConversationMessages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender info if group or not me */}
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-800">{msg.senderName}</span>
                            {msg.senderRoleTitle && (
                              <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200/80 px-1.5 py-0.2 rounded font-mono">
                                {msg.senderRoleTitle}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed space-y-1.5 ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                          }`}
                        >
                          {/* Optional project tag or priority badge */}
                          {(msg.projectName || msg.priority) && (
                            <div className="flex flex-wrap items-center gap-1.5 pb-1">
                              {msg.projectName && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isMe ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  <HardHat className="w-3 h-3 text-amber-500" />
                                  Obra: {msg.projectName}
                                </span>
                              )}
                              {msg.priority === 'urgente' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white">
                                  <AlertTriangle className="w-3 h-3" />
                                  Urgente
                                </span>
                              )}
                              {msg.priority === 'importante' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950">
                                  Importante
                                </span>
                              )}
                            </div>
                          )}

                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          <div className={`flex items-center justify-end gap-1 text-[10px] font-mono pt-0.5 ${
                            isMe ? 'text-slate-400' : 'text-slate-400'
                          }`}>
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <Check className="w-3 h-3 text-teal-400" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Bar */}
              <div className="p-3 md:p-4 bg-white border-t border-slate-200/80 space-y-2">
                {/* Options row: Obra link, Priority & Templates */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Link to project */}
                    <div className="flex items-center gap-1">
                      <HardHat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <select
                        value={selectedProject}
                        onChange={e => setSelectedProject(e.target.value)}
                        className="text-[11px] font-semibold py-1 px-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="">Vincular a Obra (Opcional)...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPriority('normal')}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          priority === 'normal' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('importante')}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          priority === 'importante' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Importante
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('urgente')}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          priority === 'urgente' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Urgente
                      </button>
                    </div>
                  </div>

                  {/* Quick suggestion tag */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Atajo:</span>
                    <button
                      type="button"
                      onClick={() => applyQuickTemplate('Por favor revisar y aprobar.')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      + "Por favor revisar y aprobar"
                    </button>
                  </div>
                </div>

                {/* Textarea & Send button */}
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        isGeneralChannel
                          ? 'Escribe un comunicado para todo el equipo HOGACOR... (Enter para enviar)'
                          : `Escribe un mensaje para ${selectedUser?.name}... (Enter para enviar)`
                      }
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`h-12 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                      inputText.trim()
                        ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* FULL USER SELECTION INTERFACE: THE PRIMARY LANDING VIEW REQUESTED BY USER */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
                  <Users className="w-7 h-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  ¿A qué usuario deseas enviarle un mensaje?
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona uno de los perfiles autorizados de HOGACOR para abrir su interfaz de mensajería directa y confidencial.
                </p>
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    roleFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({availableUsers.length})
                </button>
                <button
                  onClick={() => setRoleFilter('super_admin')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    roleFilter === 'super_admin'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Directores & Super Admin
                </button>
                <button
                  onClick={() => setRoleFilter('obra_admin')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    roleFilter === 'obra_admin'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Jefes de Obra
                </button>
              </div>

              {/* Grid of Users to select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Card Option: Canal General */}
                <div
                  onClick={() => setSelectedDestination('general')}
                  className="group cursor-pointer p-5 rounded-3xl border-2 border-slate-200 hover:border-teal-500 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                      <Building2 className="w-6 h-6 text-teal-400" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-teal-300 font-mono">
                      Canal de Empresa
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      🏢 Canal General HOGACOR
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Comunicados abiertos para todo el equipo: Berni, Jonathan Rodriguez, Miguel Pereira y Supervisor.
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                    <span>Escribir al Canal General</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Individual User Cards */}
                {filteredUsers.map(user => {
                  const lastMsg = getLastMessageWithUser(user.id);
                  const msgCount = getMessageCountWithUser(user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedDestination(user.id)}
                      className="group cursor-pointer p-5 rounded-3xl border-2 border-slate-200 hover:border-teal-500 bg-white hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Avatar & Badges */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                user.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              user.role === 'super_admin'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                              {user.role === 'super_admin' ? 'Super Admin' : 'Jefe de Obra'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              En línea
                            </span>
                          </div>
                        </div>

                        {/* User Details */}
                        <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-xs font-bold text-teal-800 mt-0.5">
                          {user.roleTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {user.department} · {user.email}
                        </p>

                        {/* Last Message Snippet */}
                        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-[11px]">
                          {lastMsg ? (
                            <p className="truncate">
                              <strong className="text-slate-800">{lastMsg.senderName === currentUser.name ? 'Tú: ' : ''}</strong>
                              {lastMsg.content}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">Sin mensajes previos. Haz clic para chatear.</span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                        <span>Enviar mensaje a {user.name.split(' ')[0]}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
