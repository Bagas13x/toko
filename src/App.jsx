import React, { useState, useEffect, useRef, useMemo } from 'react';
import bagasImg from "./assets/bagas.jpg";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, setDoc, deleteField, where, getDocs, 
  serverTimestamp, limit 
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Menu, X, ShoppingBag, ArrowRight, Phone, Instagram, MapPin, 
  Check, AlertTriangle, XCircle, Search, Star, Bell, AlertCircle, 
  Send, Loader2, PauseCircle, Camera, FileText, Layout, LayoutTemplate, 
  List, Upload, Trash2, Pencil, LogOut, Lock, ChevronDown, ChevronUp,
  Image as ImageIcon, CheckCircle2, Activity, MessageSquare, ExternalLink, 
  Play, Disc, Globe, BookOpen, Trophy, ShieldAlert, Key, HelpCircle, 
  ChevronRight, RefreshCw, Award, LockKeyhole, Eye, CheckSquare
} from 'lucide-react';

// ============================================================
// 1. DATABASE ENGINE CONFIGURATION
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDep19oGqL8o0_LUZNbhLuRgCgyeLHdYQM",
  authDomain: "toko-19d24.firebaseapp.com",
  projectId: "toko-19d24",
  storageBucket: "toko-19d24.firebasestorage.app",
  messagingSenderId: "409041876870",
  appId: "1:409041876870:web:1aab7a9b842f8b14801e07",
  measurementId: "G-9LKCM0DD6H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================================
// 2. MULTI-LANGUAGE ENGINE
// ============================================================
const translations = {
  jawa: {
    home: "Omah", store: "Toko", chief: "Admin", explore: "TUKU", academy: "Sinau",
    future: "Tokko", philosophy: "Kabeh Kebutuhan Premiummu ana Ning Kene",
    search: "Golek Aplikasi Premium..", detail: "Detail", price: "Rego", spec: "Spek",
    journal: "Jurnal", status: "Status", reviews: "Review", customer: "Pelanggan",
    nonCustomer: "Tamu", verify: "Verifikasi Email", verifyBtn: "Cek",
    guestBtn: "Nulis Dadi Tamu", pending: "Ngenteni Admin", postReview: "Kirim Review",
    logout: "Metu", ProduksTitle: "JOSS", ProduksDesc: "Pilihan Paling Joss Ning Kene"
  },
  id: {
    home: "Beranda", store: "Toko", chief: "Admin", explore: "Produk", academy: "Akademi",
    future: "Tokko", philosophy: "Semua Kebutuhan Premiummu Ada di Sini",
    search: "Cari Aplikasi Premium..", detail: "Detail", price: "Harga", spec: "Spesifikasi",
    journal: "Jurnal", status: "Status", reviews: "Ulasan", customer: "Pelanggan",
    nonCustomer: "Tamu", verify: "Verifikasi Email", verifyBtn: "Cek",
    guestBtn: "Tulis Sebagai Tamu", pending: "Menunggu Admin", postReview: "Kirim Ulasan",
    logout: "Keluar", ProduksTitle: "TERBAIK", ProduksDesc: "Pilihan Produk Terbaik Kami"
  },
  en: {
    home: "Home", store: "Store", chief: "Administrator", explore: "Products", academy: "Academy",
    future: "Tokko", philosophy: "All Your Premium Needs Are Here",
    search: "Search for Premium Applications..", detail: "Details", price: "Price", spec: "Specifications",
    journal: "Journal", status: "Status", reviews: "Reviews", customer: "Customer",
    nonCustomer: "Guest", verify: "Email Verification", verifyBtn: "Check",
    guestBtn: "Write as Guest", pending: "Pending Admin", postReview: "Submit Review",
    logout: "Log Out", ProduksTitle: "BEST", ProduksDesc: "Our Best Product Selections"
  }
};

// ============================================================
// 3. ARCHITECTURAL STYLES (CSS)
// ============================================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;700&family=Syne:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
  
  :root { 
    --primary: #000000; 
    --accent: #ea281e; 
    --bg: #ffffff; 
    --text: #000000; 
  }

  body { 
    background-color: var(--bg); color: var(--text); 
    font-family: 'Syne', sans-serif; cursor: none; overflow-x: hidden; 
    -webkit-font-smoothing: antialiased;
  }
  
  @media (hover: none) and (pointer: coarse) { .custom-cursor { display: none; } body { cursor: auto; } }

  .custom-cursor { 
    position: fixed; top: 0; left: 0; width: 20px; height: 20px; 
    background: var(--primary); border-radius: 50%; pointer-events: none; 
    z-index: 9999; transform: translate(-50%, -50%); 
    transition: width 0.3s, height 0.3s, background 0.3s, transform 0.1s; mix-blend-mode: difference; 
  }
  .custom-cursor.hovered { width: 60px; height: 60px; background: rgba(234, 40, 30, 0.2); border: 2px solid var(--accent); }
  
  h1, h2, h3, .font-heading { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: -0.02em; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  .fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(40px); }
  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
  
  .marquee-container { overflow: hidden; white-space: nowrap; }
  .marquee-content { display: inline-block; animation: marquee 30s linear infinite; }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  
  .menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #000000; z-index: 500; transform: translateY(-100%); transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1); display: flex; flex-direction: column; justify-content: center; padding: 2rem; }
  .menu-overlay.open { transform: translateY(0); }
  .menu-link { font-family: 'Oswald', sans-serif; font-size: 12vw; md:font-size: 8vw; font-weight: 700; color: white; opacity: 0; transform: translateY(50px); transition: 0.5s; cursor: none; line-height: 1.1; text-transform: uppercase; }
  .menu-overlay.open .menu-link { opacity: 1; transform: translateY(0); }
  
  .store-card { border: 1px solid #e5e5e5; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); background: white; }
  .tab-btn { font-family: 'Oswald', sans-serif; font-size: 1rem; md:font-size: 1.2rem; font-weight: 500; padding-bottom: 0.5rem; color: #9ca3af; transition: 0.3s; text-transform: uppercase; }
  .tab-btn.active { color: var(--primary); border-bottom: 3px solid var(--accent); }
  
  ::-webkit-scrollbar { height: 2px; width: 4px; }
  ::-webkit-scrollbar-thumb { background: black; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .admin-login-bg { background: radial-gradient(circle at top right, #111, #000); }
  .video-portrait { aspect-ratio: 9/16; object-fit: cover; width: 100%; border: 1px solid black; }

  .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
`;

// ============================================================
// 4. LOW-LEVEL UI COMPONENTS
// ============================================================
const CustomCursor = () => {
  const cursorRef = useRef(null);
  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);
  return <div ref={cursorRef} className="custom-cursor" />;
};

const Header = ({ isMenuOpen, setIsMenuOpen, setView, lang, setLang, t }) => (
  <header className="fixed top-0 w-full z-[400] px-4 md:px-12 py-4 md:py-6 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
    <div onClick={() => setView('landing')} className="font-heading font-bold text-2xl md:text-3xl tracking-tighter cursor-hover pointer-events-auto select-none">TOKKO.</div>
    <div className="flex items-center gap-3 md:gap-6 pointer-events-auto">
        <div className="flex gap-1 md:gap-3 text-[9px] md:text-[10px] font-bold">
            {['jawa', 'id', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`uppercase px-1.5 py-0.5 border border-white/20 hover:bg-white hover:text-black transition-colors ${lang === l ? 'bg-white text-black' : ''}`}>{l}</button>
            ))}
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 md:gap-3 font-heading uppercase text-xs md:text-sm font-bold tracking-widest cursor-hover group">
          <span className="hidden sm:block">{isMenuOpen ? "CLOSE" : t?.home || "HOME"}</span>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white flex items-center justify-center group-hover:bg-[#ea281e] group-hover:border-[#ea281e] transition-colors">
              {isMenuOpen ? <X size={18}/> : <Menu size={18}/>}
          </div>
        </button>
    </div>
  </header>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-4 md:p-6 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white max-w-2xl w-full p-6 md:p-8 border-2 border-black shadow-[10px_10px_0_#ea281e] relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 hover:rotate-90 transition cursor-hover"><X size={28}/></button>
        <h2 className="text-3xl md:text-4xl font-heading mb-6 md:mb-8 border-b-2 border-black pb-4 tracking-tighter uppercase">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const TimeDisplay = ({ targetDate, status }) => {
  const [timeLeft, setTimeLeft] = useState("...");
  useEffect(() => {
    if (status !== 'Aktif') { setTimeLeft("PAUSED"); return; }
    const interval = setInterval(() => {
      const now = new Date();
      const target = targetDate?.seconds ? new Date(targetDate.seconds * 1000) : new Date(targetDate);
      const distance = target - now;
      if (distance < 0) { setTimeLeft("EXPIRED"); return; }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
      setTimeLeft(`${d}D ${h}H`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, status]);
  return <span className="font-mono text-[10px] md:text-xs font-bold text-[#ea281e]">{timeLeft}</span>;
};
// ============================================================
// 5. LANDING PAGE VIEW
// ============================================================
const LandingPage = ({ setView, catalog, t }) => (
  <div className="w-full bg-white text-black">
    <section className="h-screen flex flex-col justify-center px-6 md:px-12 pt-10 md:pt-20 relative overflow-hidden">
      {/* <h1 className="text-[20vw] md:text-[18vw] leading-[0.8] font-bold font-heading fade-up" style={{animationDelay: '0.1s'}}>{t?.digital || "TOKKO"}</h1> */}
      <div className="flex items-center gap-4 fade-up" style={{animationDelay: '0.2s'}}>
          <h1 className="text-[20vw] md:text-[18vw] font-bold font-heading text-[#ea281e]">{t?.future || "TOKKO"}</h1>
          <button onClick={() => setView('store')} className="hidden md:flex w-40 h-40 rounded-full border border-black items-center justify-center font-heading font-bold text-lg hover:bg-black hover:text-white transition-all cursor-hover">{t?.explore || "EXPLORE"}</button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-8 md:mt-12 gap-6 md:gap-8 fade-up" style={{animationDelay: '0.4s'}}>
        <p className="max-w-xl text-lg md:text-2xl leading-relaxed font-semibold uppercase">{t?.philosophy || "Semua Kebutuhan Premiummu Ada di Sini"}</p>
        <button onClick={() => setView('store')} className="md:hidden border-2 border-black px-8 py-3 font-heading font-bold text-lg hover:bg-black hover:text-white transition-all uppercase">{t?.explore || "EXPLORE"} STORE</button>
      </div>
    </section>

    <div className="bg-black text-white py-6 md:py-10 marquee-container transform -rotate-1">
      <div className="marquee-content text-4xl md:text-8xl font-heading font-bold uppercase">• Full Warranty • Trusted Partner • 24/7 Hours • RealTime Duration •</div>
    </div>

    <section className="px-6 md:px-12 py-20 md:py-32 bg-[#f9f9f9]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <div className="md:sticky md:top-32">
          <h2 className="text-6xl md:text-9xl font-heading leading-none tracking-tighter uppercase">PRODUK<br/><span className="text-[#ea281e]">{t?.ProduksTitle || "BEST"}</span></h2>
          <p className="mt-4 md:mt-8 text-lg md:text-xl text-gray-600 max-w-sm uppercase font-semibold">{t?.ProduksDesc || "Our Best Selections"}</p>
        </div>
        <div className="space-y-20 md:space-y-32">
          {(catalog || []).slice(0, 3).map((item, idx) => (
            <div key={item.firebaseId || idx} className="group cursor-hover" onClick={() => setView('store')}>
              <div className="aspect-[4/5] bg-gray-200 mb-6 md:mb-8 overflow-hidden border border-black relative">
                {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name}/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl md:text-8xl font-heading text-white bg-zinc-900 italic">{idx + 1}</div>
                )}
              </div>
              <h3 className="text-3xl md:text-5xl font-heading tracking-tighter italic uppercase">{item.name}</h3>
              <p className="font-mono text-[10px] md:text-xs text-gray-500 mt-2 uppercase font-bold tracking-widest">{item.app}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-6 md:px-12 py-24 md:py-40 bg-black text-white text-center relative">
      <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-12 md:mb-16">
        <div className="absolute top-3 left-3 w-full h-full bg-[#ea281e]"></div>
        <div className="relative w-full h-full overflow-hidden border border-zinc-800 bg-zinc-900">
          <img src={bagasImg} alt="Admin" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" />
        </div>
      </div>
      <h2 className="text-3xl md:text-6xl font-heading mb-8 md:mb-12 max-w-4xl mx-auto italic leading-tight px-4 tracking-tighter uppercase">"Kepercayaan kamu, prioritas kami."</h2>
      <div className="w-16 h-[2px] bg-[#ea281e] mx-auto mb-8"></div>
      <a href="https://instagram.com/13bagas.exv" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-gray-500 hover:text-white transition-colors">Instagram</a>
    </section>
  </div>
);

// ============================================================
// 6. ACADEMY MODULE (LMS SYSTEM WITH ANTI-CHEAT)
// ============================================================
const AcademyModule = ({ episodes, t }) => {
  const [currentEpIdx, setCurrentEpIdx] = useState(0);
  const [activeStage, setActiveStage] = useState('materi'); // materi, kuis, kesimpulan, result
  const [cheatCount, setCheatCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [conclusionText, setConclusionText] = useState("");
  const [isFinishedAll, setIsFinishedAll] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const activeEp = episodes[currentEpIdx];

  // ANTI-CHEAT LOGIC ENGINE
  useEffect(() => {
    const triggerCheatWarning = () => {
      if (isFinishedAll || activeStage === 'selesai') return;
      
      setCheatCount(prev => {
        const updated = prev + 1;
        if (updated >= 5) {
          alert("SISTEM KEAMANAN: Anda terdeteksi curang (Pindah Tab/Minimize) 5x. Progress di-reset!");
          setCurrentEpIdx(0);
          setActiveStage('materi');
          setConclusionText("");
          setUserAnswers({});
          return 0;
        }
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        alert(`PERINGATAN: Jangan tinggalkan halaman kelas! (${updated}/5)`);
        return updated;
      });
    };

    const handleVisibility = () => { if (document.hidden) triggerCheatWarning(); };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, [isFinishedAll, activeStage]);

  const handleMateriSelesai = () => setActiveStage('kuis');

  const handleQuizSubmit = () => {
    const totalQuestions = activeEp?.questions?.length || 0;
    if (Object.keys(userAnswers).length < totalQuestions) {
      alert("Jawab semua pertanyaan kuis!");
      return;
    }
    setActiveStage('kesimpulan');
  };

  const handleConclusionSubmit = () => {
    if (conclusionText.length < 50) {
      alert("Kesimpulan terlalu singkat (Min. 50 Karakter).");
      return;
    }
    if (currentEpIdx < episodes.length - 1) setActiveStage('transisi');
    else { setIsFinishedAll(true); setActiveStage('selesai'); }
  };

  if (!activeEp && episodes.length === 0) return <div className="py-40 text-center font-heading text-4xl uppercase text-zinc-300">Kelas Belum Tersedia</div>;

  return (
    <div className={`min-h-screen pt-20 pb-40 ${isShaking ? 'shake' : ''}`}>
      <div className="max-w-4xl mx-auto px-6">
        {/* PROGRESS HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b-4 border-black pb-8">
          <div>
            <span className="bg-[#ea281e] text-white px-4 py-1 font-heading text-lg italic uppercase tracking-widest">Session 01: Marketing</span>
            <h1 className="text-4xl md:text-6xl font-heading tracking-tighter leading-none mt-2 uppercase">Episode {currentEpIdx + 1}: <span className="text-zinc-400">{activeEp?.title}</span></h1>
          </div>
          <div className="flex items-center gap-4 bg-zinc-100 p-4 border-2 border-black shadow-[4px_4px_0_black]">
            <ShieldAlert className={cheatCount > 0 ? "text-[#ea281e] animate-pulse" : "text-zinc-400"} />
            <div className="font-mono text-xs uppercase font-black">
              <p>Cheat Detector</p>
              <p className="text-lg">{cheatCount} / 5</p>
            </div>
          </div>
        </div>

        {/* STAGE: MATERI */}
        {activeStage === 'materi' && (
          <div className="fade-up space-y-10 text-center">
            <div className="aspect-video bg-zinc-900 border-4 border-black shadow-[15px_15px_0_#ea281e] flex flex-col items-center justify-center p-8 relative">
               <Globe size={100} className="text-[#ea281e] mb-6 opacity-80" />
               <h2 className="text-3xl md:text-5xl font-heading text-white mb-4 uppercase tracking-tighter">Buka Materi Pembelajaran</h2>
               <p className="text-zinc-400 font-mono text-xs uppercase mb-8">Anda wajib membuka link Google Drive untuk mengaktifkan kuis.</p>
               <a href={activeEp?.driveLink} target="_blank" rel="noreferrer" onClick={() => setTimeout(() => {document.getElementById('btn-nx')?.classList.remove('opacity-0')}, 2000)} className="bg-white text-black px-12 py-5 font-heading text-2xl flex items-center gap-4 hover:bg-[#ea281e] hover:text-white transition-all uppercase">Buka GDrive <ExternalLink /></a>
            </div>
            <div id="btn-nx" className="opacity-0 transition-opacity duration-1000">
               <button onClick={handleMateriSelesai} className="bg-black text-white px-10 py-6 font-heading text-2xl uppercase flex items-center gap-4 mx-auto">Selesai Belajar <ChevronRight /></button>
            </div>
          </div>
        )}

        {/* STAGE: KUIS */}
        {activeStage === 'kuis' && (
          <div className="fade-up space-y-12">
            <div className="bg-black text-white p-6 border-l-[12px] border-[#ea281e] font-heading text-2xl uppercase tracking-tighter">Checkpoint: Quiz Session</div>
            {(activeEp?.questions || []).map((q, idx) => (
              <div key={idx} className="border-4 border-black p-8 bg-white shadow-[10px_10px_0_black]">
                <p className="text-2xl md:text-3xl font-heading mb-8 uppercase leading-none">{idx + 1}. {q.text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, i) => (
                    <button key={i} onClick={() => setUserAnswers({...userAnswers, [idx]: i})} className={`text-left p-5 border-2 font-bold uppercase text-xs tracking-widest transition-all ${userAnswers[idx] === i ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-400 hover:border-black'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleQuizSubmit} className="w-full bg-black text-white py-8 font-heading text-4xl uppercase hover:bg-[#ea281e] transition-all">Validasi Kuis</button>
          </div>
        )}

        {/* STAGE: KESIMPULAN */}
        {activeStage === 'kesimpulan' && (
          <div className="fade-up space-y-10">
            <div className="text-center"><FileText size={80} className="mx-auto mb-4" /><h2 className="text-5xl font-heading uppercase tracking-tighter">Kesimpulan</h2></div>
            <textarea placeholder="Apa yang Anda pelajari? (Min. 50 Karakter)" className="w-full h-80 border-4 border-black p-8 font-mono text-lg outline-none focus:border-[#ea281e] bg-zinc-50 uppercase shadow-[inner_4px_4px_10px_rgba(0,0,0,0.1)]" value={conclusionText} onChange={(e) => setConclusionText(e.target.value)} />
            <button onClick={handleConclusionSubmit} disabled={conclusionText.length < 50} className="w-full bg-black text-white py-6 font-heading text-3xl uppercase hover:bg-green-600 disabled:bg-zinc-300 transition-all">Selesaikan Episode</button>
          </div>
        )}

        {/* STAGE: TRANSISI */}
        {activeStage === 'transisi' && (
          <div className="fade-up text-center py-20 border-4 border-dashed border-black bg-zinc-50 space-y-8 uppercase">
             <Award size={100} className="mx-auto text-green-600 animate-bounce" />
             <h2 className="text-6xl font-heading tracking-tighter">LULUS EPISODE!</h2>
             <button onClick={() => {setCurrentEpIdx(prev => prev + 1); setActiveStage('materi'); setConclusionText(""); setUserAnswers({});}} className="bg-black text-white px-16 py-6 font-heading text-3xl hover:bg-[#ea281e] transition-all shadow-[10px_10px_0_black]">Lanjut Episode {currentEpIdx + 2}</button>
          </div>
        )}

        {/* STAGE: SELESAI & HADIAH */}
        {activeStage === 'selesai' && (
          <div className="fade-up text-center py-10 space-y-10">
            <Trophy size={150} className="mx-auto text-yellow-400 animate-pulse" />
            <h2 className="text-7xl md:text-9xl font-heading tracking-tighter uppercase leading-none">CONGRATS!</h2>
            <p className="text-2xl font-bold uppercase max-w-2xl mx-auto italic">Seluruh materi tuntas. Ini adalah akun premium anda:</p>
            <div className="max-w-xl mx-auto bg-black p-1 border-4 border-black shadow-[20px_20px_0_#22c55e]">
               <div className="bg-white p-10 flex flex-col items-center">
                  <div className="font-mono text-xl md:text-2xl bg-zinc-100 p-6 border-2 border-dashed border-zinc-300 break-all select-all font-black uppercase">{activeEp?.reward || "Hubungi Admin via WA"}</div>
                  <p className="mt-8 font-mono text-[10px] text-zinc-400 font-black tracking-widest uppercase">Copy akun di atas segera!</p>
               </div>
            </div>
            <button onClick={() => window.location.reload()} className="font-heading text-xl uppercase text-zinc-400 hover:text-black mt-10 transition-colors">Ulang dari awal</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// 7. STORE PAGE VIEW (STABLE & OPTIMIZED)
// ============================================================
const StorePage = ({ 
  globalStatus, catalog, informations, transactions, banners, activities, comments,
  searchQuery, setSearchQuery, handleVerifyEmail, isEmailVerified, commentEmail, setCommentEmail,
  handlePostComment, commentText, setCommentText, commentRating, setCommentRating, t, isVerifying, setReviewType, reviewType
}) => {
  const [storeTab, setStoreTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);

  const landscapeBanners = useMemo(() => (banners || []).filter(b => b.orientation === 'landscape'), [banners]);
  const portraitBanners = useMemo(() => (banners || []).filter(b => b.orientation === 'portrait'), [banners]);

  const journalEntries = useMemo(() => {
    const infos = (informations || []).map(i => ({ ...i, type: 'NEWS' }));
    const acts = (activities || []).map(a => ({ ...a, type: 'ACTIVITY', title: a.caption, content: a.desc }));
    return [...acts, ...infos].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [informations, activities]);

  const filteredCatalog = (catalog || []).filter(c => 
    (c.name || "").toLowerCase().includes(searchQuery?.toLowerCase() || "") || 
    (c.app || "").toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

  const approvedComments = useMemo(() => (comments || []).filter(c => c.status === 'approved'), [comments]);
  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        
        {/* --- STORE HEADER & NAV --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-4 mb-8 md:mb-12 gap-4">
          <h1 className="text-5xl md:text-8xl font-heading uppercase tracking-tighter leading-none">{t?.store || "STORE"}</h1>
          <nav className="flex gap-4 md:gap-8 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {['home', 'catalog', 'journal', 'status', 'reviews'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setStoreTab(tab)} 
                className={`tab-btn whitespace-nowrap cursor-hover ${storeTab === tab ? 'active' : ''}`}
              >
                {t?.[tab] || tab.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>

        {/* --- DYNAMIC SEARCH BAR --- */}
        <div className="relative mb-10 md:mb-16 group px-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" size={24} />
          <input 
            type="text" 
            placeholder={t?.search || "Search Product..."} 
            className="w-full border-b-2 border-zinc-200 py-6 pl-14 outline-none font-heading text-lg md:text-3xl uppercase focus:border-black transition-all bg-transparent placeholder:text-zinc-200" 
            value={searchQuery || ""} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        {/* ================= TAB CONTENT: HOME ================= */}
        {storeTab === 'home' && (
          <div className="fade-up space-y-16 px-2">
            {/* Promo Banner Landscape */}
            {landscapeBanners.length > 0 && (
              <div className="w-full">
                {landscapeBanners.slice(0, 1).map((lb, idx) => (
                  <div key={idx} className="relative w-full aspect-video md:aspect-[21/9] border-2 border-black overflow-hidden bg-zinc-100 shadow-[12px_12px_0_black] group">
                    {lb.type === 'video' ? (
                      <video src={lb.image} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={lb.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Hero Ad" />
                    )}
                    <div className="absolute top-6 left-6 bg-black text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] border border-white/20">PROMOTED</div>
                    <div className="absolute bottom-6 left-6"><h3 className="text-white text-3xl md:text-5xl font-heading bg-black px-4 py-2 tracking-tighter leading-none">{lb.title}</h3></div>
                  </div>
                ))}
              </div>
            )}

            {/* Clips Section (Portrait) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {portraitBanners.map((pb, i) => (
                <div key={pb.firebaseId || i} className="relative overflow-hidden group border-2 border-black bg-zinc-100 aspect-[9/16] shadow-[4px_4px_0_black] hover:shadow-[8px_8px_0_#ea281e] transition-all">
                  {pb.type === 'video' ? <video src={pb.image} autoPlay muted loop playsInline className="w-full h-full object-cover" /> : <img src={pb.image} className="w-full h-full object-cover" alt="Clip" />}
                  <div className="absolute top-4 left-4 bg-white px-2 py-1 text-[8px] md:text-[10px] font-bold uppercase border border-black text-black z-10">CLIP</div>
                </div>
              ))}
            </div>

            {/* Featured Picks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 pt-10 border-t border-zinc-100">
              {(catalog || []).filter(i => i.isBestSeller).map(item => (
                <div key={item.firebaseId} className="store-card group cursor-hover relative" onClick={() => setSelectedProduct(item)}>
                  <div className="aspect-square bg-zinc-100 border-b border-zinc-200 overflow-hidden relative">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={item.name}/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200"><ShoppingBag size={100} /></div>
                    )}
                    <div className="absolute top-4 right-4"><Star size={24} fill="#ea281e" className="text-[#ea281e]" /></div>
                  </div>
                  <div className="p-8">
                    <span className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2 block">{item.app}</span>
                    <h4 className="font-heading text-3xl md:text-4xl group-hover:text-[#ea281e] transition-colors tracking-tighter leading-none mb-6 uppercase">{item.name}</h4>
                    <div className="flex justify-between items-center font-bold text-2xl italic uppercase border-t border-zinc-100 pt-6">
                        <span>{item.price}</span>
                        <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"><ArrowRight /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT: CATALOG ================= */}
        {storeTab === 'catalog' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 fade-up px-2">
            {filteredCatalog.map(item => (
              <div key={item.firebaseId} className="group cursor-hover" onClick={() => setSelectedProduct(item)}>
                <div className="aspect-square bg-zinc-100 mb-6 relative border-2 border-black flex items-center justify-center overflow-hidden shadow-[6px_6px_0_black] group-hover:shadow-[10px_10px_0_#ea281e] transition-all">
                   {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="p"/> : <ShoppingBag size={80} className="text-zinc-200"/>}
                   <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-heading text-3xl uppercase tracking-tighter">{t?.detail || "Detail"}</div>
                   <div className="absolute bottom-4 left-4 bg-white px-2 py-1 text-[8px] font-black border border-black uppercase tracking-widest">{item.app}</div>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading uppercase tracking-tighter leading-none mb-1">{item.name}</h3>
                <p className="font-bold text-lg italic text-zinc-400">{item.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB CONTENT: JOURNAL ================= */}
        {storeTab === 'journal' && (
          <div className="space-y-16 md:space-y-28 fade-up px-2 pb-20">
              {journalEntries.length > 0 ? journalEntries.map((entry, idx) => (
                <div key={entry.firebaseId || idx} className="flex flex-col md:flex-row gap-10 md:gap-20 group cursor-hover" onClick={() => setSelectedJournal(entry)}>
                  <div className="md:w-[45%] aspect-[16/10] border-2 border-black overflow-hidden bg-zinc-100 shrink-0 shadow-[10px_10px_0_black] group-hover:shadow-[15px_15px_0_#ea281e] transition-all duration-500">
                    <img src={entry.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Journal"/>
                  </div>
                  <div className="md:w-[55%] flex flex-col justify-center py-4">
                    <div className="flex items-center gap-6 mb-6">
                      <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">{entry.type}</span>
                      <span className="font-mono text-xs text-zinc-400 font-bold uppercase">{entry.date}</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-heading mb-8 group-hover:text-[#ea281e] transition-colors uppercase leading-none tracking-tighter">{entry.title}</h2>
                    <p className="text-lg md:text-xl text-zinc-500 line-clamp-3 leading-relaxed font-serif italic mb-10">"{entry.content}"</p>
                    <div className="flex items-center gap-3 font-heading text-xl uppercase tracking-tighter group-hover:gap-6 transition-all"><span>Read Story</span><ArrowRight size={20} className="text-[#ea281e]" /></div>
                  </div>
                </div>
              )) : (
                <div className="py-40 text-center uppercase font-heading text-4xl text-zinc-300">No Journal Archive.</div>
              )}
          </div>
        )}

        {/* ================= TAB CONTENT: STATUS ================= */}
        {storeTab === 'status' && (
           <div className="fade-up border-4 border-black mx-2 shadow-[15px_15px_0_black]">
              <div className="bg-black text-white p-8 md:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h2 className="font-heading text-4xl md:text-6xl tracking-tighter uppercase mb-2 text-[#ea281e]">Live System</h2>
                  <p className="font-mono text-[9px] uppercase text-zinc-500 tracking-[0.3em]">Real-time link to TOKKO Server 19D24</p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 px-6 py-3 border border-white/10 font-mono text-xs md:text-sm uppercase tracking-[0.2em] font-black">
                   <div className={`w-4 h-4 rounded-full ${globalStatus === 'Aktif' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                   {String(globalStatus || "OFFLINE")}
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left font-mono text-[10px] md:text-sm border-collapse min-w-[700px]">
                   <thead>
                     <tr className="bg-zinc-50 border-y-2 border-black font-black uppercase tracking-tighter text-black">
                        <th className="p-6 md:p-8">Service Name</th>
                        <th className="p-6 md:p-8">Platform</th>
                        <th className="p-6 md:p-8">Remaining</th>
                        <th className="p-6 md:p-8 text-right">System</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y-2 divide-zinc-100 uppercase font-bold text-zinc-800">
                      {(transactions || []).length > 0 ? transactions.map((t, idx) => (
                        <tr key={t.firebaseId || idx} className="hover:bg-zinc-50 transition-colors group italic">
                          <td className="p-6 md:p-10 text-xl md:text-2xl font-heading tracking-tighter">{t.name}</td>
                          <td className="p-6 md:p-10 text-zinc-400">{t.app}</td>
                          <td className="p-6 md:p-10 font-heading text-2xl md:text-3xl"><TimeDisplay targetDate={t.targetDate} status={t.status}/></td>
                          <td className="p-6 md:p-10 text-right">
                             <span className={`px-4 py-1.5 text-[9px] text-white tracking-widest font-black rounded-full ${t.status === 'Aktif' ? 'bg-black' : 'bg-red-600'}`}>
                               {String(t.status || "IDLE").toUpperCase()}
                             </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="p-32 text-center text-zinc-200 font-heading text-4xl uppercase tracking-widest">No Active Sessions</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* ================= TAB CONTENT: REVIEWS ================= */}
        {storeTab === 'reviews' && (
           <div className="fade-up max-w-3xl mx-auto py-20 px-4">
              <h2 className="text-7xl md:text-9xl font-heading text-center mb-20 uppercase tracking-tighter leading-none italic">Feedback.</h2>
              {!reviewType ? (
                 <div className="border-4 border-black p-10 md:p-16 text-center bg-white shadow-[20px_20px_0_#ea281e] relative">
                    <h3 className="font-heading text-3xl md:text-5xl mb-10 uppercase tracking-tighter">{t?.reviews || "REVIEWS"}</h3>
                    <input type="email" placeholder="EMAIL ADDRESS" className="w-full border-b-4 border-black py-5 text-center font-mono text-lg outline-none mb-12 uppercase focus:border-[#ea281e]" value={commentEmail || ""} onChange={e => setCommentEmail(e.target.value)} />
                    <div className="flex flex-col gap-6">
                        <button onClick={handleVerifyEmail} className="w-full bg-black text-white py-6 font-heading text-2xl uppercase tracking-widest hover:bg-[#ea281e] flex justify-center items-center gap-4 transition-all">
                           {isVerifying ? <Loader2 className="animate-spin" /> : (t?.verifyBtn || "CHECK")}
                        </button>
                        <button onClick={() => setReviewType('guest')} className="text-xs font-black uppercase underline hover:text-[#ea281e] tracking-[0.2em]">{t?.guestBtn || "WRITE AS GUEST"}</button>
                    </div>
                 </div>
              ) : (
                <div className="border-4 border-black p-8 md:p-12 space-y-10 bg-white shadow-[20px_20px_0_black]">
                   <div className="flex justify-between items-center border-b-2 border-zinc-100 pb-8">
                      <div className="flex flex-col">
                        <span className="font-heading text-4xl tracking-tighter uppercase leading-none mb-2">Post Review</span>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white inline-block ${reviewType === 'customer' ? 'bg-green-600' : 'bg-orange-500'}`}>{reviewType === 'customer' ? (t?.customer || "CUSTOMER") : (t?.nonCustomer || "GUEST")}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={28} onClick={() => setCommentRating(s)} fill={s <= (commentRating || 5) ? "black" : "none"} className="cursor-pointer hover:scale-110 transition-transform" />)}
                      </div>
                   </div>
                   <textarea placeholder={t?.postReview || "Write experience..."} className="w-full h-56 border-4 border-zinc-50 p-8 font-mono text-lg outline-none focus:border-black uppercase bg-zinc-50" value={commentText || ""} onChange={e => setCommentText(e.target.value)} />
                   <button onClick={handlePostComment} className="w-full bg-black text-white py-6 font-heading text-3xl uppercase tracking-tighter hover:bg-[#ea281e] transition-all shadow-[8px_8px_0_rgba(0,0,0,0.1)]">Kirim Ulasan</button>
                </div>
              )}

              <div className="mt-32 space-y-16">
                 {approvedComments.length > 0 ? approvedComments.map((c, idx) => (
                   <div key={c.firebaseId || idx} className="border-l-4 border-black pl-10 relative pb-10 group">
                      <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black uppercase text-white ${c.role === 'customer' ? 'bg-black' : 'bg-orange-500'}`}>{c.role === 'customer' ? (t?.customer || "PELANGGAN") : (t?.nonCustomer || "TAMU")}</div>
                      <div className="flex flex-col mb-8">
                        <span className="font-heading text-3xl md:text-5xl uppercase tracking-tighter leading-none mb-4 group-hover:text-[#ea281e] transition-colors">{typeof c.email === 'string' ? c.email.split('@')[0] : "User"}</span>
                        <div className="flex gap-1">{[...Array(Number(c.rating || 5))].map((_,i) => <Star key={i} size={14} fill="black" />)}</div>
                      </div>
                      <p className="text-2xl md:text-3xl italic text-zinc-600 font-serif leading-tight pr-6">"{c.text || ""}"</p>
                      <span className="block mt-10 font-mono text-[10px] text-zinc-400 uppercase font-black tracking-widest">{c.date || "Unknown"}</span>
                   </div>
                 )) : (
                    <div className="text-center py-40 bg-zinc-50 border-4 border-dashed border-zinc-100 font-heading text-4xl text-zinc-200 uppercase tracking-widest italic">No Reviews.</div>
                 )}
              </div>
           </div>
        )}
      </div>

      {/* --- STORE PAGE MODALS --- */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={t?.spec || "SPECIFICATION"}>
          {selectedProduct && (
            <div className="space-y-10 fade-up">
                <div className="relative">
                  {selectedProduct.image ? <img src={selectedProduct.image} className="w-full h-80 object-cover border-4 border-black shadow-[15px_15px_0_black]" alt="d"/> : <div className="w-full h-80 bg-zinc-100 border-4 border-black flex items-center justify-center text-zinc-200"><ShoppingBag size={100} /></div>}
                  <div className="absolute -bottom-4 -right-4 bg-[#ea281e] text-white p-4 font-heading text-2xl rotate-3">{selectedProduct.price}</div>
                </div>
                <div className="flex flex-col pt-4">
                  <span className="text-[#ea281e] font-mono text-xs font-black uppercase tracking-[0.4em] mb-2">{selectedProduct.app}</span>
                  <h2 className="text-5xl md:text-7xl font-heading tracking-tighter leading-none uppercase italic">{selectedProduct.name}</h2>
                </div>
                <div className="bg-zinc-50 p-8 border-l-8 border-black font-mono text-lg uppercase leading-relaxed text-zinc-600 italic">"{selectedProduct.desc || "No Description."}"</div>
                <a href={`https://wa.me/6281319865384?text=Halo TOKKO, saya berminat order ${selectedProduct.name}`} target="_blank" rel="noreferrer" className="w-full bg-black text-white py-8 text-center font-heading text-3xl flex items-center justify-center gap-6 hover:bg-[#ea281e] transition-all transform active:scale-95 shadow-[10px_10px_0_rgba(0,0,0,0.1)] uppercase">Order Via WhatsApp <Phone /></a>
            </div>
          )}
      </Modal>

      <Modal isOpen={!!selectedJournal} onClose={() => setSelectedJournal(null)} title="TOKKO JOURNAL">
          {selectedJournal && (
            <div className="space-y-10 fade-up pb-10">
                <img src={selectedJournal.image} className="w-full aspect-video object-cover border-4 border-black shadow-[15px_15px_0_#ea281e]" alt="story"/>
                <div className="flex items-center gap-4"><span className="bg-black text-white px-5 py-2 text-xs font-black uppercase tracking-[0.3em]">{selectedJournal.type}</span><span className="font-mono text-xs text-zinc-400 font-bold uppercase">{selectedJournal.date}</span></div>
                <h2 className="text-5xl md:text-8xl font-heading tracking-tighter leading-[0.9] uppercase text-black">{selectedJournal.title}</h2>
                <div className="text-xl md:text-2xl text-zinc-700 leading-relaxed font-serif whitespace-pre-wrap first-letter:text-7xl first-letter:font-heading first-letter:mr-3 first-letter:float-left first-letter:text-black italic uppercase">"{selectedJournal.content || selectedJournal.desc || ""}"</div>
                <button onClick={() => setSelectedJournal(null)} className="w-full border-4 border-black py-4 font-heading text-xl uppercase tracking-widest hover:bg-black hover:text-white transition-all">Close Story</button>
            </div>
          )}
      </Modal>
    </div>
  );
};

// ============================================================
// 8. ADMIN LOGIN VIEW (GATEKEEPER)
// ============================================================
const AdminLoginView = ({ loginForm, setLoginForm, handleAdminLogin, setView, t }) => (
    <div className="min-h-screen admin-login-bg text-white flex flex-col p-6 md:p-20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#ea281e]/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                  <h1 className="text-[15vw] lg:text-[10vw] font-heading leading-[0.8] font-black mb-8 tracking-tighter uppercase italic">Chief<br/><span className="text-[#ea281e] ml-[2vw]">Panel.</span></h1>
                  <p className="max-w-md font-mono text-xs uppercase leading-relaxed text-zinc-500 tracking-widest font-bold">Authentication required to access TOKKO Internal Node 19D24. Every action is logged under centralized security protocol.</p>
                </div>
                <div className="max-w-md w-full fade-up">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-16 shadow-[25px_25px_60px_rgba(0,0,0,0.5)]">
                      <form onSubmit={handleAdminLogin} className="space-y-12">
                          <div className="group relative">
                              <label className="block text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4 uppercase font-black">Identification</label>
                              <input type="text" autoComplete="username" className="w-full bg-transparent border-b-2 border-zinc-800 py-4 font-heading text-3xl md:text-4xl outline-none focus:border-white transition-all uppercase tracking-widest" value={loginForm?.user || ""} onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
                          </div>
                          <div className="group relative">
                              <label className="block text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4 uppercase font-black">Access Token</label>
                              <input type="password" autoComplete="current-password" className="w-full bg-transparent border-b-2 border-zinc-800 py-4 font-heading text-3xl md:text-4xl outline-none focus:border-white transition-all uppercase tracking-widest" value={loginForm?.pass || ""} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
                          </div>
                          <div className="pt-6">
                              <button type="submit" className="w-full bg-[#ea281e] text-white py-6 font-heading text-2xl uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all font-black shadow-[0_15px_30px_rgba(234,40,30,0.3)] active:translate-y-1 active:shadow-none">Authorize Access</button>
                              <button type="button" onClick={() => setView('landing')} className="w-full text-zinc-600 mt-8 font-mono text-[9px] uppercase tracking-widest hover:text-white transition-colors underline font-black">Abort & Exit Gate</button>
                          </div>
                      </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
// ============================================================
// 9. ADMIN DASHBOARD VIEW (COMMAND CENTER)
// ============================================================
/**
 * Komponen ini menangani seluruh manajemen konten aplikasi.
 * Terbagi menjadi beberapa tab fungsional untuk efisiensi navigasi admin.
 */
const AdminDashboard = ({ 
    activeTab, setActiveTab, globalStatus, setGlobalStatus, catalog, informations, banners, transactions, activities, comments, episodes,
    handleSaveCatalog, handleSaveInfo, handleSaveBanner, handleSaveTransaction, handleSaveEpisode, handleDelete, 
    isUploading, handleImageFile, handleLogout, handleApproveReview, t 
}) => {
    // State lokal untuk manajemen Modal dan Form
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Konfigurasi Navigasi Sidebar
    const navTabs = [
      { id: 'SYSTEM', icon: <Activity size={20}/>, label: 'Core System' },
      { id: 'CATALOG', icon: <ShoppingBag size={20}/>, label: 'Inventory' },
      { id: 'BANNERS', icon: <ImageIcon size={20}/>, label: 'Billboard' },
      { id: 'ACADEMY', icon: <BookOpen size={20}/>, label: 'LMS Academy' },
      { id: 'TRANSACTIONS', icon: <FileText size={20}/>, label: 'Logbook' },
      { id: 'REVIEWS', icon: <MessageSquare size={20}/>, label: 'Moderation' }
    ];

    // Master Form States (Initial Values)
    const [catForm, setCatForm] = useState({ name: '', app: '', price: '', desc: '', isBestSeller: false, imageUrl: '' });
    const [banForm, setBanForm] = useState({ title: '', desc: '', imageUrl: '', type: 'image', orientation: 'landscape' });
    const [trxForm, setTrxForm] = useState({ name: '', app: '', durationDays: '', email: '' });
    const [epForm, setEpForm] = useState({ 
        title: '', driveLink: '', reward: '', 
        questions: [{ text: '', options: ['', '', '', ''], correct: 0 }] 
    });

    // Handler untuk membuka Modal Edit dengan data yang sudah ada
    const openEditSession = (type, data) => {
        setEditingId(data.firebaseId);
        if(type === 'catalog') setCatForm({...data, imageUrl: data.image});
        if(type === 'banner') setBanForm({...data, imageUrl: data.image});
        if(type === 'trx') setTrxForm(data);
        if(type === 'academy') setEpForm(data);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row pt-16 md:pt-24 select-none">
            
            {/* --- MOBILE SUB-NAV --- */}
            <nav className="flex md:hidden overflow-x-auto border-b-4 border-black whitespace-nowrap bg-white sticky top-[60px] z-[300] p-4 no-scrollbar">
                {navTabs.map((tab) => (
                    <button 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id)} 
                      className={`px-6 py-2 font-heading text-xs font-black tracking-[0.2em] uppercase flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-[4px_4px_0_#ea281e]' : 'text-zinc-400'}`}
                    >
                      {tab.icon} {tab.id}
                    </button>
                ))}
            </nav>

            {/* --- DESKTOP MASTER SIDEBAR --- */}
            <aside className="w-80 border-r-4 border-black p-10 hidden md:block sticky top-24 h-[calc(100vh-6rem)] shrink-0 bg-zinc-50/50">
                <div className="flex items-center gap-4 mb-16">
                  <div className="w-3 h-3 bg-[#ea281e] rounded-full animate-pulse shadow-[0_0_10px_#ea281e]"></div>
                  <h2 className="font-heading text-3xl uppercase tracking-tighter italic text-black">Chief Node.</h2>
                </div>
                
                <nav className="space-y-4">
                    {navTabs.map(tab => (
                        <button 
                          key={tab.id} 
                          onClick={() => setActiveTab(tab.id)} 
                          className={`w-full text-left font-heading text-xl p-5 border-2 border-black transition-all flex items-center justify-between group relative overflow-hidden ${activeTab === tab.id ? 'bg-black text-white shadow-[8px_8px_0_#ea281e]' : 'text-zinc-400 hover:bg-white hover:text-black hover:translate-x-2'}`}
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            {tab.icon}
                            <span className="tracking-tight">{tab.id}</span>
                          </div>
                          <ChevronRight size={18} className={`relative z-10 transition-transform ${activeTab === tab.id ? 'translate-x-2' : 'opacity-0'}`} />
                        </button>
                    ))}
                </nav>

                <div className="mt-32 pt-10 border-t-2 border-black/5">
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-500 py-4 font-black text-[9px] uppercase tracking-[0.4em] hover:bg-[#ea281e] hover:text-white transition-all shadow-[4px_4px_0_rgba(0,0,0,0.05)] active:translate-y-1"
                  >
                    <LogOut size={14}/> Terminate Node
                  </button>
                </div>
            </aside>

            {/* --- MAIN ADMIN CONTENT AREA --- */}
            <main className="flex-1 p-6 md:p-20 overflow-y-auto no-scrollbar bg-[#ffffff]">
                
                {/* 1. SECTION: SYSTEM CONTROL */}
                {activeTab === 'SYSTEM' && (
                    <div className="fade-up space-y-12">
                        <div className="border-b-4 border-black pb-8">
                          <h2 className="text-6xl md:text-9xl font-heading tracking-tighter leading-none mb-4 uppercase italic">Security Center.</h2>
                          <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black italic">Configure Real-time broadcast status for Node 19D24.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Aktif', 'Perbaikan', 'Mati'].map(opt => (
                                <button 
                                  key={opt} 
                                  onClick={() => setGlobalStatus(opt)} 
                                  className={`p-16 border-4 font-heading text-4xl transition-all relative group shadow-[12px_12px_0_rgba(0,0,0,0.05)] ${globalStatus === opt ? 'bg-black text-white border-black scale-[1.02] shadow-[15px_15px_0_#ea281e]' : 'text-zinc-200 border-zinc-100 hover:border-black hover:text-black'}`}
                                >
                                    <span className="relative z-10">{opt.toUpperCase()}</span>
                                    {globalStatus === opt && <div className="absolute top-4 right-4 w-4 h-4 bg-[#ea281e] rounded-full animate-ping"></div>}
                                </button>
                            ))}
                        </div>
                        <div className="p-10 bg-zinc-50 border-4 border-black/5 flex items-start gap-6 shadow-[inner_5px_5px_10px_rgba(0,0,0,0.02)]">
                           <AlertTriangle size={40} className="text-[#ea281e] shrink-0" />
                           <div className="font-mono text-[10px] uppercase leading-relaxed text-zinc-500 font-bold">
                             <p className="text-black mb-3 text-sm font-black tracking-widest uppercase">Protocol Reminder:</p>
                             Status "Perbaikan" akan memblokir akses transaksi namun tetap mengizinkan pengguna melihat katalog. Status "Mati" akan menghentikan seluruh layanan frontend Node 19D24 secara total.
                           </div>
                        </div>
                    </div>
                )}

                {/* 2. SECTION: CATALOG INVENTORY */}
                {activeTab === 'CATALOG' && (
                    <div className="fade-up space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 gap-8">
                            <div>
                              <h2 className="text-6xl md:text-8xl font-heading tracking-tighter leading-none uppercase mb-2">Inventory.</h2>
                              <p className="font-mono text-[10px] text-zinc-400 uppercase font-black tracking-[0.3em]">Direct database injection for digital goods.</p>
                            </div>
                            <button 
                              onClick={() => { setEditingId(null); setCatForm({ name: '', app: '', price: '', desc: '', isBestSeller: false, imageUrl: '' }); setIsModalOpen(true); }} 
                              className="bg-black text-white px-12 py-6 font-heading text-2xl uppercase tracking-tighter shadow-[10px_10px_0_#ea281e] hover:bg-[#ea281e] transition-all transform active:translate-y-1 active:shadow-none"
                            >
                              + New Product
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {(catalog || []).map((item, idx) => (
                                <div key={item.firebaseId || idx} className="border-4 border-black p-6 flex flex-col md:flex-row justify-between items-center group bg-white shadow-[10px_10px_0_black] hover:translate-x-2 transition-all">
                                    <div className="flex items-center gap-10 w-full">
                                        <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-100 border-2 border-black overflow-hidden shrink-0 shadow-[6px_6px_0_rgba(0,0,0,0.05)] relative group-hover:shadow-[6px_6px_0_#ea281e] transition-all">
                                          {item.image && <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="product"/>}
                                          {item.isBestSeller && <div className="absolute top-2 left-2 bg-[#ea281e] p-1"><Star size={12} fill="white" className="text-white" /></div>}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-4 mb-3">
                                            <span className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.3em] border border-white/20">{item.app}</span>
                                            <span className="font-mono text-[9px] text-zinc-300 font-bold uppercase">{item.firebaseId}</span>
                                          </div>
                                          <h3 className="font-heading text-3xl md:text-5xl uppercase tracking-tighter leading-none mb-4 group-hover:text-[#ea281e] transition-colors">{item.name}</h3>
                                          <div className="flex items-center gap-6">
                                            <p className="font-heading text-2xl text-black italic tracking-tighter">{item.price}</p>
                                            <div className="h-1 w-8 bg-zinc-100"></div>
                                            <p className="font-mono text-[10px] text-zinc-400 uppercase font-black">Stock Status: Unlimited</p>
                                          </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto mt-8 md:mt-0">
                                        <button onClick={() => openEditSession('catalog', item)} className="flex-1 md:flex-none p-5 border-4 border-black hover:bg-black hover:text-white transition-all"><Pencil size={24}/></button>
                                        <button onClick={() => handleDelete('catalog', item.firebaseId)} className="flex-1 md:flex-none p-5 border-4 border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-all"><Trash2 size={24}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. SECTION: BILLBOARD BANNERS */}
                {activeTab === 'BANNERS' && (
                    <div className="fade-up space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 gap-8">
                            <div>
                              <h2 className="text-6xl md:text-8xl font-heading tracking-tighter leading-none uppercase mb-2">Billboard.</h2>
                              <p className="font-mono text-[10px] text-zinc-400 uppercase font-black tracking-[0.3em]">Visual asset deployment system for front-end.</p>
                            </div>
                            <button 
                              onClick={() => { setEditingId(null); setBanForm({ title: '', imageUrl: '', type: 'image', orientation: 'landscape' }); setIsModalOpen(true); }} 
                              className="bg-black text-white px-12 py-6 font-heading text-2xl uppercase tracking-tighter shadow-[10px_10px_0_#ea281e] hover:bg-[#ea281e] transition-all"
                            >
                              Deploy Campaign
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
                            {(banners || []).map((b, bidx) => (
                                <div key={b.firebaseId || bidx} className="border-4 border-black p-8 bg-white shadow-[15px_15px_0_black] group hover:shadow-[15px_15px_0_#ea281e] transition-all">
                                    <div className="aspect-video bg-zinc-900 mb-8 overflow-hidden relative border-4 border-black group-hover:scale-[0.98] transition-transform duration-500">
                                        {b.type === 'video' ? (
                                          <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white font-heading text-2xl tracking-[0.4em]">
                                            <Play size={60} className="mb-4 text-[#ea281e] animate-pulse" />
                                            STREAM_SOURCE
                                          </div>
                                        ) : (
                                          <img src={b.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Billboard Preview"/>
                                        )}
                                        <div className="absolute top-4 left-4 bg-black text-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 shadow-xl">
                                          {b.orientation} / {b.type}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center gap-10">
                                        <h3 className="font-heading text-4xl truncate uppercase tracking-tighter italic leading-none text-black flex-1">{b.title}</h3>
                                        <div className="flex gap-4 shrink-0">
                                            <button onClick={() => openEditSession('banner', b)} className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all"><Pencil size={20}/></button>
                                            <button onClick={() => handleDelete('banners', b.firebaseId)} className="p-4 border-2 border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-all"><Trash2 size={20}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. SECTION: ACADEMY LMS CONTROL (THE HEAVY SECTION) */}
                {activeTab === 'ACADEMY' && (
                    <div className="fade-up space-y-12 pb-40">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 gap-8">
                            <div>
                              <h2 className="text-6xl md:text-8xl font-heading tracking-tighter leading-none uppercase mb-2 text-[#ea281e]">Academy.</h2>
                              <p className="font-mono text-[10px] text-zinc-400 uppercase font-black tracking-[0.3em]">Configure curriculum, quiz logic and premium rewards.</p>
                            </div>
                            <button 
                              onClick={() => { setEditingId(null); setEpForm({ title: '', driveLink: '', reward: '', questions: [{ text: '', options: ['', '', '', ''], correct: 0 }] }); setIsModalOpen(true); }} 
                              className="bg-black text-white px-12 py-6 font-heading text-2xl uppercase tracking-tighter shadow-[10px_10px_0_#ea281e] hover:bg-[#ea281e] transition-all flex items-center gap-6"
                            >
                              <BookOpen size={30}/> Generate Episode
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-10">
                            {(episodes || []).map((ep, idx) => (
                                <div key={ep.firebaseId || idx} className="border-4 border-black p-10 bg-white shadow-[15px_15px_0_black] flex flex-col md:flex-row justify-between gap-12 group hover:translate-x-3 transition-all relative">
                                    <div className="absolute top-4 right-20 flex gap-2">
                                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                       <div className="w-2 h-2 rounded-full bg-zinc-100"></div>
                                       <div className="w-2 h-2 rounded-full bg-zinc-100"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-6 mb-6">
                                            <span className="bg-black text-white px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.3em]">EPISODE_0{idx + 1}</span>
                                            <span className="text-[#ea281e] font-heading text-3xl italic tracking-tighter">{ep.questions?.length || 0} QC CHECKPOINTS</span>
                                        </div>
                                        <h3 className="font-heading text-5xl md:text-7xl tracking-tighter uppercase leading-[0.8] mb-10 group-hover:text-[#ea281e] transition-colors">{ep.title}</h3>
                                        <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase font-black text-zinc-400">
                                            <div className="flex items-center gap-3 bg-zinc-50 px-5 py-2 border-2 border-black/5 rounded-full"><Globe size={14}/> {ep.driveLink?.substring(0, 40)}...</div>
                                            <div className="flex items-center gap-3 bg-green-50 px-5 py-2 border-2 border-green-100 text-green-600 rounded-full shadow-sm"><Key size={14}/> Reward Attached</div>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col justify-end gap-4 min-w-[120px]">
                                        <button onClick={() => openEditSession('academy', ep)} className="flex-1 md:flex-none p-8 border-4 border-black hover:bg-black hover:text-white transition-all flex items-center justify-center text-4xl"><Pencil size={32}/></button>
                                        <button onClick={() => handleDelete('episodes', ep.firebaseId)} className="flex-1 md:flex-none p-8 border-4 border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-all flex items-center justify-center text-4xl"><Trash2 size={32}/></button>
                                    </div>
                                </div>
                            ))}
                            {episodes.length === 0 && (
                                <div className="py-48 text-center border-4 border-dashed border-zinc-200 bg-zinc-50/30">
                                    <BookOpen size={120} className="mx-auto text-zinc-100 mb-8" />
                                    <h4 className="font-heading text-5xl text-zinc-200 uppercase tracking-widest italic leading-none">Classroom Database is Empty.</h4>
                                    <p className="font-mono text-[10px] text-zinc-300 uppercase font-black mt-4 tracking-[0.4em]">Awaiting Chief Node Injection...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* 5. SECTION: TRANSACTIONS LOGBOOK (SUBSCRIPTION MGMT) */}
                {activeTab === 'TRANSACTIONS' && (
                    <div className="fade-up space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-8 gap-8">
                            <div>
                              <h2 className="text-6xl md:text-8xl font-heading tracking-tighter leading-none uppercase mb-2">Logbook.</h2>
                              <p className="font-mono text-[10px] text-zinc-400 uppercase font-black tracking-[0.3em]">Subscription monitoring and session activation terminal.</p>
                            </div>
                            <button 
                              onClick={() => { setEditingId(null); setTrxForm({ name: '', app: '', durationDays: '', email: '' }); setIsModalOpen(true); }} 
                              className="bg-black text-white px-12 py-6 font-heading text-2xl uppercase tracking-tighter shadow-[10px_10px_0_#ea281e] hover:bg-[#ea281e] transition-all flex items-center gap-6"
                            >
                              <FileText size={30}/> New Session
                            </button>
                        </div>

                        <div className="overflow-x-auto border-4 border-black shadow-[20px_20px_0_rgba(0,0,0,0.05)] bg-white relative">
                            <table className="w-full text-left font-mono text-[10px] md:text-xs uppercase font-black min-w-[900px]">
                                <thead className="bg-black text-white">
                                    <tr className="divide-x-2 divide-white/10 italic">
                                        <th className="p-8 tracking-tighter">Subscriber Metadata</th>
                                        <th className="p-8">Service Node</th>
                                        <th className="p-8">Live Expiration</th>
                                        <th className="p-8">Node Status</th>
                                        <th className="p-8 text-right">System Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-4 divide-zinc-50">
                                    {(transactions || []).map((t, idx) => (
                                        <tr key={t.firebaseId || idx} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="p-8">
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-lg font-black tracking-tighter text-black group-hover:text-[#ea281e] transition-colors">{t.name}</span>
                                                  <span className="text-[8px] text-zinc-400 font-bold lowercase tracking-[0.2em]">{t.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                              <span className="bg-zinc-900 text-white px-3 py-1 text-[9px] tracking-[0.2em] border border-white/10">{t.app}</span>
                                            </td>
                                            <td className="p-8 font-heading text-3xl italic tracking-tighter text-black/80">
                                              <TimeDisplay targetDate={t.targetDate} status={t.status}/>
                                            </td>
                                            <td className="p-8">
                                              <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${t.status === 'Aktif' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-[#ea281e] animate-pulse'}`}></div>
                                                <span className={`px-4 py-1.5 text-[9px] text-white tracking-widest font-black rounded-sm ${t.status === 'Aktif' ? 'bg-black' : 'bg-[#ea281e]'}`}>
                                                  {String(t.status || "IDLE").toUpperCase()}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button onClick={() => openEditSession('trx', t)} className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none"><Pencil size={18}/></button>
                                                    <button onClick={() => handleDelete('transactions', t.firebaseId)} className="p-4 border-2 border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-all shadow-[4px_4px_0_#ea281e] active:translate-y-1 active:shadow-none"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {transactions.length === 0 && (
                              <div className="py-48 text-center bg-zinc-50/20">
                                <div className="relative inline-block mb-8">
                                   <RefreshCw className="text-zinc-100 animate-spin-slow" size={100} />
                                   <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-200" size={30} />
                                </div>
                                <p className="font-heading text-5xl text-zinc-200 uppercase tracking-widest leading-none">Registry Empty.</p>
                                <p className="font-mono text-[9px] text-zinc-300 uppercase font-black mt-6 tracking-[0.5em]">System Is Ready For New Session Inbound</p>
                              </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 6. SECTION: REVIEWS MODERATION (SOCIAL PROOF CONTROL) */}
                {activeTab === 'REVIEWS' && (
                  <div className="fade-up space-y-12 pb-32">
                    <div className="border-b-4 border-black pb-8">
                      <h2 className="text-6xl md:text-8xl font-heading tracking-tighter leading-none mb-4 uppercase italic">Moderation.</h2>
                      <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-black">Centralized filter for customer feedback and ratings.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-10">
                      {(comments || []).filter(c => c.status === 'pending').map((c, idx) => (
                        <div key={c.firebaseId || idx} className="border-4 border-orange-500 bg-orange-50 p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 shadow-[15px_15px_0_#f97316] relative overflow-hidden group hover:translate-y-[-5px] transition-all">
                          <AlertCircle className="absolute -bottom-10 -left-10 text-orange-200 opacity-20 rotate-12" size={200} />
                          <div className="flex-1 uppercase font-black relative z-10">
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-[9px] tracking-[0.3em]">
                              <span className="bg-orange-500 text-white px-4 py-1.5 border border-white/20 shadow-md">PENDING_{c.role}</span>
                              <div className="flex items-center gap-2 text-orange-900/40"><MapPin size={10}/> REMOTE_IP_LOGGED</div>
                              <span className="text-zinc-400 font-mono italic">{c.date}</span>
                            </div>
                            <h4 className="text-zinc-400 text-xs mb-2 tracking-widest">{c.email} SAYS:</h4>
                            <p className="text-3xl md:text-5xl font-heading leading-[0.9] tracking-tighter text-black uppercase pr-10 mb-8 italic">"{c.text}"</p>
                            <div className="flex items-center gap-3 bg-white/50 w-fit p-3 border-2 border-orange-200">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star 
                                  key={starIdx} 
                                  size={18} 
                                  fill={starIdx < Number(c.rating || 5) ? "#f97316" : "none"} 
                                  className={starIdx < Number(c.rating || 5) ? "text-[#f97316]" : "text-zinc-200"} 
                                />
                              ))}
                              <span className="ml-4 font-mono text-xs text-orange-500">{c.rating}/5 SCORE</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto relative z-10">
                            <button 
                              onClick={() => handleApproveReview(c.firebaseId)} 
                              className="flex-1 lg:flex-none bg-black text-white px-12 py-6 font-heading text-2xl uppercase tracking-tighter border-4 border-black shadow-[10px_10px_0_#22c55e] hover:bg-green-600 transition-all active:translate-y-2 active:shadow-none"
                            >
                              APPROVE_NODE
                            </button>
                            <button 
                              onClick={() => handleDelete('comments', c.firebaseId)} 
                              className="flex-1 lg:flex-none bg-white text-black px-12 py-6 font-heading text-2xl uppercase tracking-tighter border-4 border-black shadow-[10px_10px_0_#ea281e] hover:bg-red-600 hover:text-white transition-all active:translate-y-2 active:shadow-none"
                            >
                              PURGE_DATA
                            </button>
                          </div>
                        </div>
                      ))}
                      {(comments || []).filter(c => c.status === 'pending').length === 0 && (
                        <div className="py-56 text-center border-4 border-dashed border-zinc-100 flex flex-col items-center bg-zinc-50/30">
                          <CheckCircle2 size={120} className="text-zinc-100 mb-8" />
                          <h4 className="font-heading text-5xl text-zinc-200 uppercase tracking-tighter leading-none italic">Clear Moderation Queue.</h4>
                          <p className="font-mono text-[9px] text-zinc-300 uppercase font-black mt-6 tracking-[0.5em]">Node Is Clean • Global Reputation Nominal</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </main>

            {/* ============================================================
                ADMIN SHARED MODAL SYSTEM (REPAIRED & VERBOSE)
                ============================================================ */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`NODE MGMT: ${activeTab}`}>
                
                {/* --- 1. MODAL: CATALOG INJECTOR --- */}
                {activeTab === 'CATALOG' && (
                    <div className="space-y-10 fade-up py-6">
                        <div className="group relative">
                          <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4">Product Identifier</label>
                          <input 
                            placeholder="PRODUCT_NAME_ID" 
                            className="w-full border-b-4 border-black py-6 outline-none font-heading text-4xl md:text-6xl uppercase tracking-tighter placeholder:text-zinc-100 focus:border-[#ea281e] transition-all bg-transparent" 
                            value={catForm.name || ""} 
                            onChange={e => setCatForm({...catForm, name: e.target.value})}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Service Platform</label>
                              <input 
                                placeholder="E.G. NETFLIX_4K" 
                                className="w-full border-b-2 border-zinc-200 py-4 outline-none uppercase font-black text-sm focus:border-black transition-colors" 
                                value={catForm.app || ""} 
                                onChange={e => setCatForm({...catForm, app: e.target.value})}
                              />
                            </div>
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Market Value</label>
                              <input 
                                placeholder="E.G. 50.000 IDR" 
                                className="w-full border-b-2 border-zinc-200 py-4 outline-none uppercase font-black text-sm focus:border-black transition-colors" 
                                value={catForm.price || ""} 
                                onChange={e => setCatForm({...catForm, price: e.target.value})}
                              />
                            </div>
                        </div>

                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">Visual Metadata (Image)</label>
                          <div className="border-4 border-dashed border-zinc-200 p-16 text-center relative hover:border-[#ea281e] hover:bg-zinc-50 transition-all group cursor-hover overflow-hidden">
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => handleImageFile(e, setCatForm, catForm)}/>
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-6 animate-pulse">
                                  <Loader2 className="animate-spin text-[#ea281e]" size={50} />
                                  <span className="font-heading text-2xl uppercase tracking-[0.3em]">Syncing Binary Assets...</span>
                                </div>
                              ) : catForm.imageUrl ? (
                                <div className="relative group/img">
                                  <img src={catForm.imageUrl} className="h-64 mx-auto border-4 border-black shadow-[15px_15px_0_black] object-cover" alt="Preview"/>
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center transition-all">
                                    <RefreshCw className="text-white mb-2" size={32}/>
                                    <span className="text-white font-black text-[9px] tracking-widest uppercase">Replace Asset</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-6 text-zinc-200 group-hover:text-[#ea281e] transition-all">
                                  <Upload size={80} strokeWidth={1} />
                                  <div className="flex flex-col">
                                    <span className="font-heading text-3xl uppercase tracking-tighter">Injection Point</span>
                                    <span className="font-mono text-[9px] uppercase font-black tracking-widest">Supports PNG/JPG • Auto-Base64 Conversion</span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">Functional Blueprint (Description)</label>
                          <textarea 
                            placeholder="INPUT DETAILED TECHNICAL SPECIFICATIONS OR TERMS OF SERVICE" 
                            className="w-full h-56 border-4 border-zinc-50 p-8 font-mono text-xs uppercase outline-none focus:border-black bg-zinc-50 transition-all resize-none shadow-[inner_5px_5px_10px_rgba(0,0,0,0.03)]" 
                            value={catForm.desc || ""} 
                            onChange={e => setCatForm({...catForm, desc: e.target.value})}
                          />
                        </div>

                        <div className="flex items-center gap-6 p-8 bg-zinc-900 border-l-[15px] border-[#ea281e] shadow-[10px_10px_0_rgba(0,0,0,0.1)]">
                          <input 
                            type="checkbox" 
                            id="cat-best-seller"
                            className="w-8 h-8 accent-[#ea281e] cursor-pointer" 
                            checked={catForm.isBestSeller || false} 
                            onChange={e => setCatForm({...catForm, isBestSeller: e.target.checked})}
                          />
                          <label htmlFor="cat-best-seller" className="font-heading text-2xl text-white uppercase tracking-widest cursor-pointer select-none">
                            Promote to Hero Showcase
                          </label>
                        </div>

                        <div className="pt-10">
                          <button 
                            onClick={async () => { await handleSaveCatalog(catForm, editingId); setIsModalOpen(false); }} 
                            disabled={!catForm.name || isUploading}
                            className="w-full bg-black text-white py-10 font-heading text-5xl uppercase tracking-tighter hover:bg-[#ea281e] shadow-[15px_15px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-2 active:shadow-none disabled:bg-zinc-200 disabled:shadow-none"
                          >
                            {editingId ? 'COMMIT_UPDATE' : 'DEPLOY_PRODUCT'}
                          </button>
                        </div>
                    </div>
                )}
                {/* --- 2. MODAL: ACADEMY / LMS ORCHESTRATOR --- */}
                {activeTab === 'ACADEMY' && (
                    <div className="space-y-10 fade-up py-6">
                        <div className="bg-zinc-900 text-white p-10 border-l-[20px] border-[#ea281e] shadow-[15px_15px_0_rgba(0,0,0,0.1)] relative overflow-hidden">
                          <BookOpen className="absolute -right-8 -bottom-8 text-white/5 rotate-12" size={200} />
                          <h3 className="font-heading text-5xl uppercase tracking-tighter mb-4 relative z-10 italic">LMS_Config.</h3>
                          <p className="font-mono text-[9px] text-zinc-500 uppercase font-black tracking-[0.4em] relative z-10">Configure education sequence, drive assets, and crypto-reward keys.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Episode Nomenclature</label>
                              <input 
                                placeholder="E.G. PSYCHOLOGY OF PERSUASION" 
                                className="w-full border-b-4 border-black py-4 outline-none font-heading text-3xl uppercase tracking-tighter focus:border-[#ea281e] transition-colors" 
                                value={epForm.title || ""} 
                                onChange={e => setEpForm({...epForm, title: e.target.value})}
                              />
                            </div>

                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Materi Source Link (GDrive)</label>
                              <div className="relative">
                                <input 
                                  placeholder="HTTPS://DRIVE.GOOGLE.COM/FILE/..." 
                                  className="w-full border-b-2 border-zinc-200 py-4 pl-12 outline-none font-mono text-[10px] font-bold focus:border-black transition-colors" 
                                  value={epForm.driveLink || ""} 
                                  onChange={e => setEpForm({...epForm, driveLink: e.target.value})}
                                />
                                <Globe className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300" size={22} />
                              </div>
                            </div>

                            <div className="group p-8 bg-green-50 border-2 border-green-200 shadow-[8px_8px_0_#22c55e] relative">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-green-700 mb-3">Premium Reward Data</label>
                              <div className="relative">
                                <input 
                                  placeholder="USERNAME:PASSWORD | PRIVATE_KEY_0X" 
                                  className="w-full bg-white border-b-2 border-green-300 py-4 pl-12 outline-none font-mono text-xs font-black text-green-800 focus:border-green-600 transition-colors uppercase" 
                                  value={epForm.reward || ""} 
                                  onChange={e => setEpForm({...epForm, reward: e.target.value})}
                                />
                                <Key className="absolute left-0 top-1/2 -translate-y-1/2 text-green-400" size={22} />
                              </div>
                              <p className="mt-4 font-mono text-[8px] text-green-600 font-bold uppercase tracking-widest leading-relaxed italic">Data ini hanya akan muncul setelah user menyelesaikan kuis & kesimpulan episode terakhir.</p>
                            </div>
                        </div>

                        {/* QUIZ ENGINE CONFIGURATION INTERFACE */}
                        <div className="p-10 border-4 border-black bg-zinc-50 space-y-10 relative">
                            <div className="absolute -top-5 left-10 bg-black text-white px-6 py-2 font-heading text-lg uppercase tracking-[0.2em] shadow-lg italic">Quiz_Logical_Node</div>
                            
                            <div className="space-y-8">
                              <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 italic">Primary Question</label>
                                <input 
                                  placeholder="WHAT IS THE CORE VALUE OF..." 
                                  className="w-full bg-white border-2 border-black p-6 outline-none font-heading text-2xl md:text-3xl uppercase tracking-tighter focus:bg-zinc-900 focus:text-white transition-all shadow-[8px_8px_0_rgba(0,0,0,0.05)]" 
                                  value={epForm.questions[0].text || ""} 
                                  onChange={e => {
                                    const q = [...epForm.questions]; 
                                    q[0].text = e.target.value; 
                                    setEpForm({...epForm, questions: q});
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {epForm.questions[0].options.map((opt, i) => (
                                    <div key={i} className="flex flex-col group/opt">
                                      <label className={`text-[9px] font-black uppercase mb-3 tracking-widest transition-colors ${epForm.questions[0].correct === i ? 'text-green-600' : 'text-zinc-400'}`}>
                                        Option_Alpha_0{i+1} {epForm.questions[0].correct === i ? ' (AUTH_CORRECT)' : ''}
                                      </label>
                                      <div className="relative">
                                        <input 
                                          placeholder={`INPUT_VALUE_0${i+1}`} 
                                          className={`w-full p-5 border-2 font-mono text-[11px] font-bold outline-none transition-all ${epForm.questions[0].correct === i ? 'border-green-500 bg-green-50 text-green-900 shadow-[4px_4px_0_#22c55e]' : 'border-zinc-200 bg-white focus:border-black'}`} 
                                          value={opt || ""} 
                                          onChange={e => {
                                            const q = [...epForm.questions]; 
                                            q[0].options[i] = e.target.value; 
                                            setEpForm({...epForm, questions: q});
                                          }}
                                        />
                                        <button 
                                          onClick={() => {
                                            const q = [...epForm.questions]; 
                                            q[0].correct = i; 
                                            setEpForm({...epForm, questions: q});
                                          }}
                                          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${epForm.questions[0].correct === i ? 'bg-green-500 text-white scale-110 shadow-lg' : 'bg-zinc-100 text-zinc-300 hover:bg-black hover:text-white'}`}
                                        >
                                          <Check size={18}/>
                                        </button>
                                      </div>
                                    </div>
                                ))}
                              </div>
                            </div>
                        </div>

                        <div className="pt-10">
                          <button 
                            onClick={async () => { const s = await handleSaveEpisode(epForm, editingId); if(s) setIsModalOpen(false); }} 
                            disabled={!epForm.title || !epForm.driveLink}
                            className="w-full bg-black text-white py-10 font-heading text-5xl uppercase tracking-tighter hover:bg-[#ea281e] shadow-[20px_20px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-2 active:shadow-none disabled:bg-zinc-200"
                          >
                            {editingId ? 'COMMIT_EPISODE_CHANGES' : 'INJECT_ACADEMY_NODE'}
                          </button>
                        </div>
                    </div>
                )}

                {/* --- 3. MODAL: BILLBOARD / BANNERS CONFIG --- */}
                {activeTab === 'BANNERS' && (
                    <div className="space-y-10 fade-up py-6">
                        <div className="bg-zinc-900 text-white p-10 border-l-[20px] border-[#ea281e] shadow-[15px_15px_0_black]">
                          <h3 className="font-heading text-5xl uppercase tracking-tighter mb-2 italic">Billboard_Config.</h3>
                          <p className="font-mono text-[9px] text-zinc-500 uppercase font-black tracking-[0.4em]">Visual campaign deployment terminal.</p>
                        </div>

                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4">Campaign Title</label>
                          <input 
                            placeholder="CAMPAIGN_SLUG_ID" 
                            className="w-full border-b-4 border-black py-6 outline-none font-heading text-4xl uppercase tracking-tighter focus:border-[#ea281e] transition-all bg-transparent" 
                            value={banForm.title || ""} 
                            onChange={e => setBanForm({...banForm, title: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Asset Format</label>
                              <select className="w-full p-5 border-4 border-black font-heading text-2xl uppercase tracking-widest cursor-pointer bg-white" value={banForm.type || "image"} onChange={e => setBanForm({...banForm, type: e.target.value})}>
                                  <option value="image">STATIC_BINARY_IMAGE</option>
                                  <option value="video">MOTION_DYNAMIC_VIDEO</option>
                              </select>
                            </div>
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Node Orientation</label>
                              <select className="w-full p-5 border-4 border-black font-heading text-2xl uppercase tracking-widest cursor-pointer bg-white" value={banForm.orientation || "landscape"} onChange={e => setBanForm({...banForm, orientation: e.target.value})}>
                                  <option value="landscape">LANDSCAPE_WIDE (21:9)</option>
                                  <option value="portrait">PORTRAIT_STORY (9:16)</option>
                              </select>
                            </div>
                        </div>

                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">Binary Injection (File)</label>
                          <div className="border-4 border-dashed border-zinc-200 p-20 text-center relative hover:border-[#ea281e] hover:bg-zinc-50 transition-all group cursor-hover">
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => handleImageFile(e, setBanForm, banForm)}/>
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-6">
                                  <RefreshCw className="animate-spin text-[#ea281e]" size={60} />
                                  <span className="font-heading text-3xl uppercase tracking-[0.3em]">Uploading_Asset...</span>
                                </div>
                              ) : banForm.imageUrl ? (
                                <div className="text-[10px] font-mono font-black text-green-600 uppercase italic flex flex-col items-center gap-4">
                                  <div className="p-4 bg-green-50 border-2 border-green-200">ASSET_LOADED: {banForm.imageUrl.substring(0, 50)}...</div>
                                  <span className="text-zinc-300">Click to re-inject source</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-6 text-zinc-200 group-hover:text-[#ea281e] transition-all">
                                  <Upload size={100} strokeWidth={1} />
                                  <span className="font-heading text-4xl uppercase tracking-tighter">Choose_Binary_Source</span>
                                </div>
                              )}
                          </div>
                        </div>

                        <button 
                          onClick={async () => { const s = await handleSaveBanner(banForm, editingId); if(s) setIsModalOpen(false); }} 
                          disabled={!banForm.title || isUploading}
                          className="w-full bg-black text-white py-10 font-heading text-5xl uppercase tracking-tighter hover:bg-[#ea281e] shadow-[20px_20px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-2"
                        >
                          LAUNCH_CAMPAIGN
                        </button>
                    </div>
                )}

                {/* --- 4. MODAL: LOGBOOK / SESSIONS INJECTOR --- */}
                {activeTab === 'TRANSACTIONS' && (
                    <div className="space-y-10 fade-up py-6">
                        <div className="bg-zinc-900 text-white p-10 border-l-[20px] border-[#ea281e] shadow-[15px_15px_0_black]">
                          <h3 className="font-heading text-5xl uppercase tracking-tighter mb-2 italic">Registry_Update.</h3>
                          <p className="font-mono text-[9px] text-zinc-500 uppercase font-black tracking-[0.4em]">Subscriber session and duration management.</p>
                        </div>

                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4">Subscriber Identification</label>
                          <input 
                            placeholder="CLIENT_LEGAL_NAME" 
                            className="w-full border-b-4 border-black py-6 outline-none font-heading text-4xl uppercase tracking-tighter focus:border-[#ea281e] transition-all bg-transparent" 
                            value={trxForm.name || ""} 
                            onChange={e => setTrxForm({...trxForm, name: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Service Platform</label>
                              <input 
                                placeholder="E.G. NETFLIX_PREMIUM_4K" 
                                className="w-full border-b-2 border-zinc-200 py-4 outline-none uppercase font-black text-xs focus:border-black transition-colors" 
                                value={trxForm.app || ""} 
                                onChange={e => setTrxForm({...trxForm, app: e.target.value})}
                              />
                            </div>
                            <div className="group">
                              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">Duration_Days</label>
                              <input 
                                type="number" 
                                placeholder="30" 
                                className="w-full border-b-2 border-zinc-200 py-4 outline-none uppercase font-black text-xs focus:border-black transition-colors" 
                                value={trxForm.durationDays || ""} 
                                onChange={e => setTrxForm({...trxForm, durationDays: e.target.value})}
                              />
                            </div>
                        </div>

                        <div className="group">
                          <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4">Verification Email</label>
                          <div className="relative">
                            <input 
                              placeholder="CLIENT_NAME@EMAIL.DOMAIN" 
                              className="w-full bg-zinc-50 border-4 border-zinc-100 p-6 pl-16 outline-none font-mono text-sm font-black focus:border-black transition-all" 
                              value={trxForm.email || ""} 
                              onChange={e => setTrxForm({...trxForm, email: e.target.value})}
                            />
                            <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={28} />
                          </div>
                        </div>

                        <div className="pt-6">
                          <button 
                            onClick={async () => { const s = await handleSaveTransaction(trxForm, editingId); if(s) setIsModalOpen(false); }} 
                            disabled={!trxForm.name || !trxForm.email}
                            className="w-full bg-black text-white py-10 font-heading text-5xl uppercase tracking-tighter hover:bg-[#ea281e] shadow-[20px_20px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-2"
                          >
                            {editingId ? 'COMMIT_LOG_SYNC' : 'EXECUTE_NEW_SESSION'}
                          </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ============================================================
// 10. MAIN APP ORCHESTRATOR (ROOT ENGINE)
// ============================================================
export default function App() {
  // --- A. PRIMARY APPLICATION STATES ---
  const [view, setView] = useState('landing'); // landing, store, academy, admin
  const [lang, setLang] = useState('id');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState('SYSTEM');
  
  // --- B. DATABASE SYNCHRONIZATION STATES ---
  const [globalStatus, setGlobalStatus] = useState('...');
  const [catalog, setCatalog] = useState([]);
  const [informations, setInformations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // --- C. INTERACTIVE UI STATES ---
  const [commentEmail, setCommentEmail] = useState('');
  const [reviewType, setReviewType] = useState(null); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [isUploading, setIsUploading] = useState(false);

  // --- D. TRANSLATION ENGINE ---
  const t = translations[lang] || translations['id'];

  /**
   * ============================================================
   * 11. DATABASE LOGIC HANDLERS (DEFINED INSIDE APP)
   * ============================================================
   * Memastikan semua handler memiliki akses langsung ke Firebase 
   * Instance dan state setter untuk menghindari Reference Error.
   */

  // --- 11.1 HANDLER: ADMIN ACCESS GATE ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if(loginForm.user === 'Bagas' && loginForm.pass === '51512') {
        setIsAdminLoggedIn(true);
        console.log("Access Granted: Authorized Chief Bagas");
    } else {
        alert("ACCESS_DENIED: UNAUTHORIZED CREDENTIALS");
    }
  };

  // --- 11.2 HANDLER: CATALOG DB OPERATIONS ---
  const handleSaveCatalog = async (data, editId) => {
    try {
      const payload = { 
        ...data, 
        image: data.imageUrl || '', 
        id: editId ? data.id : Date.now(),
        updatedAt: serverTimestamp() 
      };
      if(editId) {
        await updateDoc(doc(db, "catalog", editId), payload);
      } else {
        await addDoc(collection(db, "catalog"), payload);
      }
      return true;
    } catch(err) {
      console.error("DB_CATALOG_ERROR:", err);
      return false;
    }
  };
  // --- 11.3 HANDLER: NEWS/JOURNAL DB OPERATIONS ---
  const handleSaveInfo = async (data, editId) => {
    try {
      const infoPayload = { 
        title: data.title, 
        content: data.content, 
        image: data.imageUrl || '', 
        date: new Date().toLocaleDateString('id-ID'), 
        id: editId ? data.id : Date.now(),
        type: 'NEWS'
      };
      if(editId) {
        await updateDoc(doc(db, "informations", editId), infoPayload);
      } else {
        await addDoc(collection(db, "informations"), infoPayload);
      }
      return true;
    } catch(err) {
      console.error("DB_INFO_ERROR:", err);
      return false;
    }
  };

  // --- 11.4 HANDLER: BILLBOARD BANNER DB OPERATIONS ---
  const handleSaveBanner = async (data, editId) => {
    try {
      const bannerPayload = { 
        title: data.title || "Untitled_Campaign", 
        image: data.imageUrl || '', 
        type: data.type || 'image', 
        orientation: data.orientation || 'landscape', 
        id: editId ? data.id : Date.now() 
      };
      if(editId) {
        await updateDoc(doc(db, "banners", editId), bannerPayload);
      } else {
        await addDoc(collection(db, "banners"), bannerPayload);
      }
      return true;
    } catch(err) {
      console.error("DB_BANNER_ERROR:", err);
      return false;
    }
  };

  // --- 11.5 HANDLER: ACADEMY EPISODE DB OPERATIONS ---
  const handleSaveEpisode = async (data, editId) => {
    try {
      const episodePayload = { 
        ...data, 
        id: editId ? data.id : Date.now(),
        timestamp: serverTimestamp() 
      };
      if(editId) {
        await updateDoc(doc(db, "episodes", editId), episodePayload);
      } else {
        await addDoc(collection(db, "episodes"), episodePayload);
      }
      return true;
    } catch(err) {
      console.error("DB_ACADEMY_ERROR:", err);
      return false;
    }
  };

  // --- 11.6 HANDLER: TRANSACTION SESSION DB OPERATIONS ---
  const handleSaveTransaction = async (data, editId) => {
    try {
      let sessionPayload = { 
        name: data.name, 
        app: data.app, 
        email: data.email.toLowerCase().trim(), 
        status: 'Aktif' 
      };
      
      if(data.durationDays) {
        const expDate = new Date(); 
        expDate.setDate(expDate.getDate() + parseInt(data.durationDays));
        sessionPayload.targetDate = expDate;
      }
      
      if(editId) {
        await updateDoc(doc(db, "transactions", editId), sessionPayload);
      } else {
        await addDoc(collection(db, "transactions"), { ...sessionPayload, id: Date.now() });
      }
      return true;
    } catch(err) {
      console.error("DB_TRANSACTION_ERROR:", err);
      return false;
    }
  };

  // --- 11.7 HANDLER: BINARY ASSET UPLOADER (BASE64) ---
  const handleImageFile = (e, setter, currentData) => {
    const asset = e.target.files[0];
    if (asset) {
      if (asset.size > 1048576) {
        alert("FILE_TOO_LARGE: MAX_LIMIT_1MB_REACHED");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => { 
        setter({ ...currentData, imageUrl: reader.result }); 
        setIsUploading(false); 
      };
      reader.readAsDataURL(asset);
    }
  };

  // --- 11.8 HANDLER: FEEDBACK SYSTEM ---
  const handleVerifyEmail = async () => {
    if(!commentEmail) return;
    setIsVerifying(true);
    try {
      const q = query(collection(db, "transactions"), where("email", "==", commentEmail.toLowerCase().trim()));
      const snap = await getDocs(q);
      if(!snap.empty) {
        setReviewType('customer');
      } else {
        alert("Verification_Failed: Email not found in subscriber registry.");
      }
    } catch(err) { console.error(err); }
    setIsVerifying(false);
  };

  const handlePostComment = async () => {
    if(!commentText) return;
    try {
      await addDoc(collection(db, "comments"), {
        email: commentEmail || "GUEST_USER",
        text: commentText,
        rating: commentRating,
        role: reviewType || 'guest',
        status: reviewType === 'customer' ? 'approved' : 'pending',
        timestamp: Date.now(),
        date: new Date().toLocaleString('id-ID')
      });
      alert(reviewType === 'customer' ? "Ulasan Dipublikasikan!" : "Menunggu Review Admin.");
      setCommentText(''); setReviewType(null); setCommentEmail('');
    } catch(err) { console.error(err); }
  };

  // --- 11.9 HANDLER: GLOBAL DELETE ENGINE ---
  const handleDelete = async (coll, id) => {
    if(window.confirm("PERINGATAN: Hapus data permanen dari database?")) {
      try {
        await deleteDoc(doc(db, coll, id));
        console.log(`Purged: ${id} from ${coll}`);
      } catch(err) { console.error(err); }
    }
  };

  /**
   * ============================================================
   * 12. DATA STREAMING SYSTEM (SNAPSHOTS)
   * ============================================================
   */
  useEffect(() => {
    onAuthStateChanged(auth, (user) => { 
      if(!user) signInAnonymously(auth); 
      else {
        // Start Global Real-time Listeners
        onSnapshot(doc(db, "settings", "global_status"), (d) => setGlobalStatus(d.exists() ? d.data().status : 'Aktif'));
        onSnapshot(query(collection(db, "catalog"), orderBy("id", "desc")), (s) => setCatalog(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
        onSnapshot(query(collection(db, "informations"), orderBy("id", "desc")), (s) => setInformations(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
        onSnapshot(query(collection(db, "transactions"), orderBy("id", "desc")), (s) => setTransactions(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
        onSnapshot(query(collection(db, "banners"), orderBy("id", "desc")), (s) => setBanners(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
        onSnapshot(query(collection(db, "activities"), orderBy("id", "desc")), (s) => setActivities(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
        onSnapshot(query(collection(db, "comments"), orderBy("timestamp", "desc")), (s) => setComments(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
        onSnapshot(query(collection(db, "episodes"), orderBy("id", "asc")), (s) => setEpisodes(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
      }
    });
  }, []);

  /**
   * ============================================================
   * 13. MASTER RENDER ENGINE (JSX)
   * ============================================================
   */
  return (
    <div className="tokko-application-root selection:bg-[#ea281e] selection:text-white">
        <style>{globalStyles}</style>
        
        {/* GLOBAL PERSISTENT UI */}
        <CustomCursor />
        <Header 
          isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} 
          setView={setView} lang={lang} setLang={setLang} t={t} 
        />
        
        {/* OVERLAY MENU */}
        <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`}>
            <nav className="flex flex-col items-start px-8 md:px-20">
                <button onClick={() => {setView('landing'); setIsMenuOpen(false);}} className="menu-link group">
                  <span className="text-[#ea281e] mr-4 opacity-0 group-hover:opacity-100 transition-all">/</span>{t?.home}
                </button>
                <button onClick={() => {setView('store'); setIsMenuOpen(false);}} className="menu-link group">
                  <span className="text-[#ea281e] mr-4 opacity-0 group-hover:opacity-100 transition-all">/</span>{t?.store}
                </button>
                <button onClick={() => {setView('academy'); setIsMenuOpen(false);}} className="menu-link group">
                  <span className="text-[#ea281e] mr-4 opacity-0 group-hover:opacity-100 transition-all">/</span>{t?.academy}
                </button>
                <div className="h-[2px] w-40 bg-zinc-900 my-10"></div>
                <button onClick={() => {setView('admin'); setIsMenuOpen(false);}} className="menu-link text-zinc-600 group">
                  <span className="text-[#ea281e] mr-4 opacity-0 group-hover:opacity-100 transition-all">/</span>CHIEF_NODE
                </button>
            </nav>
            <div className="absolute bottom-10 left-8 md:left-20 font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-800 font-black">
              TOKKO_OS v4.0.2_STABLE // BUILD_19D24
            </div>
        </div>

        {/* ================= DYNAMIC ROUTING ================= */}
        
        {view === 'landing' && (
          <LandingPage setView={setView} catalog={catalog} t={t} />
        )}

        {view === 'store' && (
            <StorePage 
              globalStatus={globalStatus} catalog={catalog} informations={informations} 
              activities={activities} transactions={transactions} banners={banners} 
              comments={comments} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
              handleVerifyEmail={handleVerifyEmail} isEmailVerified={!!reviewType}
              commentEmail={commentEmail} setCommentEmail={setCommentEmail} 
              handlePostComment={handlePostComment} commentText={commentText} 
              setCommentText={setCommentText} commentRating={commentRating} 
              setCommentRating={setCommentRating} t={t} isVerifying={isVerifying} 
              setReviewType={setReviewType} reviewType={reviewType}
            />
        )}

        {view === 'academy' && (
          <div className="pt-20 bg-white">
            <AcademyModule episodes={episodes} t={t} />
          </div>
        )}
        
        {view === 'admin' && !isAdminLoggedIn && (
            <AdminLoginView 
              loginForm={loginForm} setLoginForm={setLoginForm} 
              handleAdminLogin={handleAdminLogin} setView={setView} t={t} 
            />
        )}

        {view === 'admin' && isAdminLoggedIn && (
            <AdminDashboard 
                activeTab={adminTab} setActiveTab={setAdminTab} t={t}
                globalStatus={globalStatus} 
                setGlobalStatus={(s) => setDoc(doc(db, "settings", "global_status"), { status: s })}
                catalog={catalog} informations={informations} banners={banners} 
                transactions={transactions} activities={activities} comments={comments} 
                episodes={episodes}
                handleSaveCatalog={handleSaveCatalog} 
                handleSaveInfo={handleSaveInfo} 
                handleSaveBanner={handleSaveBanner} 
                handleSaveTransaction={handleSaveTransaction}
                handleSaveEpisode={handleSaveEpisode}
                handleDelete={handleDelete}
                handleApproveReview={(id) => updateDoc(doc(db, "comments", id), { status: 'approved' })} 
                isUploading={isUploading} handleImageFile={handleImageFile} 
                handleLogout={() => setIsAdminLoggedIn(false)}
            />
        )}

        {/* FOOTER CREDITS */}
        {['landing', 'store'].includes(view) && (
          <footer className="bg-white border-t-2 border-zinc-100 py-16 px-8 text-center relative overflow-hidden">
             <div className="font-heading text-3xl md:text-5xl uppercase tracking-tighter mb-4 italic">Tokko Digital Supply.</div>
             <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">© 2025 TOKKO.INC • ALL RIGHTS RESERVED • NODE_19D24</p>
             <div className="absolute -bottom-10 -right-10 text-zinc-50 font-heading text-[15vw] opacity-50 pointer-events-none uppercase">AUTHENTIC</div>
          </footer>
        )}
    </div>
  );
}

// ============================================================
// END OF SOURCE CODE - TOKKO MASTER EDITION
// TOTAL ESTIMATED LINES: 1200+ (WITH PARTIAL VERBOSITY)
// STATUS: DEPLOYMENT READY
// ============================================================