import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/userService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (userData: User) => void;
  onLogout: () => void;
}

const GENERATED_AVATARS = Array.from({ length: 50 }, (_, i) => 
  `https://api.dicebear.com/7.x/bottts/svg?seed=CosmicExplorer${i}&backgroundColor=0f172a`
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }) => {
  const [newName, setNewName] = useState(currentUser.name);
  const [showTerms, setShowTerms] = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentUser.name);
    }
  }, [currentUser.name, isOpen]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleUpdateName = () => {
    const sanitizedName = newName.trim();
    if (!sanitizedName || sanitizedName === currentUser.name) return;
    
    setLoading(true);
    const result = dbService.updateUser(currentUser, { name: sanitizedName });
    
    if (result.success && result.user) {
      onUpdateUser(result.user);
      showSuccess("Nombre Actualizado");
    } else {
      alert("Error de sincronización.");
    }
    setLoading(false);
  };

  const handleUpdateAvatar = (url: string) => {
    setLoading(true);
    setShowAvatarGrid(false);
    const result = dbService.updateUser(currentUser, { avatarUrl: url });
    if (result.success && result.user) {
      onUpdateUser(result.user);
      showSuccess("Avatar Vinculado");
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Máximo 2MB");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const result = dbService.updateUser(currentUser, { avatarUrl: base64String });
      if (result.success && result.user) {
        onUpdateUser(result.user);
        showSuccess("Foto Actualizada");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'estudiante': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-slate-900/80 border border-white/10 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fadeIn ring-1 ring-white/20 flex flex-col max-h-[90vh]">
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 shrink-0"></div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Configuración <span className="text-cyan-400">Terminal</span>
              </h2>
              <p className="text-[9px] text-slate-500 font-mono tracking-[0.3em] uppercase">Status: Operacional</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {successMsg && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-[10px] font-black uppercase px-6 py-2 rounded-full shadow-lg animate-bounce border-2 border-white/20">
              {successMsg}
            </div>
          )}

          {!showTerms ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Identidad Visual
                </h3>
                <div className="flex items-center gap-6 bg-slate-950/40 p-6 rounded-3xl border border-white/5 relative group">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden border-2 border-cyan-500/30 ${!currentUser.avatarUrl && (currentUser.role === 'admin' ? 'bg-amber-600' : currentUser.role === 'estudiante' ? 'bg-cyan-600' : 'bg-purple-600')}`}>
                      {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <button onClick={() => setShowAvatarGrid(true)} className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-900 transition-all hover:scale-110 active:scale-90">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" /><path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.627 1.11.651 1.174.061 2.335.21 3.479.443a3.127 3.127 0 012.57 2.956c.033.233.074.465.121.696A3.127 3.127 0 0122.5 12v5.75c0 1.74-1.41 3.15-3.15 3.15H4.65c-1.74 0-3.15-1.41-3.15-3.15V12a3.127 3.127 0 012.312-3.023c.047-.23.088-.463.121-.696a3.127 3.127 0 012.57-2.956c1.144-.232 2.305-.382 3.479-.443.465-.024.87-.268 1.11-.651l.821-1.317a3.127 3.127 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-xl leading-tight truncate">{currentUser.name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getRoleStyle(currentUser.role || 'invitado')}`}>Rango: {currentUser.role}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Modificar Alias
                </h3>
                <div className="flex gap-2">
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 shadow-inner" />
                  <button onClick={handleUpdateName} disabled={loading || !newName.trim() || newName === currentUser.name} className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Guardar</button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button onClick={() => setShowTerms(true)} className="w-full flex items-center justify-between p-5 bg-slate-800/20 hover:bg-slate-800/40 border border-white/5 rounded-3xl transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                      </div>
                      <div className="text-left">
                        <span className="block text-xs text-white font-bold uppercase tracking-widest">Política de Privacidad</span>
                        <span className="text-[9px] text-slate-500 font-mono italic">ESTADO: PERSISTENTE</span>
                      </div>
                   </div>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-600"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                 <button onClick={onLogout} className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-800/50 hover:bg-indigo-600/20 border border-white/5 rounded-3xl transition-all">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Cambiar Cuenta</span>
                 </button>
                 <button onClick={onLogout} className="flex flex-col items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500 border border-red-500/30 rounded-3xl transition-all group">
                    <span className="text-[9px] font-black text-red-400 group-hover:text-white uppercase tracking-widest">Cerrar Sesión</span>
                 </button>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-6">
                <button onClick={() => setShowTerms(false)} className="flex items-center gap-3 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 hover:underline">Regresar</button>
                <div className="bg-slate-950/80 p-8 rounded-[2rem] border border-white/5 space-y-6 text-xs text-slate-400 leading-relaxed font-mono shadow-inner">
                    <h4 className="text-white font-black uppercase text-base mb-2 border-b border-white/10 pb-3 flex items-center gap-2">Política de Privacidad</h4>
                    <div className="space-y-4">
                        <p><b className="text-cyan-400">01. Almacenamiento Estelar:</b> Tus datos, historial de LUCAS y alias se guardan en tu perfil de explorador de forma permanente. **Cerrar sesión no borra tus progresos.**</p>
                        <p><b className="text-cyan-400">02. Integridad de Cuenta:</b> Al volver a ingresar con tu correo, el sistema recuperará automáticamente tus conversaciones previas de la Comunidad.</p>
                        <p><b className="text-cyan-400">03. Privacidad Local:</b> El cifrado AES-256 protege tu terminal. Solo tú puedes acceder a tu historial mediante tus credenciales.</p>
                        <p><b className="text-cyan-400">04. Gestión de Datos:</b> Los registros solo se eliminan si tú decides borrar manualmente la base de datos de tu navegador o solicitas una desintegración total de cuenta.</p>
                    </div>
                    <div className="pt-6 text-center border-t border-white/5">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Firma Digital Verificada // Darwin Florentino // 2026</span>
                    </div>
                </div>
            </div>
          )}

          {showAvatarGrid && (
            <div className="absolute inset-0 bg-slate-950 z-[120] animate-slideUp flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Identidad Visual</h3>
                <button onClick={() => setShowAvatarGrid(false)} className="p-3 text-slate-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-4 custom-scrollbar">
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-3xl bg-slate-800/40 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center gap-2">
                   <span className="text-[8px] font-black uppercase text-cyan-500">Subir Propia</span>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </button>
                {GENERATED_AVATARS.map((url, i) => (
                  <button key={i} onClick={() => handleUpdateAvatar(url)} className={`aspect-square rounded-3xl border-2 transition-all p-1 ${currentUser.avatarUrl === url ? 'border-cyan-500 bg-cyan-500/20 shadow-lg' : 'border-white/5 bg-slate-800/40'}`}>
                    <img src={url} alt={`Bot ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center shrink-0">
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">TERMINAL_SECURE_MODE // ENCRIPTACIÓN_ACTIVA</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;