import React, { useState } from 'react';
import { dbService } from '../services/userService';

interface AuthProps {
  onLogin: (userData: { name: string; email: string; role: 'estudiante' | 'invitado' | 'admin'; avatarUrl?: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [regStep, setRegStep] = useState(0); 
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ADMIN_EMAIL = 'darwinflorentino63@gmail.com';

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      if (isLogin) {
        const result = dbService.authenticate(identifier, password);
        if (result.success && result.user) {
          onLogin(result.user as any);
        } else {
          setErrorMessage(result.message);
          setLoading(false);
        }
      } else {
        const users = dbService.getAllUsers();
        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
          setErrorMessage('Nombre de usuario no disponible.');
          setLoading(false);
        } else if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setErrorMessage('El correo ya tiene cuenta activa.');
          setLoading(false);
        } else {
          setRegStep(1); 
          setLoading(false);
        }
      }
    }, 800);
  };

  const handleRoleSelection = (role: 'estudiante' | 'invitado' | 'admin') => {
    setLoading(true);
    const finalRole = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : role;
    
    const newUser = { 
      name, 
      email, 
      password, 
      role: finalRole as any, 
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}&backgroundColor=0f172a` 
    };
    
    setTimeout(() => {
      const result = dbService.registerUser(newUser);
      if (result.success) {
        onLogin(newUser);
      } else {
        setErrorMessage(result.message);
        setRegStep(0);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 stars">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-md bg-slate-900/80 border border-slate-700/50 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fadeIn ring-1 ring-white/10">
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>
        
        <div className="p-8">
          {regStep === 0 ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 relative mb-4">
                  {/* LOGO CORPORATIVO UNIFICADO */}
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]">
                    <defs>
                      <linearGradient id="logoGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="18" fill="url(#logoGradAuth)" />
                    <ellipse cx="50" cy="50" rx="42" ry="12" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(45 50 50)" className="animate-[spin_10s_linear_infinite]" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Cosmic <span className="text-cyan-400">Access</span></h2>
              </div>

              <div className="flex bg-slate-950/50 rounded-xl p-1 mb-6 border border-slate-800">
                <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>INICIAR SESIÓN</button>
                <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${!isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>REGISTRARSE</button>
              </div>

              {errorMessage && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 animate-pulse text-center">{errorMessage}</div>
              )}

              <form onSubmit={handleInitialSubmit} className="space-y-4">
                {isLogin ? (
                  <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner" placeholder="Usuario o Correo" />
                ) : (
                  <>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 shadow-inner" placeholder="Nombre de Usuario" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 shadow-inner" placeholder="Correo Electrónico" />
                  </>
                )}
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 shadow-inner" placeholder="Contraseña" />

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 group">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="uppercase tracking-widest text-sm">{isLogin ? 'Entrar' : 'Continuar'}</span>}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-fadeIn text-center">
                {email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? (
                  <div className="py-8">
                      <div className="w-16 h-16 mx-auto bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center justify-center mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-amber-500"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08zM11.32 6.17a.75.75 0 011.06 0l2.5 2.5a.75.75 0 11-1.06 1.06l-1.22-1.22V14a.75.75 0 01-1.5 0V8.51l-1.22 1.22a.75.75 0 11-1.06-1.06l2.5-2.5z" clipRule="evenodd" /></svg>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Acceso de <span className="text-amber-500">Administrador</span></h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-2 mb-8">CORREO VERIFICADO: DARWIN FLORENTINO</p>
                      <button onClick={() => handleRoleSelection('admin')} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-sm">Activar Protocolo Admin</button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Selecciona tu <span className="text-cyan-400">Rango</span></h3>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">AMBOS RANGOS POSEEN ACCESO TOTAL AL SISTEMA</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => handleRoleSelection('estudiante')} className="p-5 rounded-2xl bg-slate-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left group">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-white font-bold uppercase text-sm group-hover:text-cyan-400">Estudiante</h4>
                              <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black">ACCESO TOTAL</span>
                            </div>
                            <p className="text-slate-500 text-[10px]">Análisis avanzado, telemetría y consultas con LUCAS AI.</p>
                        </button>
                        <button onClick={() => handleRoleSelection('invitado')} className="p-5 rounded-2xl bg-slate-950/40 border border-purple-500/30 hover:border-purple-400 transition-all text-left group">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-white font-bold uppercase text-sm group-hover:text-purple-400">Invitado</h4>
                              <span className="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-black">ACCESO TOTAL</span>
                            </div>
                            <p className="text-slate-500 text-[10px]">Exploración completa, telemetría y consultas con LUCAS AI.</p>
                        </button>
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;