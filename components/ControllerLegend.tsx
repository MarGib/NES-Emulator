import React from 'react';

const ControllerLegend: React.FC = () => {
  const mappings = [
    { nes: 'D-PAD', key: 'Arrows' },
    { nes: 'A', key: 'X' },
    { nes: 'B', key: 'Z' },
    { nes: 'START', key: 'Enter' },
    { nes: 'SELECT', key: 'Ctrl' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs font-mono text-gray-400">
      {mappings.map((m) => (
        <div key={m.nes} className="flex justify-between items-center bg-black/30 p-1.5 rounded border border-white/5">
          <span className="text-red-400 font-bold">{m.nes}</span>
          <span className="text-gray-200">{m.key}</span>
        </div>
      ))}
    </div>
  );
};

export default ControllerLegend;