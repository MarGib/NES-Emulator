import React, { useState, ChangeEvent, useEffect } from 'react';
import { GameInfo, GameLoadState } from './types';
import { generateGameManual } from './services/geminiService';
import Emulator from './components/Emulator';
import GameManual from './components/GameManual';
import ControllerLegend from './components/ControllerLegend';

const App: React.FC = () => {
  const [romData, setRomData] = useState<string | null>(null);
  const [gameLoadState, setGameLoadState] = useState<GameLoadState>(GameLoadState.IDLE);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [scaleMode, setScaleMode] = useState<'fit' | 'stretch'>('fit');

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setGameLoadState(GameLoadState.LOADING);
    setRomData(null);
    setGameInfo(null);
    setShowSidebar(true); 

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    
    reader.onload = (e) => {
      const binaryString = e.target?.result;
      if (typeof binaryString === 'string') {
        setRomData(binaryString);
        setGameLoadState(GameLoadState.PLAYING);
      } else {
        setGameLoadState(GameLoadState.ERROR);
      }
    };

    setLoadingInfo(true);
    try {
      const info = await generateGameManual(file.name);
      setGameInfo(info);
    } catch (error) {
      console.error("Failed to fetch game info", error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleStop = () => {
    setRomData(null);
    setGameLoadState(GameLoadState.IDLE);
    setGameInfo(null);
    setShowSidebar(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] flex flex-col font-sans overflow-hidden text-gray-200">
      {/* TOP BAR - Slim & Functional */}
      <header className="shrink-0 h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-50 relative shadow-lg select-none">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-['Press_Start_2P'] tracking-tight cursor-default">
            RETRO WEB
          </h1>
          {gameLoadState === GameLoadState.PLAYING && (
            <div className="hidden md:flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">System Active</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {gameLoadState === GameLoadState.PLAYING ? (
            <>
               {/* View Controls */}
               <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 mr-2">
                  <button 
                    onClick={() => setScaleMode(prev => prev === 'fit' ? 'stretch' : 'fit')}
                    className="px-3 py-1 text-[10px] font-bold rounded hover:bg-zinc-800 transition-colors uppercase"
                    title="Aspect Ratio"
                  >
                    {scaleMode === 'fit' ? '4:3' : '16:9'}
                  </button>
                  <div className="w-px h-3 bg-zinc-800 mx-1"></div>
                  <button 
                    onClick={toggleFullscreen}
                    className="px-2 py-1 text-[10px] rounded hover:bg-zinc-800 transition-colors"
                    title="Fullscreen"
                  >
                    ⛶
                  </button>
               </div>

              {/* Menu Controls */}
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${
                  showSidebar 
                    ? 'bg-zinc-100 text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'
                }`}
              >
                MANUAL
              </button>
              
              <button 
                onClick={handleStop}
                className="ml-2 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-500/5 border border-red-500/20 rounded-md hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                EJECT
              </button>
            </>
          ) : (
            <div className="text-[10px] text-zinc-600 font-mono">NO CARTRIDGE LOADED</div>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* GAME STAGE */}
        <main className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
          
          {/* IDLE STATE */}
          {gameLoadState === GameLoadState.IDLE && (
            <div className="flex flex-col items-center animate-fade-in p-8 text-center z-10 max-w-md mx-auto">
              <div className="relative group cursor-pointer mb-8">
                 <div className="absolute inset-0 bg-red-600 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                 <div className="w-24 h-24 bg-zinc-900 rounded-xl flex items-center justify-center text-4xl border border-zinc-800 shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-300">
                   👾
                 </div>
              </div>
              
              <h2 className="text-xl text-white mb-3 font-['Press_Start_2P'] tracking-wide">INSERT COIN</h2>
              <p className="text-zinc-500 mb-8 text-xs leading-relaxed max-w-xs mx-auto font-mono">
                Upload a valid .NES ROM file to begin simulation.
              </p>
              
              <label className="relative overflow-hidden group cursor-pointer inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-gradient-to-b from-red-600 to-red-700 font-['Press_Start_2P'] text-[10px] rounded shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1 hover:brightness-110">
                <span className="relative z-10 flex items-center gap-2">
                   LOAD CARTRIDGE <span className="animate-pulse">_</span>
                </span>
                <input 
                  type="file" 
                  accept=".nes" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {/* PLAYING STATE */}
          {gameLoadState === GameLoadState.PLAYING && (
             <Emulator romData={romData} onStop={handleStop} scaleMode={scaleMode} />
          )}

          {/* DECORATIVE GRID (Background) */}
          <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-[0.02] pointer-events-none">
            {Array.from({ length: 1600 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-white"></div>
            ))}
          </div>
        </main>

        {/* SIDEBAR (Collapsible) */}
        <aside 
          className={`
            absolute md:relative inset-y-0 right-0 z-40
            w-full md:w-[340px] lg:w-[380px] 
            bg-zinc-950/95 backdrop-blur-sm md:bg-zinc-950 border-l border-zinc-800 
            transition-transform duration-300 ease-out
            ${showSidebar ? 'translate-x-0' : 'translate-x-full md:mr-[-340px] lg:mr-[-380px]'}
            flex flex-col shadow-2xl
          `}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
            <GameManual info={gameInfo} loading={loadingInfo} />
            
            <div className="px-5 mt-4 pt-4 border-t border-zinc-800">
               <h4 className="text-zinc-500 text-[10px] uppercase mb-3 font-bold tracking-wider">System Controls</h4>
               <ControllerLegend />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default App;