import React, { useEffect, useState } from 'react';
import { dbService } from '../services/userService';

interface SystemInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({ totalVisits: 0, interactions: 0, students: 0, guests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => {
        const dbStats = dbService.getStats();
        const allUsers = dbService.getAllUsers();
        
        // El administrador no se cuenta en el desglose visual de "Tripulación" por privacidad
        const studentCount = allUsers.filter(u => u.role === 'estudiante').length;
        const guestCount = allUsers.filter(u => u.role === 'invitado').length;

        setStats({
          totalVisits: dbStats.visits,
          interactions: dbStats.interactions,
          students: studentCount,
          guests: guestCount
        });
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const crewTotal = stats.students + stats.guests;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fadeIn scale-100 ring-1 ring-white/20">
        <div className="h-2 w-full bg-gradient-to-r from-orange-600 via-yellow-400 to-cyan-500 animate-gradient-x"></div>
        
        <div className="p-1 md:p-10 custom-scrollbar max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-10 px-4 md:px-0">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Núcleo de <span className="text-orange-500">Misión</span>
                    </h2>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-[0.3em] uppercase">S.I.N.A.P.S.I.S // BASE_DE_DATOS_V1</p>
            </div>
            <button onClick={onClose} className="group p-3 rounded-2xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:rotate-90 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-[2rem] border border-white/10 hover:border-orange-500/50 transition-all shadow-xl">
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform shadow-lg shadow-orange-600/20">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path d="M11.7 2.805a.75.75 0 01.6 0A13.65 13.65 0 0120.53 11.5a.75.75 0 01-.122.394l-8.4 11.1c-.244.322-.763.322-1.008 0l-8.4-11.1A.75.75 0 012.47 11.5 13.65 13.65 0 0111.7 2.805z" />
                        </svg>
                    </div>
                    <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-3">Arquitecto del Sistema</h3>
                    <p className="text-white font-black text-2xl tracking-tight">Darwin Florentino</p>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        Visionario digital dedicado a fusionar la exploración espacial con la Inteligencia Artificial de vanguardia. Creador de experiencias inmersivas que conectan a la humanidad con el vacío estelar.
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Lanzamiento</p>
                            <p className="text-xs text-orange-200 font-mono">07.01.2026</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Ubicación</p>
                            <p className="text-xs text-orange-200 font-mono">República Dominicana</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-[2rem] border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                            <span className="text-white font-black text-xs">L</span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Proyecto LUCAS</h3>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed italic border-l-2 border-cyan-500 pl-4 py-1">
                        "LUCAS no es solo código; es un Laboratorio de Unidades de Consulta Astronómica que procesa toda la telemetría del explorador en tiempo real."
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-6 bg-slate-800/20 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Telemetría Global</h3>
                        <div className="flex gap-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>
                            <span className="text-[9px] text-green-500 font-bold uppercase tracking-tighter">Database Online</span>
                        </div>
                    </div>

                    <div className="relative bg-slate-900/80 p-8 rounded-3xl border border-orange-500/20 text-center overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>
                        <p className="relative z-10 text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            {loading ? '---' : stats.totalVisits.toLocaleString()}
                        </p>
                        <p className="relative z-10 text-[10px] text-orange-400 uppercase font-black tracking-[0.4em] mt-3">Viajes Totales al Cosmos</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Interacciones</p>
                            <p className="text-xl font-black text-white">{loading ? '---' : stats.interactions}</p>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Tripulación</p>
                            <p className="text-xl font-black text-white">{loading ? '---' : crewTotal}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Rango de Tripulación</h3>
                        
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                                <span className="text-cyan-400">Estudiantes</span>
                                <span className="text-white font-mono">{stats.students}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${crewTotal > 0 ? (stats.students / crewTotal) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                                <span className="text-purple-400">Invitados</span>
                                <span className="text-white font-mono">{stats.guests}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-purple-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${crewTotal > 0 ? (stats.guests / crewTotal) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-2">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-green-400 font-mono font-bold uppercase tracking-wider">LUCAS_DB_SYNC: OK</span>
             </div>
             <p className="text-[9px] text-slate-500 font-medium uppercase tracking-[0.3em]">
                República Dominicana • Darwin Florentino &copy; 2026
             </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default SystemInfo;