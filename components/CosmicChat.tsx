import React, { useState, useEffect, useRef } from 'react';
import { createCosmicChatSession, validateInput, generateChatTitle, CustomChatSession } from '../services/geminiService';
import { dbService } from '../services/userService';
import { ChatMessage, Conversation, User } from '../types';
import ReactMarkdown from 'react-markdown';

interface CosmicChatProps {
  currentUser: User;
}

const CosmicChat: React.FC<CosmicChatProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const chatSessionRef = useRef<CustomChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar historial del usuario específico al montar o cambiar de usuario
  useEffect(() => {
    const userHistory = dbService.getUserConversations(currentUser.email);
    setConversations(userHistory);
    
    if (userHistory.length > 0) {
      const lastConv = userHistory[0];
      setCurrentConversationId(lastConv.id);
      setMessages(lastConv.messages);
      chatSessionRef.current = createCosmicChatSession(lastConv.messages);
    } else {
      startNewChat(false);
    }
  }, [currentUser.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, showHistory]);

  // Sincronizar mensajes actuales con el DB del usuario
  useEffect(() => {
    if (!currentConversationId || !currentUser.email) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: messages, timestamp: Date.now() };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    dbService.saveUserConversations(currentUser.email, updatedConversations);
  }, [messages]);

  const startNewChat = (switchToView = true) => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
        id: newId,
        title: 'Nueva Consulta',
        timestamp: Date.now(),
        messages: []
    };
    
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newId);
    setMessages([]);
    chatSessionRef.current = createCosmicChatSession();
    
    if (switchToView) setShowHistory(false);
  };

  const loadConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    setCurrentConversationId(id);
    setMessages(conv.messages);
    chatSessionRef.current = createCosmicChatSession(conv.messages);
    setShowHistory(false);
  };

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    dbService.saveUserConversations(currentUser.email, updated);

    if (id === currentConversationId) {
        if (updated.length > 0) loadConversation(updated[0].id);
        else startNewChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userText = inputValue;
    const userMsg: ChatMessage = { role: 'user', text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv && (currentConv.title === 'Nueva Consulta' || currentConv.title === 'Nueva Conversación')) {
        generateChatTitle(userText).then(newTitle => {
            setConversations(prev => prev.map(c => 
                c.id === currentConversationId ? { ...c, title: newTitle } : c
            ));
        });
    }

    try {
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      const resultGenerator = await chatSessionRef.current.sendMessageStream({ message: userText });
      let fullText = '';
      for await (const chunk of resultGenerator) {
        if (chunk.text) {
            fullText += chunk.text;
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { 
                    ...newMsgs[newMsgs.length - 1], 
                    text: fullText,
                    sources: chunk.sources || newMsgs[newMsgs.length - 1].sources
                };
                return newMsgs;
            });
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '⚠️ Enlace interrumpido.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="absolute bottom-8 left-8 z-50 p-1 rounded-full bg-slate-900/80 border border-cyan-500/40 shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center relative overflow-hidden">
             <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 z-10 text-white"><path d="M12 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="2" r="1.5" fill="#a5f3fc" /><rect x="3" y="5" width="18" height="15" rx="5" stroke="currentColor" strokeWidth="2" fill="rgba(15, 23, 42, 0.4)" /><path d="M7 10H17" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" /></svg>
             <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-8 left-4 md:left-8 z-50 w-[85vw] md:w-80 h-[450px] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn overflow-hidden font-exo ring-1 ring-white/10">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/50 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-700 flex items-center justify-center text-white font-bold text-[10px]">L</div>
              <div className="flex flex-col">
                 <h3 className="text-white font-bold text-xs leading-none">LUCAS</h3>
                 <span className="text-[9px] text-cyan-400 font-mono leading-none">{showHistory ? 'HISTORIAL' : 'EN LINEA'}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => setShowHistory(!showHistory)} className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${showHistory ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-400'}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                <button onClick={() => startNewChat(true)} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>

          {showHistory ? (
             <div className="flex-1 overflow-y-auto p-2 bg-slate-900 space-y-2 custom-scrollbar">
                {conversations.length === 0 && <div className="text-center p-4 text-slate-500 text-xs italic">Vacío.</div>}
                {conversations.map((conv) => (
                    <div key={conv.id} onClick={() => loadConversation(conv.id)} className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${conv.id === currentConversationId ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'}`}>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-medium truncate text-slate-200">{conv.title}</h5>
                            <p className="text-[9px] text-slate-500 mt-0.5">{new Date(conv.timestamp).toLocaleDateString()}</p>
                        </div>
                        <button onClick={(e) => deleteConversation(e, conv.id)} className="w-6 h-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5z" clipRule="evenodd" /></svg></button>
                    </div>
                ))}
             </div>
          ) : (
             <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-950/20">
                {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-30"><p className="text-[10px]">LUCAS OS LISTO.</p></div>}
                {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[90%] gap-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="flex-shrink-0 mt-auto"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${msg.role === 'model' ? 'bg-cyan-700' : 'bg-purple-700'}`}>{msg.role === 'model' ? 'AI' : 'TÚ'}</div></div>
                        <div className={`px-2.5 py-2 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'}`}>
                            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown components={{ p: ({node, ...props}) => <p className="mb-1 last:mb-0 text-xs" {...props} /> }}>{msg.text}</ReactMarkdown></div>
                        </div>
                    </div>
                </div>
                ))}
                {isTyping && <div className="text-[9px] text-slate-500 ml-7 animate-pulse">LUCAS analizando...</div>}
                <div ref={messagesEndRef} />
             </div>
          )}
          
          {!showHistory && (
            <div className="p-2 bg-slate-950 border-t border-slate-800/50">
                <div className="relative flex items-center bg-slate-900 rounded-full border border-slate-700 focus-within:border-cyan-500/50 transition-all">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe algo..." className="flex-1 bg-transparent text-white text-xs px-3 py-2.5 focus:outline-none" />
                <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className="mr-1 p-1.5 bg-cyan-600 rounded-full text-white disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218z" /></svg></button>
                </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CosmicChat;