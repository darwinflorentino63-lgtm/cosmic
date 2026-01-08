import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Verificamos si ya hay usuario para acelerar la entrada
    const hasUser = !!localStorage.getItem('cosmic_user');
    const timing = hasUser ? 0.5 : 1; // Factor de velocidad

    // Timeline acelerado para sensación de "Alta Velocidad"
    setTimeout(() => setPhase(1), 200 * timing);
    
    // Si ya está logueado, saltamos el expandir lento y vamos directo al grano
    const finalDelay = hasUser ? 1000 : 2000;
    const warpDelay = hasUser ? 700 : 1500;

    setTimeout(() => setPhase(2), warpDelay);
    setTimeout(() => onComplete(), finalDelay);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 ${phase === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Star field effect */}
      <div className={`absolute inset-0 transition-transform duration-[1500ms] ease-in ${phase === 2 ? 'scale-[20] opacity-0' : 'scale-100'}`}>
         <div className="stars absolute inset-0 opacity-50"></div>
      </div>

      <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-500 ${phase === 2 ? 'scale-150 blur-sm opacity-0' : 'scale-100'}`}>
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-[spin_0.5s_linear_infinite]"></div>
          <div className="absolute inset-2 border-r-4 border-blue-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
          <div className="absolute inset-4 border-l-4 border-indigo-500 rounded-full animate-[spin_0.7s_linear_infinite_reverse]"></div>
          
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
             <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]"></div>
          </div>
        </div>

        <h1 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-[0.5em] transition-all duration-700 transform ${phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          COSMIC
        </h1>
        <p className={`text-xs text-slate-500 mt-2 tracking-widest uppercase transition-all duration-500 delay-100 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          LUCAS OS :: {localStorage.getItem('cosmic_user') ? 'RECONECTANDO...' : 'FAST_BOOT'}
        </p>
      </div>
    </div>
  );
};

export default IntroAnimation;