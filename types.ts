export interface GameInfo {
  title: string;
  description: string;
  releaseDate: string;
  genre: string;
  funFacts: string[];
  controls: { action: string; key: string }[];
}

export enum GameLoadState {
  IDLE,
  LOADING,
  PLAYING,
  ERROR,
}

// Type definitions for the global jsnes library loaded via CDN
export interface JSNESOptions {
  onFrame: (buffer: number[]) => void;
  onAudioSample: (left: number, right: number) => void;
  sampleRate?: number;
}

export interface JSNESInstance {
  buttonDown: (controller: number, button: number) => void;
  buttonUp: (controller: number, button: number) => void;
  loadROM: (romData: string) => void;
  frame: () => void;
  reset: () => void;
}

export interface JSNESController {
  BUTTON_A: number;
  BUTTON_B: number;
  BUTTON_SELECT: number;
  BUTTON_START: number;
  BUTTON_UP: number;
  BUTTON_DOWN: number;
  BUTTON_LEFT: number;
  BUTTON_RIGHT: number;
}

declare global {
  interface Window {
    jsnes: {
      NES: new (opts: JSNESOptions) => JSNESInstance;
      Controller: JSNESController;
    };
  }
}