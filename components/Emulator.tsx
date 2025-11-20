import React, { useEffect, useRef, useState, useCallback } from 'react';
import { JSNESInstance } from '../types';
import CrtEffect from './CrtEffect';

interface EmulatorProps {
  romData: string | null;
  onStop: () => void;
  scaleMode: 'fit' | 'stretch';
}

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

const Emulator: React.FC<EmulatorProps> = ({ romData, onStop, scaleMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  const requestRef = useRef<number | null>(null);
  const nesRef = useRef<JSNESInstance | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  // Audio state
  const audioSamples = useRef<number[]>([]);
  const BUFFER_LIMIT = 8192;

  // Initialize NES
  useEffect(() => {
    if (!window.jsnes) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }

    nesRef.current = new window.jsnes.NES({
      onFrame: (buffer: number[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
        const buf32 = new Uint32Array(imageData.data.buffer);
        for (let i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT; ++i) {
           buf32[i] = 0xFF000000 | buffer[i];
        }
        ctx.putImageData(imageData, 0, 0);
      },
      onAudioSample: (left: number, right: number) => {
        audioSamples.current.push(left);
        if (audioSamples.current.length > BUFFER_LIMIT) {
            audioSamples.current = audioSamples.current.slice(-BUFFER_LIMIT);
        }
      },
      sampleRate: 44100
    });

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio Processing
  const startAudio = useCallback(() => {
    if (!audioCtxRef.current || !nesRef.current) return;
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const scriptNode = audioCtxRef.current.createScriptProcessor(4096, 0, 1);
    scriptNode.onaudioprocess = (audioProcessingEvent) => {
      const outputBuffer = audioProcessingEvent.outputBuffer;
      const outputData = outputBuffer.getChannelData(0);
      
      const samples = audioSamples.current;
      if (samples.length >= outputData.length) {
          const playData = samples.splice(0, outputData.length);
          for (let i = 0; i < outputData.length; i++) {
              outputData[i] = playData[i];
          }
      } else {
          for (let i = 0; i < outputData.length; i++) {
              outputData[i] = 0;
          }
      }
    };
    
    scriptNode.connect(audioCtxRef.current.destination);
    scriptNodeRef.current = scriptNode;
  }, []);

  const stop = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    if (!nesRef.current) return;
    nesRef.current.frame();
    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (romData && nesRef.current) {
      try {
        nesRef.current.loadROM(romData);
        startAudio();
        loop();
        setFps(60);
      } catch (e) {
        console.error("Failed to load ROM", e);
        onStop();
      }
    }
    return () => {
      stop();
    };
  }, [romData, loop, startAudio, stop, onStop]);

  // Controls
  useEffect(() => {
    const handleKey = (value: number) => (e: KeyboardEvent) => {
      if (!nesRef.current) return;
      const { Controller } = window.jsnes;
      const P1 = 1; 
      switch (e.key) {
        case 'x': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_A); break;
        case 'z': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_B); break;
        case 'Control': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_SELECT); break;
        case 'Enter': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_START); break;
        case 'ArrowUp': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_UP); break;
        case 'ArrowDown': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_DOWN); break;
        case 'ArrowLeft': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_LEFT); break;
        case 'ArrowRight': nesRef.current[value === 1 ? 'buttonDown' : 'buttonUp'](P1, Controller.BUTTON_RIGHT); break;
        default: return;
      }
    };

    const downHandler = handleKey(1);
    const upHandler = handleKey(0);

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  if (!romData) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black group">
        <div className={`
          relative bg-black shadow-[0_0_150px_rgba(0,0,0,1)]
          transition-all duration-500 ease-in-out
          ${scaleMode === 'fit' ? 'aspect-[4/3] h-full max-w-full' : 'w-full h-full'}
        `}>
          <CrtEffect />
          <canvas 
              ref={canvasRef} 
              width={SCREEN_WIDTH} 
              height={SCREEN_HEIGHT} 
              className="w-full h-full block"
              style={{ 
                imageRendering: 'pixelated',
              }}
          />
        </div>
        
        {/* FPS Overlay */}
        <div className="absolute top-4 right-4 text-[10px] text-green-500/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {fps} FPS
        </div>
    </div>
  );
};

export default Emulator;