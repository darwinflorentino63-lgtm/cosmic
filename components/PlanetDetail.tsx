import React, { useEffect, useState, useCallback } from 'react';
import { Planet, GroundingSource, PlanetData, PlanetInfoResponse } from '../types';
import { getPlanetDetails } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface PlanetDetailProps {
  planet: Planet;
  onClose: () => void;
  cachedData?: PlanetInfoResponse; 
  onDataLoaded?: (data: PlanetInfoResponse) => void;
}

const PlanetDetail: React.FC<PlanetDetailProps> = ({ planet, onClose, cachedData, onDataLoaded }) => {
  const [data, setData] = useState<PlanetData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadInfo = useCallback(async (force = false) => {
    if (!force && cachedData && cachedData.data && cachedData.data.lastUpdate !== 'SYSTEM_OFFLINE') {
      setData(cachedData.data);
      setSources(cachedData.sources);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const response = await getPlanetDetails(planet.name);
      setData(response.data);
      setSources(response.sources);
      
      if (response.data?.lastUpdate === 'SYSTEM_OFFLINE') {
        setError(true);
      } else if (onDataLoaded) {
        onDataLoaded(response);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [planet.name, cachedData, onDataLoaded]);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  return (
    <div className="fixed top-4 right-4 bottom-32 w-[90vw] md:w-[500px] z-50 flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden font-exo animate-[slideInRight_0.5s_ease-out] ring-1 ring-white/10">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-ping' : error ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'}`}></span>
            <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-widest">
                {planet.name} <span className="text-[10px] text-slate-500 font-mono">:: {loading ? 'SYNCING' : error ? 'OFFLINE' : 'LIVE'}</span>
            </h2>
        </div>
        <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar relative">
        
        {/* Planet Visual */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 group shadow-lg bg-black">
            <div 
                className="absolute inset-0 transition-transform duration-[60s] ease-linear group-hover:scale-110"
                style={{ 
                    backgroundImage: `url(${planet.texture})`,
                    backgroundSize: planet.textureZoom || 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-3 left-3 right-3">
                 <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-wide uppercase mb-1">{planet.name}</h1>
                 <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
            </div>
        </div>

        {loading && (
            <div className="space-y-4 animate-pulse">
                <div className="space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                </div>
                <div className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
            </div>
        )}

        {error && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 text-red-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-white font-bold">Error de Conexión AI</h3>
                <p className="text-sm text-slate-400 px-4">{data?.description || "No se pudo establecer el enlace con Gemini."}</p>
                <button 
                    onClick={() => loadInfo(true)}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                    REINTENTAR TELEMETRÍA
                </button>
            </div>
        )}

        {!loading && !error && data && (
            <>
                <div className="prose prose-invert prose-sm max-w-none">
                     <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Análisis
                     </h3>
                     <p className="text-slate-200 text-sm leading-relaxed border-l-2 border-slate-700 pl-3 italic bg-slate-800/20 py-2 rounded-r-lg">
                        {data.introduction}
                     </p>
                </div>

                {data.keyPoints && data.keyPoints.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
                        <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-yellow-500/20 pb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Fascinante
                        </h3>
                        <ul className="space-y-3 relative z-10">
                            {data.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-cyan-500 font-mono text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="leading-snug">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="space-y-2">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Informe Técnico
                     </h3>
                     <div className="text-xs text-slate-400 leading-relaxed text-justify bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                        <ReactMarkdown>{data.description}</ReactMarkdown>
                     </div>
                </div>

                {data.news && (
                    <div className="mt-2 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4 rounded-xl border border-indigo-500/30 shadow-inner">
                        <h4 className="text-indigo-300 font-bold mb-3 uppercase text-xs flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                            Actualidad
                        </h4>
                        <div className="text-sm text-indigo-100/90 leading-relaxed">
                            <ReactMarkdown>{data.news}</ReactMarkdown>
                        </div>
                    </div>
                )}

                <div className="pt-6 pb-2 border-t border-slate-800/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[9px] text-slate-600 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <span className="font-mono text-cyan-600/70">LUCAS_AI // SECURE_LINK</span>
                        <div className="font-mono">DATA_REV: {data.lastUpdate}</div>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default PlanetDetail;