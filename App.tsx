import React, { useState, useEffect } from 'react';
import SolarSystem from './components/SolarSystem';
import PlanetDetail from './components/PlanetDetail';
import IntroAnimation from './components/IntroAnimation';
import Auth from './components/Auth';
import { Planet, PlanetInfoResponse, User } from './types';
import { dbService } from './services/userService';

const App: React.FC = () => {
  // Verificación segura del usuario inicial
  const getInitialUser = (): User | null => {
    const savedUser = localStorage.getItem('cosmic_user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.error("Error leyendo datos de usuario, limpiando sesión corrupta.");
      localStorage.removeItem('cosmic_user'); // Autolimpieza si hay error
      return null;
    }
  };

  const initialUser = getInitialUser();
  const [user, setUser] = useState<User | null>(initialUser);
  
  // Si ya hay usuario, showIntro es false para entrar directamente
  const [showIntro, setShowIntro] = useState(!initialUser);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [planetCache, setPlanetCache] = useState<Record<string, PlanetInfoResponse>>({});

  useEffect(() => {
    if (user && !showIntro) {
      dbService.incrementVisits();
    }
  }, [user, showIntro]);

  const handleDataLoaded = (data: PlanetInfoResponse) => {
    if (selectedPlanet) {
      setPlanetCache(prev => ({
        ...prev,
        [selectedPlanet.name]: data
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cosmic_user');
    setUser(null);
    setShowIntro(false); // Mostrar Auth directamente al salir
    setSelectedPlanet(null);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cosmic_user', JSON.stringify(userData));
    setShowIntro(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('cosmic_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 overflow-hidden relative">
      {/* Animación solo si no hay usuario y se debe mostrar */}
      {showIntro && !user && (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      )}
      
      {/* Formulario de Auth si no hay usuario y terminó la intro */}
      {!showIntro && !user && (
        <Auth onLogin={handleLogin} />
      )}
      
      {/* Sistema Solar si hay usuario logueado */}
      {user && (
        <>
          <div className="absolute inset-0 z-0 animate-fadeIn">
             <SolarSystem 
                onSelectPlanet={setSelectedPlanet} 
                currentUser={user}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
             />
          </div>

          {selectedPlanet && (
            <PlanetDetail 
              planet={selectedPlanet} 
              onClose={() => setSelectedPlanet(null)} 
              cachedData={planetCache[selectedPlanet.name]} 
              onDataLoaded={handleDataLoaded} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;