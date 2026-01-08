import { SUN_DATA, PLANETS } from '../constants';
import React, { useState } from 'react';
import { Planet, User } from '../types';
import CosmicChat from './CosmicChat';
import SystemInfo from './SystemInfo';
import Community from './Community';
import SettingsModal from './SettingsModal';

interface SolarSystemProps {
  onSelectPlanet: (planet: Planet) => void;
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (userData: User) => void;
}

const SolarSystem: React.FC<SolarSystemProps> = ({ onSelectPlanet, currentUser, onLogout, onUpdateUser }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Renderiza la estructura de los anillos (se usa dos veces para el efecto de profundidad)
  // Se ha reducido ligeramente el tamaño total (180%) y aumentado el grosor visual
  const renderRings = (className: string, style?: React.CSSProperties) => (
    <div className={`absolute top-1/2 left-1/2 pointer-events-none w-[180%] h-[180%] -translate-x-1/2 -translate-y-1/2 ${className}`} 
         style={{ transform: 'translate(-50%, -50%) rotateX(75deg) rotateY(15deg)', ...style }}>
      {/* Capa exterior - Más definida */}
      <div className="absolute inset-0 rounded-full border-[5px] border-[#a49b72]/70 shadow-[0_0_12px_rgba(164,155,114,0.5)]"></div>
      {/* División de Cassini */}
      <div className="absolute inset-1.5 rounded-full border-[1.5px] border-black/90"></div>
      {/* Anillo Principal Brillante - Más intenso */}
      <div className="absolute inset-2.5 rounded-full border-[12px] border-[#ceba85]/90 shadow-[inset_0_0_15px_rgba(206,186,133,0.6),0_0_15px_rgba(206,186,133,0.4)]"></div>
      {/* Anillo Interior Tenue */}
      <div className="absolute inset-7 rounded-full border-[4px] border-[#7a7152]/50"></div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black stars">
      
      {/* --- TOP BAR --- */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between select-none">
        <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]">
                <defs><linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
                <circle cx="50" cy="50" r="18" fill="url(#logoGrad)" />
                <ellipse cx="50" cy="50" rx="42" ry="12" stroke="white" strokeWidth="1.5" fill="none" transform="rotate(45 50 50)" className="animate-[spin_10s_linear_infinite]" />
            </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 leading-none">COSMIC</h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase">EXPLORER</span>
            </div>
        </div>

        <div className="flex items-center bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-2xl shadow-xl ring-1 ring-white/10">
            <button onClick={() => setIsSettingsOpen(true)} className="relative w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all overflow-hidden">
                {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-sm font-black text-cyan-400">{currentUser.name.charAt(0).toUpperCase()}</span>}
            </button>
        </div>
      </div>

      {/* Solar System Visuals */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[60%] flex items-center justify-center z-10">
        <div className="absolute w-[10vmin] h-[10vmin] rounded-full z-20 cursor-pointer hover:scale-110 transition-transform" onClick={() => onSelectPlanet(SUN_DATA)} style={{ backgroundImage: `url(${SUN_DATA.texture})`, backgroundSize: 'cover', boxShadow: '0 0 60px #ff4500' }}></div>
        {PLANETS.map((planet) => (
            <React.Fragment key={planet.name}>
              <div className="absolute rounded-full border border-white/10 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${planet.orbitSize}vmin`, height: `${planet.orbitSize}vmin` }} />
              <div className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center z-30 planet-orbit" style={{ '--orbit-radius': `${planet.orbitSize / 2}vmin`, '--orbit-duration': `${planet.speed}s` } as React.CSSProperties}>
                <div className="relative group cursor-pointer" onClick={() => onSelectPlanet(planet)}>
                  
                  {/* --- SATURN SPECIAL RENDER --- */}
                  {planet.hasRings ? (
                    <>
                      {/* Anillos PARTE TRASERA */}
                      {renderRings("z-10 opacity-100")}
                      
                      {/* El Planeta con textureZoom aplicado */}
                      <div className={`${planet.size} relative z-20 group-hover:scale-125 transition-transform shadow-inner overflow-hidden`} 
                           style={{ 
                             backgroundImage: `url(${planet.texture})`, 
                             backgroundSize: planet.textureZoom || 'cover', 
                             backgroundPosition: 'center',
                             borderRadius: '50%', 
                             boxShadow: 'inset -8px -8px 15px rgba(0,0,0,0.6)' 
                           }}>
                      </div>

                      {/* Anillos PARTE FRONTAL */}
                      {renderRings("z-30", { clipPath: 'inset(50% 0 0 0)' })}
                    </>
                  ) : (
                    /* Planetas normales */
                    <div className={`${planet.size} relative z-20 group-hover:scale-125 transition-transform shadow-inner`} 
                         style={{ 
                           backgroundImage: `url(${planet.texture})`, 
                           backgroundSize: planet.textureZoom || 'cover', 
                           backgroundPosition: 'center',
                           borderRadius: '50%', 
                           boxShadow: 'inset -8px -8px 15px rgba(0,0,0,0.6)' 
                         }}>
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
        ))}
      </div>

      <CosmicChat currentUser={currentUser} />

      <div className="absolute bottom-8 right-8 z-50 flex gap-4">
        <button onClick={() => setIsCommunityOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </button>
        <button onClick={() => setIsInfoOpen(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-white"><path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg></button>
      </div>

      <SystemInfo isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      <Community isOpen={isCommunityOpen} onClose={() => setIsCommunityOpen(false)} currentUser={currentUser} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentUser={currentUser} onUpdateUser={onUpdateUser} onLogout={onLogout} />
    </div>
  );
};

export default SolarSystem;