
import React, { useState, useEffect, useRef } from 'react';
import { analyzeAnimal, compressImage } from './services/geminiService';
import { TriageResult, LocationState } from './types';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ResultView } from './components/ResultView';
import { RescueAssistant } from './components/RescueAssistant';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

type ViewState = 'HOME' | 'RESULT' | 'ASSISTANT';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [lastView, setLastView] = useState<ViewState>('HOME');
  const [location, setLocation] = useState<LocationState>({ lat: null, lng: null, accuracy: null, error: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevLocationRef = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          if (prevLocationRef.current && image && view === 'HOME') {
            const dist = getDistance(prevLocationRef.current.lat, prevLocationRef.current.lng, latitude, longitude);
            if (dist > 200) {
              setImage(null);
              alert("Standort-Drift erkannt! Bitte nimm das Foto direkt am Fundort erneut auf.");
            }
          }
          setLocation({ lat: latitude, lng: longitude, accuracy: accuracy, error: null });
          prevLocationRef.current = { lat: latitude, lng: longitude };
        },
        (err) => setLocation((prev) => ({ ...prev, error: err.message })),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [image, view]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      let dataUrl = reader.result?.toString() || null;
      if (dataUrl) {
        dataUrl = await compressImage(dataUrl);
      }
      setImage(dataUrl);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const data = await analyzeAnimal(base64);
      setResult(data);
      setView('RESULT');
    } catch (err) {
      alert("Fehler bei der Analyse. Prüfe deine Verbindung.");
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setView('HOME');
  };

  const openAssistant = () => {
    setLastView(view);
    setView('ASSISTANT');
  };

  const closeAssistant = () => {
    setView(lastView);
  };

  return (
    <div className="min-h-screen mission-gradient flex flex-col p-6 safe-area-inset relative">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2d6a4f] rounded-2xl flex items-center justify-center shadow-2xl border border-[#52b788]/30">
            <i className="fas fa-leaf text-[#b7e4c7] text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Wild<span className="text-[#52b788]">Retter</span></h1>
            <p className="text-[10px] font-bold text-[#95d5b2] uppercase tracking-[0.2em]">Mission Erde Community</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${location.lat ? (location.accuracy && location.accuracy < 50 ? 'bg-[#1b4332]/50 border-[#52b788]/50' : 'bg-yellow-500/20 border-yellow-500/50') : 'bg-red-500/20 border-red-500/50'}`}>
           <span className={`w-2 h-2 rounded-full ${location.lat ? (location.accuracy && location.accuracy < 50 ? 'bg-[#52b788] animate-pulse' : 'bg-yellow-500') : 'bg-red-500'}`}></span>
           <span className="text-[9px] font-black uppercase text-white/80">{location.lat ? (location.accuracy && location.accuracy < 50 ? 'GPS OK' : 'GPS Ungenau') : 'Kein GPS'}</span>
        </div>
      </header>

      {!result && view === 'HOME' && location.accuracy !== null && location.accuracy > 50 && (
        <div className="mb-6 p-5 bg-[#ffb703]/10 border border-[#ffb703]/40 rounded-3xl flex items-center gap-5 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-[#ffb703]/20 flex items-center justify-center flex-shrink-0">
            <i className="fas fa-location-crosshairs text-[#ffb703] text-lg"></i>
          </div>
          <p className="text-[11px] font-bold text-[#ffb703] uppercase leading-tight tracking-wide">
            Ungenauer Standort ({Math.round(location.accuracy)}m). <br/>
            <span className="text-white/60 font-medium normal-case">Suche freie Sicht zum Himmel für bessere Hilfe.</span>
          </p>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center">
        {view === 'HOME' && (
          <div className="text-center w-full max-w-md space-y-10">
            {!image ? (
              <div className="animate-in fade-in zoom-in duration-700 space-y-12">
                <div className="relative mx-auto w-64 h-64">
                  <div className="absolute inset-0 bg-[#52b788]/10 rounded-full blur-[80px] animate-pulse"></div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full h-full rounded-full glass-card border-4 border-[#52b788]/20 flex flex-col items-center justify-center shadow-3xl transition-all active:scale-95 group overflow-hidden"
                  >
                    <div className="absolute inset-4 border border-[#52b788]/10 rounded-full"></div>
                    <i className="fas fa-camera text-7xl text-[#52b788] mb-4 group-hover:scale-110 transition-transform duration-500"></i>
                    <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">Kamera Scan</span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white leading-none tracking-tight uppercase">Sie brauchen<br/><span className="text-[#52b788]">deine Hilfe.</span></h2>
                    <p className="text-[#95d5b2] text-sm font-medium leading-relaxed px-10">
                      KI-gestützte Triage & Rettung. Mache ein Foto oder sprich mit unserem Assistenten.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
                <div className="relative mx-auto w-72 h-72 rounded-[48px] overflow-hidden border-4 border-[#52b788] shadow-2xl relative">
                  <img src={image} className="w-full h-full object-cover" alt="Scan" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061a14]/90 to-transparent"></div>
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <span className="bg-[#52b788] text-[#061a14] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Bereit zur Analyse</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={triggerAnalysis}
                    className="w-full py-6 bg-[#52b788] hover:bg-[#40916c] text-[#081c15] font-black rounded-[28px] shadow-2xl shadow-[#52b788]/20 transition-all active:scale-95 flex items-center justify-center gap-4 text-xl tracking-tight"
                  >
                    <i className="fas fa-microscope text-2xl"></i>
                    JETZT ANALYSIEREN
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 glass-card text-white font-bold rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                  >
                    <i className="fas fa-camera-rotate"></i>
                    Anderes Bild aufnehmen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'ASSISTANT' && (
          <RescueAssistant onBack={closeAssistant} />
        )}

        {view === 'RESULT' && result && (
          <div className="w-full flex-1">
             <ResultView result={result} location={location} onReset={reset} />
          </div>
        )}

        {loading && <LoadingOverlay />}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </main>

      {/* Persistent Floating Rescue Agent Button */}
      {view !== 'ASSISTANT' && !loading && (
        <button
          onClick={openAssistant}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#52b788] rounded-full flex items-center justify-center text-[#061a14] shadow-[0_10px_40px_rgba(82,183,136,0.4)] hover:bg-[#40916c] transition-all active:scale-90 z-40 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500"
        >
          <div className="absolute inset-0 rounded-full bg-[#52b788] animate-ping opacity-20"></div>
          <i className="fas fa-headset text-2xl"></i>
        </button>
      )}

      {view === 'HOME' && !loading && (
        <footer className="mt-12 text-center pb-8 animate-in fade-in duration-1000">
          <p className="text-[9px] text-[#52b788]/30 font-black uppercase tracking-[0.5em] mb-6">Für die Artenvielfalt & Mission Erde</p>
          <div className="flex justify-center gap-12 opacity-15 grayscale hover:opacity-50 hover:grayscale-0 transition-all duration-700 cursor-default">
             <i className="fas fa-shield-halved text-2xl"></i>
             <i className="fas fa-tree text-2xl"></i>
             <i className="fas fa-dove text-2xl"></i>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
