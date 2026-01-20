
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TriageResult, LocationState, ServicePoint } from '../types';
import { findNearestServicePoint } from '../services/locationService';
import { ANIMAL_FACTS } from '../services/mockData';
import { generateSpeech, decodeAudioData } from '../services/geminiService';
import L from 'leaflet';

interface Props {
  result: TriageResult;
  location: LocationState;
  onReset: () => void;
}

const MapDisplay: React.FC<{ point: ServicePoint; isPolice: boolean }> = ({ point, isPolice }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile
      }).setView([point.lat, point.lng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapInstance.current);

      const color = isPolice ? '#ef4444' : '#52b788';
      L.circleMarker([point.lat, point.lng], {
        radius: 12,
        fillColor: color,
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(mapInstance.current);
    }
  }, [point, isPolice]);

  return <div ref={mapRef} className="w-full h-48 rounded-[32px] border border-[#52b788]/20 shadow-inner overflow-hidden my-4" />;
};

export const ResultView: React.FC<Props> = ({ result, location, onReset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [manualResult, setManualResult] = useState<ServicePoint | null>(null);
  const [isReported, setIsReported] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rescue_success_count');
    if (saved) setSuccessCount(parseInt(saved, 10));
  }, []);

  const handleReportSuccess = () => {
    const newCount = successCount + 1;
    setSuccessCount(newCount);
    localStorage.setItem('rescue_success_count', newCount.toString());
    setIsReported(true);
    
    setTimeout(() => {
      onReset();
    }, 4500);
  };

  const handleReadAloud = async () => {
    if (isReading) return;
    setIsReading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const textToRead = `${result.species}. Diagnose: ${result.injury_details}. Wichtige Anweisung: ${result.advice}`;
      const audioBytes = await generateSpeech(textToRead);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsReading(false);
      source.start(0);
    } catch (err) {
      console.error("TTS Error:", err);
      setIsReading(false);
      alert("Sprachausgabe fehlgeschlagen.");
    }
  };

  const isPolice = result.category === 'POLICE';
  const themeBg = isPolice ? 'bg-red-950/30' : 'bg-[#1b4332]/30';
  const themeBorder = isPolice ? 'border-red-500/20' : 'border-[#52b788]/20';
  
  const nearest = useMemo(() => {
    if (manualResult) return { point: manualResult, distance: 0 };
    if (location.lat && location.lng) return findNearestServicePoint(location.lat, location.lng, result.category);
    return null;
  }, [location, result.category, manualResult]);

  const animalFact = ANIMAL_FACTS[Object.keys(ANIMAL_FACTS).find(k => result.species.includes(k)) || ""];

  if (isReported) {
    return (
      <div className="w-full max-w-lg mx-auto py-20 text-center space-y-8 animate-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-[#52b788]/30 blur-[60px] rounded-full"></div>
          <div className="relative w-32 h-32 bg-[#52b788] rounded-[40px] mx-auto flex items-center justify-center shadow-2xl rotate-3">
            <i className="fas fa-check text-5xl text-[#061a14]"></i>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white leading-none uppercase">Danke für<br/><span className="text-[#52b788]">deine Hilfe!</span></h2>
          <p className="text-[#95d5b2] font-medium italic text-lg px-8">Du hast ein Lebewesen vor unnötigem Leid bewahrt. Mission Erde dankt dir für deinen Mut.</p>
        </div>
        <div className="bg-[#1b4332]/40 backdrop-blur-md py-4 px-10 rounded-full inline-flex items-center gap-4 border border-[#52b788]/20 shadow-xl">
          <i className="fas fa-medal text-[#ffb703] text-xl animate-bounce"></i>
          <span className="text-sm font-black uppercase tracking-widest text-white">Deine Bilanz: {successCount} Gerettete Leben</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. Triage Status & Analysis */}
      <div className={`p-8 rounded-[48px] border-2 shadow-2xl relative overflow-hidden transition-colors duration-500 ${themeBg} ${themeBorder}`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shrink-0 ${isPolice ? 'bg-red-500 shadow-red-500/20' : 'bg-[#52b788] shadow-[#52b788]/20'}`}>
                <i className={`fas ${isPolice ? 'fa-shield-halved' : 'fa-house-medical'} text-4xl text-white`}></i>
              </div>
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.25em] ${isPolice ? 'text-red-300' : 'text-[#95d5b2]'} mb-1 opacity-80`}>KI-Ergebnis</p>
                <h2 className="text-4xl font-black text-white leading-none tracking-tight">{result.species}</h2>
              </div>
            </div>
            
            <button 
              onClick={handleReadAloud}
              disabled={isReading}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${isReading ? 'bg-white/10 text-white/40 cursor-wait' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <i className={`fas ${isReading ? 'fa-spinner fa-spin' : 'fa-volume-high'} text-xl`}></i>
            </button>
          </div>

          <div className="space-y-4">
             <div className="bg-[#061a14]/60 p-6 rounded-[32px] border border-[#52b788]/10 group hover:border-[#52b788]/30 transition-all">
                <h4 className={`text-[10px] font-black uppercase ${isPolice ? 'text-red-400' : 'text-[#52b788]'} mb-2 tracking-[0.2em] flex items-center gap-2`}>
                  <i className="fas fa-microscope text-[8px]"></i> Zustands-Diagnose
                </h4>
                <p className="text-[#d8f3dc] text-sm leading-relaxed font-medium">{result.injury_details}</p>
             </div>
             
             <div className={`${isPolice ? 'bg-red-500/10 border-red-500/20' : 'bg-[#52b788]/10 border-[#52b788]/20'} p-6 rounded-[32px] border shadow-inner`}>
                <h4 className={`text-[10px] font-black uppercase ${isPolice ? 'text-red-400' : 'text-[#52b788]'} mb-2 tracking-[0.2em] flex items-center gap-2`}>
                  <i className="fas fa-bolt-lightning text-[8px]"></i> Erste Hilfe Anweisung
                </h4>
                <p className="text-white leading-relaxed italic text-lg font-bold tracking-tight">"{result.advice}"</p>
             </div>
          </div>

          {isPolice && (
            <div className="mt-6 flex items-start gap-4 p-5 bg-red-500/10 rounded-3xl border border-red-500/30 shadow-lg">
              <i className="fas fa-triangle-exclamation text-red-500 mt-1 text-lg"></i>
              <p className="text-[11px] text-red-500 font-black leading-normal uppercase tracking-wide">
                Jagdrecht beachten: Eine eigenmächtige Mitnahme ist gesetzlich als Wilderei verboten. Warte auf die Polizei oder den Jäger.
              </p>
            </div>
          )}
        </div>
        <div className={`absolute -right-20 -top-20 w-60 h-60 rounded-full blur-[100px] opacity-30 ${isPolice ? 'bg-red-500' : 'bg-[#52b788]'}`}></div>
      </div>

      {/* 2. Prominent National Hotline */}
      <div className="relative group px-1">
        <div className="absolute inset-0 bg-[#ffb703]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative glass-card rounded-[40px] p-1.5 border-2 border-[#ffb703]/40 shadow-[0_15px_30px_-5px_rgba(255,183,3,0.15)]">
          <a
            href="tel:070034244677"
            className="w-full py-7 bg-[#ffb703] hover:bg-[#fb8500] text-[#061a14] font-black rounded-[36px] flex items-center justify-center gap-6 transition-all active:scale-[0.97] shadow-2xl overflow-hidden relative"
          >
            <div className="w-14 h-14 bg-[#061a14]/10 rounded-2xl flex items-center justify-center shrink-0">
              <i className="fas fa-phone-volume animate-bounce text-2xl"></i>
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 leading-none mb-1.5">Zentraler Notfallkontakt</p>
              <p className="text-2xl leading-none font-black tracking-tighter">NOTRUF TIERRETTUNG</p>
            </div>
            <i className="fas fa-chevron-right absolute right-8 opacity-20 group-hover:translate-x-1 transition-transform"></i>
          </a>
        </div>
      </div>

      {/* 3. Station Search (Einsatzstelle finden) */}
      <div className="glass-card rounded-[48px] p-8 space-y-6 shadow-2xl border border-white/5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <i className={`fas fa-map-location-dot ${isPolice ? 'text-red-500' : 'text-[#52b788]'} text-xl`}></i>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Umkreissuche</h3>
          </div>
          {location.accuracy && location.accuracy > 50 && (
             <span className="text-[9px] bg-[#ffb703]/10 text-[#ffb703] border border-[#ffb703]/30 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest">GPS Schwach</span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Ort oder PLZ eingeben..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-[#061a14]/60 border ${isPolice ? 'border-red-500/20 focus:border-red-500/60' : 'border-[#52b788]/20 focus:border-[#52b788]/60'} rounded-3xl py-5 pl-14 pr-4 text-sm text-white placeholder:text-white/20 focus:bg-[#061a14]/80 outline-none transition-all shadow-inner`}
          />
          <i className={`fas fa-search absolute left-6 top-1/2 -translate-y-1/2 ${isPolice ? 'text-red-500/60' : 'text-[#52b788]/60'}`}></i>
        </div>

        {nearest ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start mb-4 px-2">
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">{nearest.point.name}</h4>
                <p className="text-xs text-[#95d5b2] opacity-70 font-medium">{nearest.point.address}</p>
              </div>
              {nearest.distance > 0 && (
                <div className={`${isPolice ? 'bg-red-500/10 border-red-500/20' : 'bg-[#52b788]/10 border-[#52b788]/20'} px-3 py-1.5 rounded-2xl border text-right`}>
                   <p className={`text-xl font-black ${isPolice ? 'text-red-500' : 'text-[#52b788]'} leading-none`}>{nearest.distance.toFixed(1)}<span className="text-[10px] ml-1 opacity-60">KM</span></p>
                </div>
              )}
            </div>

            <MapDisplay point={nearest.point} isPolice={isPolice} />

            <div className="flex flex-col gap-4 mt-6">
              <a
                href={nearest.point.phone ? `tel:${nearest.point.phone}` : "tel:110"}
                className={`py-5 rounded-[28px] font-black flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl text-white ${isPolice ? 'bg-red-600 shadow-red-900/30 border-b-4 border-red-800' : 'bg-[#2d6a4f] shadow-[#1b4332]/40 border-b-4 border-[#1b4332]'}`}
              >
                <i className={`fas ${nearest.point.phone ? 'fa-phone-flip' : 'fa-shield-halved'} text-xl`}></i>
                {nearest.point.phone ? `RUFE STATION: ${nearest.point.phone}` : 'DIREKTNOTRUF 110'}
              </a>
              
              <button
                onClick={handleReportSuccess}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
              >
                <i className={`fas fa-check-double ${isPolice ? 'text-red-500' : 'text-[#52b788]'}`}></i>
                Rettung erfolgreich gemeldet
              </button>

              {manualResult && (
                 <button onClick={() => {setManualResult(null); setSearchQuery('');}} className={`text-[10px] font-black ${isPolice ? 'text-red-500' : 'text-[#52b788]'} uppercase tracking-widest py-3 text-center w-full opacity-60 hover:opacity-100 transition-opacity`}>Zurück zur GPS-Erkennung</button>
              )}
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 border-2 border-dashed ${isPolice ? 'border-red-500/10' : 'border-[#52b788]/10'} rounded-[32px] bg-white/[0.02]`}>
            <div className="relative inline-block mb-4">
              <i className={`fas fa-location-arrow text-3xl ${isPolice ? 'text-red-500' : 'text-[#52b788]'} animate-pulse`}></i>
              <div className={`absolute inset-0 ${isPolice ? 'bg-red-500/20' : 'bg-[#52b788]/20'} blur-xl animate-ping`}></div>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Suche nahegelegene Helfer...</p>
          </div>
        )}
      </div>

      {/* 4. Expert Links Section (Now below search) */}
      {result.links && result.links.length > 0 && (
        <div className="glass-card rounded-[40px] p-8 space-y-6 shadow-2xl border border-[#52b788]/10">
          <div className="flex items-center gap-3">
            <i className={`fas fa-hand-holding-medical ${isPolice ? 'text-red-500' : 'text-[#52b788]'} text-xl`}></i>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Spezialisierte Hilfe</h4>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {result.links.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-5 bg-[#061a14]/60 rounded-[24px] border ${isPolice ? 'border-red-500/20 hover:border-red-500/50' : 'border-[#52b788]/20 hover:border-[#52b788]/50'} hover:bg-[#061a14]/80 transition-all group shadow-sm`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 ${isPolice ? 'bg-red-500/10' : 'bg-[#52b788]/10'} rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-colors`}>
                      <i className={`fas fa-arrow-up-right-from-square ${isPolice ? 'text-red-500' : 'text-[#52b788]'} text-sm`}></i>
                   </div>
                   <span className="text-sm font-black text-white group-hover:text-opacity-80 transition-colors tracking-tight uppercase">{link.title}</span>
                </div>
                <i className="fas fa-chevron-right text-[10px] text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all"></i>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 5. Biological Facts */}
      {animalFact && (
        <div className={`bg-[#061a14]/40 rounded-[48px] border ${isPolice ? 'border-red-500/10' : 'border-[#52b788]/10'} p-10 space-y-8 shadow-inner overflow-hidden relative`}>
          <div className="flex items-center gap-4 relative z-10">
             <i className={`fas fa-leaf ${isPolice ? 'text-red-500' : 'text-[#52b788]'} text-xl`}></i>
             <h4 className="text-xl font-black text-white uppercase tracking-tight">Biologie & Fakten</h4>
          </div>
          <div className="grid grid-cols-2 gap-5 relative z-10">
            <div className={`bg-[#1b4332]/40 p-5 rounded-[28px] border ${isPolice ? 'border-red-500/10' : 'border-[#52b788]/10'} backdrop-blur-sm`}>
              <p className={`text-[10px] font-black ${isPolice ? 'text-red-500' : 'text-[#52b788]'} uppercase tracking-[0.2em] mb-2 opacity-80`}>Erkennungsmerkmal</p>
              <p className="text-xs text-white leading-relaxed font-medium">{animalFact.characteristics}</p>
            </div>
            <div className={`bg-[#1b4332]/40 p-5 rounded-[28px] border ${isPolice ? 'border-red-500/10' : 'border-[#52b788]/10'} backdrop-blur-sm`}>
              <p className={`text-[10px] font-black ${isPolice ? 'text-red-500' : 'text-[#52b788]'} uppercase tracking-[0.2em] mb-2 opacity-80`}>Lebensraum</p>
              <p className="text-xs text-white leading-relaxed font-medium">{animalFact.habitat}</p>
            </div>
          </div>
          <div className={`p-6 ${isPolice ? 'bg-red-500/5 border-red-500/15' : 'bg-[#52b788]/5 border-[#52b788]/15'} rounded-[32px] border relative z-10 shadow-lg`}>
             <div className="flex items-center gap-3 mb-3">
                <i className="fas fa-lightbulb text-[#ffb703] text-sm animate-pulse"></i>
                <span className="text-[10px] font-black text-[#ffb703] uppercase tracking-[0.2em]">Wusstest du schon?</span>
             </div>
             <p className="text-sm text-[#d8f3dc] italic leading-relaxed font-medium">"{animalFact.funFact}"</p>
          </div>
          <div className={`absolute -left-10 -bottom-10 w-40 h-40 ${isPolice ? 'bg-red-500/10' : 'bg-[#52b788]/10'} blur-[60px] rounded-full`}></div>
        </div>
      )}

      {/* Final Action */}
      <div className="flex flex-col items-center gap-8 pt-4">
        <div className={`h-[1px] w-1/3 bg-gradient-to-r from-transparent via-${isPolice ? 'red-500' : '[#52b788]'}/20 to-transparent`}></div>
        
        <div className={`flex items-center gap-3 ${isPolice ? 'text-red-500/40' : 'text-[#52b788]/40'} text-[10px] font-black uppercase tracking-[0.4em]`}>
           <i className="fas fa-circle-nodes text-[6px] animate-pulse"></i>
           Mission Erde Rettungs-Netzwerk
        </div>

        <button 
          onClick={onReset} 
          className="w-full py-5 text-white/40 hover:text-white transition-all text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 bg-white/5 rounded-3xl active:scale-[0.98] border border-white/5"
        >
          <i className="fas fa-arrow-rotate-left"></i> Neuen Scan starten
        </button>
      </div>

    </div>
  );
};
