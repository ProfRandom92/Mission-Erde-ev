
import React, { useState, useEffect } from 'react';

const messages = [
  "Bild wird analysiert...",
  "Spezies wird identifiziert...",
  "Rechtliche Zuständigkeit wird geprüft...",
  "Erste-Hilfe-Maßnahmen werden generiert...",
];

export const LoadingOverlay: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
          <i className="fas fa-paw text-3xl"></i>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 text-center animate-pulse">KI-Triage aktiv</h2>
      <p className="text-slate-400 text-center">{messages[index]}</p>
    </div>
  );
};
