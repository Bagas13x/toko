import React, { useState, useEffect, useRef, useMemo } from 'react';
import bagasImg from "./assets/bagas.jpg";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, setDoc, where, getDocs, increment
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Menu, X, ShoppingBag, ArrowRight, Phone, Instagram, MapPin, 
  Check, AlertTriangle, XCircle, Search, Star, Bell, AlertCircle, 
  Send, Loader2, PauseCircle, Camera, FileText, Layout, LayoutTemplate, 
  List, Upload, Trash2, Pencil, LogOut, Lock, ChevronDown, ChevronUp,
  Image as ImageIcon, CheckCircle2, Activity, MessageSquare, ExternalLink, 
  Play, Disc, Globe, Music, Volume2, VolumeX, BarChart, Vote, Users
} from 'lucide-react';
import musicFile from "./assets/music.mp3";

// ============================================================
// 1. KONFIGURASI FIREBASE
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
// 2. TRANSLATIONS
// ============================================================
const translations = {
  jawa: {
    home: "Omah", store: "Toko", chief: "Admin", explore: "TUKU",
    future: "Tokko", philosophy: "Kabeh Kebutuhan Premiummu ana Ning Kene",
    search: "Golek Aplikasi Premium..", detail: "Detail", price: "Rego", spec: "Spek",
    journal: "Jurnal", status: "Status", reviews: "Review", customer: "Pelanggan",
    nonCustomer: "Tamu", verify: "Verifikasi Email", verifyBtn: "Cek",
    guestBtn: "Nulis Dadi Tamu", pending: "Ngenteni Admin", postReview: "Kirim Review",
    logout: "Metu", ProduksTitle: "JOSS", ProduksDesc: "Pilihan Paling Joss Ning Kene",
    polls: "Polling", vote: "Milih", results: "Hasil", totalVotes: "Total Swara"
  },
  id: {
    home: "Beranda", store: "Toko", chief: "Admin", explore: "Produk", 
    future: "Tokko", philosophy: "Semua Kebutuhan Premiummu Ada di Sini",
    search: "Cari Aplikasi Premium..", detail: "Detail", price: "Harga", spec: "Spesifikasi",
    journal: "Jurnal", status: "Status", reviews: "Ulasan", customer: "Pelanggan",
    nonCustomer: "Tamu", verify: "Verifikasi Email", verifyBtn: "Cek",
    guestBtn: "Tulis Sebagai Tamu", pending: "Menunggu Admin", postReview: "Kirim Ulasan",
    logout: "Keluar", ProduksTitle: "TERBAIK", ProduksDesc: "Pilihan Produk Terbaik Kami",
    polls: "Polling", vote: "Vote", results: "Hasil", totalVotes: "Total Vote"
  },
  en: {
    home: "Home", store: "Store", chief: "Administrator", explore: "Products",
    future: "Tokko", philosophy: "All Your Premium Needs Are Here",
    search: "Search for Premium Applications..", detail: "Details", price: "Price", spec: "Specifications",
    journal: "Journal", status: "Status", reviews: "Reviews", customer: "Customer",
    nonCustomer: "Guest", verify: "Email Verification", verifyBtn: "Check",
    guestBtn: "Write as Guest", pending: "Pending Admin", postReview: "Submit Review",
    logout: "Log Out", ProduksTitle: "BEST", ProduksDesc: "Our Best Product Selections",
    polls: "Polls", vote: "Vote", results: "Results", totalVotes: "Total Votes"
  }
};

// ============================================================
// 3. GLOBAL STYLES
// ============================================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;700&family=Syne:wght@400;600;800&display=swap');
  :root { --primary: #000000; --accent: #ea281e; --bg: #ffffff; --text: #000000; }
  body { background-color: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; cursor: none; overflow-x: hidden; }
  @media (hover: none) and (pointer: coarse) { .custom-cursor { display: none; } body { cursor: auto; } }
  .custom-cursor { position: fixed; top: 0; left: 0; width: 20px; height: 20px; background: var(--primary); border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s, background 0.3s, transform 0.1s; mix-blend-mode: difference; }
  .custom-cursor.hovered { width: 60px; height: 60px; background: rgba(234, 40, 30, 0.2); border: 2px solid var(--accent); }
  h1, h2, h3, .font-heading { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: -0.02em; }
  .fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(40px); }
  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
  .marquee-container { overflow: hidden; white-space: nowrap; }
  .marquee-content { display: inline-block; animation: marquee 30s linear infinite; }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #000000; z-index: 500; transform: translateY(-100%); transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1); display: flex; flex-direction: column; justify-content: center; padding: 2rem; }
  .menu-overlay.open { transform: translateY(0); }
  .menu-link { font-family: 'Oswald', sans-serif; font-size: 12vw; font-weight: 700; color: white; opacity: 0; transform: translateY(50px); transition: 0.5s; cursor: none; line-height: 1.1; text-transform: uppercase; }
  .menu-overlay.open .menu-link { opacity: 1; transform: translateY(0); }
  .store-card { border: 1px solid #e5e5e5; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); background: white; }
  .tab-btn { font-family: 'Oswald', sans-serif; font-size: 1rem; font-weight: 500; padding-bottom: 0.5rem; color: #9ca3af; transition: 0.3s; text-transform: uppercase; }
  .tab-btn.active { color: var(--primary); border-bottom: 3px solid var(--accent); }
  ::-webkit-scrollbar { height: 2px; width: 4px; }
  ::-webkit-scrollbar-thumb { background: black; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .admin-login-bg { background: radial-gradient(circle at top right, #111, #000); }
  .video-portrait { aspect-ratio: 9/16; object-fit: cover; width: 100%; border: 1px solid black; }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .rotate { animation: rotate 10s linear infinite; }
  .rotate-paused { animation-play-state: paused; }
`;

// ============================================================
// 4. UI UTILITIES
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

// Komponen MusicPlayer Global
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Inisialisasi audio saat komponen pertama kali dimuat
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src={musicFile} type="audio/mpeg" />
      </audio>
      <button
        onClick={togglePlay}
        className="fixed bottom-6 left-6 z-[1000] w-12 h-12 rounded-full bg-black text-white flex items-center justify-center cursor-hover shadow-lg border border-white/20"
      >
        <div className={`relative ${isPlaying ? 'rotate' : 'rotate rotate-paused'}`}>
          <Disc size={24} />
        </div>
        <span className="sr-only">{isPlaying ? 'Pause music' : 'Play music'}</span>
      </button>
    </>
  );
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
        <h2 className="text-3xl md:text-4xl font-heading mb-6 md:mb-8 border-b-2 border-black pb-4 tracking-tighter">{title}</h2>
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
      <div className="flex items-center gap-4 fade-up" style={{animationDelay: '0.2s'}}>
          <h1 className="text-[20vw] md:text-[18vw] font-bold font-heading text-[#ea281e]">{t?.future || "TOKKO"}</h1>
          <button onClick={() => setView('store')} className="hidden md:flex w-40 h-40 rounded-full border border-black items-center justify-center font-heading font-bold text-lg hover:bg-black hover:text-white transition-all cursor-hover">{t?.explore || "EXPLORE"}</button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-8 md:mt-12 gap-6 md:gap-8 fade-up" style={{animationDelay: '0.4s'}}>
        <p className="max-w-xl text-lg md:text-2xl leading-relaxed font-semibold">{t?.philosophy || "Semua Kebutuhan Premiummu Ada di Sini"}</p>
        <button onClick={() => setView('store')} className="md:hidden border-2 border-black px-8 py-3 font-heading font-bold text-lg hover:bg-black hover:text-white transition-all uppercase">{t?.explore || "EXPLORE"} STORE</button>
      </div>
    </section>

    <div className="bg-black text-white py-6 md:py-10 marquee-container transform -rotate-1">
      <div className="marquee-content text-4xl md:text-8xl font-heading font-bold uppercase">• Full Warranty • Trusted Partner • 24/7 Hours • RealTime Duration •</div>
    </div>

    <section className="px-6 md:px-12 py-20 md:py-32 bg-[#f9f9f9]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        <div className="md:sticky md:top-32">
          <h2 className="text-6xl md:text-9xl font-heading leading-none tracking-tighter">PRODUK<br/><span className="text-[#ea281e]">{t?.ProduksTitle || "BEST"}</span></h2>
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
              <h3 className="text-3xl md:text-5xl font-heading tracking-tighter italic">{item.name}</h3>
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
          <img src={bagasImg} alt="Kepercayaan" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" />
        </div>
      </div>
      <h2 className="text-3xl md:text-6xl font-heading mb-8 md:mb-12 max-w-4xl mx-auto italic leading-tight px-4 tracking-tighter">"Kepercayaan kamu, prioritas kami."</h2>
      <div className="w-16 h-[2px] bg-[#ea281e] mx-auto mb-8"></div>
      <a href="https://instagram.com/13bagas.exv" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] md:text-sm tracking-widest uppercase text-gray-500 hover:text-white transition-colors">Instagram</a>
    </section>
  </div>
);

// ============================================================
// 6. STORE PAGE VIEW DENGAN BANNER & POLLING
// ============================================================
const StorePage = ({ 
  globalStatus, catalog, informations, transactions, banners, activities, comments,
  searchQuery, setSearchQuery, handleVerifyEmail, isEmailVerified, commentEmail, setCommentEmail,
  handlePostComment, commentText, setCommentText, commentRating, setCommentRating, t, isVerifying, 
  setReviewType, reviewType, polls, handleVote
}) => {
  const [storeTab, setStoreTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [userVotes, setUserVotes] = useState(() => {
    const saved = localStorage.getItem('tokko_votes');
    return saved ? JSON.parse(saved) : {};
  });

  // Banner Persistence Fix - semua banner ditampilkan
  const landscapeBanners = useMemo(() => {
    return (banners || []).filter(b => b.orientation === 'landscape' && b.type !== 'poll').sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [banners]);

  const portraitBanners = useMemo(() => {
    return (banners || []).filter(b => b.orientation === 'portrait' && b.type !== 'poll').sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [banners]);

  const activePolls = useMemo(() => {
    return (polls || []).filter(p => p.active === true).sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [polls]);

  const journalEntries = useMemo(() => {
    const infos = (informations || []).map(i => ({ ...i, type: 'NEWS' }));
    const acts = (activities || []).map(a => ({ ...a, type: 'ACTIVITY', title: a.caption, content: a.desc }));
    return [...infos, ...acts].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [informations, activities]);

  const filteredCatalog = (catalog || []).filter(c => 
    (c.name || "").toLowerCase().includes(searchQuery?.toLowerCase() || "") || 
    (c.app || "").toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

  const approvedComments = useMemo(() => (comments || []).filter(c => c.status === 'approved'), [comments]);

  const handlePollVote = async (pollId, optionIndex) => {
    const hasVoted = userVotes[pollId];
    if (hasVoted) {
      alert("Anda sudah memilih di polling ini!");
      return;
    }

    const success = await handleVote(pollId, optionIndex);
    if (success) {
      const newVotes = { ...userVotes, [pollId]: true };
      setUserVotes(newVotes);
      localStorage.setItem('tokko_votes', JSON.stringify(newVotes));
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Header Store */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-4 mb-8 md:mb-12 gap-4">
          <h1 className="text-5xl md:text-8xl font-heading uppercase tracking-tighter">{t?.store || "STORE"}</h1>
          <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {['home', 'catalog', 'journal', 'status', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setStoreTab(tab)} className={`tab-btn whitespace-nowrap cursor-hover ${storeTab === tab ? 'active' : ''}`}>{t?.[tab] || tab.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 md:mb-16 group px-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black" size={20} />
          <input type="text" placeholder={t?.search || "Search..."} className="w-full border-b border-gray-300 py-4 md:py-6 pl-10 md:pl-12 outline-none font-heading text-lg md:text-2xl uppercase focus:border-black transition-colors bg-transparent" value={searchQuery || ""} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* ================= STORE TAB: HOME ================= */}
        {storeTab === 'home' && (
          <div className="fade-up space-y-10 md:space-y-16 px-2">
            {/* Landscape Section */}
            {landscapeBanners.length > 0 && (
              <div className="w-full mb-8">
                {landscapeBanners.map((lb, i) => (
                  <div key={lb.firebaseId || i} className="relative w-full aspect-video md:aspect-[21/9] border-2 border-black overflow-hidden bg-zinc-100 shadow-[8px_8px_0_black] mb-6 cursor-pointer group" onClick={() => handleBannerClick(lb)}>
                    {/* Tampilkan judul banner kecil di pojok kiri atas */}
                    {lb.title && (
                      <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest z-10">
                        {lb.title}
                      </div>
                    )}
                    
                    {lb.type === 'video' ? (
                      <video src={lb.image} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={lb.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Ads" />
                    )}
                    
                    {lb.link && (
                      <div className="absolute bottom-2 right-2 bg-white text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                        <ExternalLink size={10} /> LINK
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Portrait/Clip Grid */}
            {portraitBanners.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {portraitBanners.map((pb) => (
                  <div key={pb.firebaseId} className="relative overflow-hidden group border-2 border-black bg-zinc-100 aspect-[9/16] cursor-pointer" onClick={() => handleBannerClick(pb)}>
                    {pb.type === 'video' ? (
                      <video src={pb.image} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={pb.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Clip" />
                    )}
                    
                    {/* Tampilkan judul banner kecil di bagian bawah */}
                    {pb.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-[10px] font-bold uppercase tracking-widest text-center">
                        {pb.title}
                      </div>
                    )}
                    
                    {pb.link && (
                      <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full">
                        <ExternalLink size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Polling Section */}
            {activePolls.length > 0 && (
              <div className="mt-12 pt-8 border-t border-black">
                <div className="flex items-center gap-3 mb-6">
                  <Vote className="text-[#ea281e]" size={28} />
                  <h3 className="text-3xl font-heading uppercase tracking-tighter">{t?.polls || "POLLS"}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activePolls.map(poll => {
                    const userHasVoted = userVotes[poll.firebaseId];
                    const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
                    
                    return (
                      <div key={poll.firebaseId} className="border-2 border-black p-6 bg-white shadow-[6px_6px_0_black]">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-heading text-2xl uppercase tracking-tighter flex-1">{poll.question}</h4>
                          <div className="flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase">
                            <Users size={12} />
                            <span>{totalVotes} {t?.totalVotes || "VOTES"}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {poll.options?.map((option, index) => {
                            const percentage = totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0;
                            const isSelected = userHasVoted;
                            
                            return (
                              <div key={index} className="relative">
                                <button
                                  onClick={() => !userHasVoted && handlePollVote(poll.firebaseId, index)}
                                  disabled={userHasVoted}
                                  className={`w-full text-left p-4 border-2 transition-all ${userHasVoted ? 'cursor-default' : 'cursor-hover hover:border-black hover:bg-black hover:text-white'} ${isSelected ? 'border-black bg-black text-white' : 'border-gray-300'}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{option.text}</span>
                                    {userHasVoted && (
                                      <span className="font-bold text-sm">{percentage}%</span>
                                    )}
                                  </div>
                                  {userHasVoted && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-white" style={{ width: `${percentage}%` }}></div>
                                  )}
                                </button>
                                {userHasVoted && (
                                  <div className="absolute top-0 left-0 h-full bg-black/10" style={{ width: `${percentage}%` }}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="text-sm text-gray-500 flex justify-between items-center">
                          {userHasVoted ? (
                            <span className="text-green-600 font-bold">✓ {t?.results || "RESULTS"}</span>
                          ) : (
                            <span className="text-[#ea281e] font-bold">→ {t?.vote || "VOTE NOW"}</span>
                          )}
                          <span className="text-xs">{new Date(poll.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Featured Catalog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 pt-10">
              {(catalog || []).filter(i => i.isBestSeller).map(item => (
                <div key={item.firebaseId} className="store-card p-0 cursor-hover group" onClick={() => setSelectedProduct(item)}>
                  <div className="aspect-square bg-zinc-100 border-b border-zinc-200 overflow-hidden relative">
                    {item.image && <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={item.name}/>}
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between mb-4">
                      <h4 className="font-heading text-2xl md:text-4xl group-hover:text-[#ea281e] transition-colors tracking-tighter">{item.name}</h4>
                      <Star size={20} fill="#ea281e" className="text-[#ea281e]"/>
                    </div>
                    <div className="flex justify-between items-center font-bold text-xl md:text-2xl italic uppercase tracking-tighter">
                        <span>{item.price}</span>
                        <ArrowRight />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STORE TAB: CATALOG ================= */}
        {storeTab === 'catalog' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 fade-up px-2">
            {filteredCatalog.map(item => (
              <div key={item.firebaseId} className="group cursor-hover" onClick={() => setSelectedProduct(item)}>
                <div className="aspect-square bg-zinc-100 mb-4 md:mb-6 relative border border-black flex items-center justify-center overflow-hidden">
                   {item.image ? <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110"/> : <ShoppingBag size={80} className="text-zinc-200"/>}
                   <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white font-heading text-2xl md:text-3xl">{t?.detail || "DETAIL"}</span></div>
                   <div className="absolute bottom-4 left-4 bg-white px-2 py-1 text-[10px] font-bold border border-black uppercase tracking-widest">{item.app}</div>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading uppercase tracking-tighter">{item.name}</h3>
                <p className="font-bold text-lg md:text-xl italic text-gray-500 mt-1 md:mt-2">{item.price}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================= STORE TAB: JOURNAL ================= */}
        {storeTab === 'journal' && (
          <div className="space-y-12 md:space-y-24 fade-up px-2">
              {journalEntries.length > 0 ? journalEntries.map(entry => (
                <div key={entry.firebaseId} className="flex flex-col md:flex-row gap-8 md:gap-16 group cursor-hover" onClick={() => setSelectedJournal(entry)}>
                  <div className="md:w-1/3 aspect-[4/3] border border-black overflow-hidden bg-zinc-100 shrink-0">
                    <img src={entry.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Journal"/>
                  </div>
                  <div className="md:w-2/3 flex flex-col justify-center py-4">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase">{entry.type}</span>
                      <span className="font-mono text-xs text-gray-400">{entry.date}</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-heading mb-6 group-hover:text-[#ea281e] transition-colors uppercase leading-none tracking-tighter">{entry.title}</h2>
                    <p className="text-lg text-gray-600 line-clamp-3 leading-relaxed font-mono text-xs uppercase">{entry.content}</p>
                  </div>
                </div>
              )) : (
                <div className="py-40 text-center uppercase text-zinc-300 font-heading text-4xl">No Journal Found</div>
              )}
          </div>
        )}

        {/* ================= STORE TAB: STATUS ================= */}
        {storeTab === 'status' && (
           <div className="fade-up border-2 border-black mx-2">
              <div className="bg-black text-white p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="font-heading text-3xl md:text-4xl tracking-tighter">LIVE</h2>
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full animate-pulse ${globalStatus === 'Aktif' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                   <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">{String(globalStatus || "OFFLINE")}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px] md:text-sm border-collapse min-w-[500px]">
                   <thead>
                     <tr className="bg-zinc-100 border-b border-black font-bold uppercase tracking-tighter">
                        <th className="p-4 md:p-6">PRODUK</th>
                        <th className="p-4 md:p-6">PLATFORM</th>
                        <th className="p-4 md:p-6">REMAINING</th>
                        <th className="p-4 md:p-6 text-right">SYSTEM</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-200 uppercase font-bold">
                      {(transactions || []).length > 0 ? transactions.map(t => (
                        <tr key={t.firebaseId} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 md:p-8 text-xl tracking-tighter">{t.name}</td>
                          <td className="p-4 md:p-8 text-zinc-400">{t.app}</td>
                          <td className="p-4 md:p-8 font-heading text-lg"><TimeDisplay targetDate={t.targetDate} status={t.status}/></td>
                          <td className="p-4 md:p-8 text-right">
                             <span className={`px-3 py-1 text-[9px] md:text-[10px] text-white tracking-widest ${t.status === 'Aktif' ? 'bg-black' : 'bg-red-600'}`}>
                               {String(t.status || "IDLE").toUpperCase()}
                             </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" className="p-20 text-center text-gray-300 font-heading text-2xl uppercase">NO ACTIVE DATA</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* ================= STORE TAB: REVIEWS ================= */}
        {storeTab === 'reviews' && (
           <div className="fade-up max-w-2xl mx-auto py-20 px-2">
              <h2 className="text-7xl font-heading text-center mb-16 uppercase tracking-tighter">Customers</h2>
              {!reviewType ? (
                 <div className="border-2 border-black p-8 md:p-12 text-center bg-white shadow-[15px_15px_0_#ea281e]">
                    <h3 className="font-heading text-2xl mb-8 uppercase tracking-tighter">{t?.reviews || "REVIEWS"}</h3>
                    <input type="email" placeholder="EMAIL ADDRESS" className="w-full border-b-2 border-black py-4 text-center font-mono outline-none mb-10 text-sm uppercase" value={commentEmail || ""} onChange={e => setCommentEmail(e.target.value)} />
                    <div className="flex flex-col gap-4">
                        <button onClick={handleVerifyEmail} className="w-full bg-black text-white py-5 font-bold uppercase tracking-widest hover:bg-[#ea281e] flex justify-center items-center gap-2">
                           {isVerifying ? <Loader2 className="animate-spin" /> : (t?.verifyBtn || "CHECK")}
                        </button>
                        <button onClick={() => setReviewType('guest')} className="text-xs font-bold uppercase underline hover:text-[#ea281e] cursor-hover tracking-widest">{t?.guestBtn || "WRITE AS GUEST"}</button>
                    </div>
                 </div>
              ) : (
                <div className="border-2 border-black p-6 md:p-10 space-y-8">
                   <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-heading text-2xl tracking-tighter">POST REVIEW</span>
                        <span className={`text-[10px] font-bold uppercase ${reviewType === 'customer' ? 'text-green-600' : 'text-orange-500'}`}>{reviewType === 'customer' ? (t?.customer || "CUSTOMER") : (t?.nonCustomer || "GUEST")}</span>
                      </div>
                      <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={24} onClick={() => setCommentRating(s)} fill={s <= (commentRating || 5) ? "black" : "none"} className="cursor-pointer" />)}</div>
                   </div>
                   <textarea placeholder={t?.postReview || "Write a review..."} className="w-full h-40 border-2 border-zinc-100 p-4 outline-none focus:border-black uppercase font-mono text-xs" value={commentText || ""} onChange={e => setCommentText(e.target.value)} />
                   <button onClick={handlePostComment} className="w-full bg-black text-white py-5 font-bold uppercase tracking-widest">SUBMIT</button>
                   {reviewType === 'guest' && <p className="text-[10px] text-gray-400 italic text-center uppercase tracking-widest font-bold">{t?.pending || "PENDING APPROVAL"}</p>}
                </div>
              )}

              <div className="mt-20 space-y-12 md:space-y-16">
                 {approvedComments.length > 0 ? approvedComments.map((c, idx) => (
                   <div key={c.firebaseId || idx} className="border-l-2 border-black pl-8 relative pb-4">
                      <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-bold uppercase text-white ${c.role === 'customer' ? 'bg-black' : 'bg-orange-500'}`}>{c.role === 'customer' ? (t?.customer || "CUSTOMER") : (t?.nonCustomer || "GUEST")}</div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-heading text-2xl uppercase tracking-tighter leading-none">{c.email?.split('@')[0] || "User"}</span>
                        <div className="flex gap-1">{[...Array(Number(c.rating || 0))].map((_,i) => <Star key={i} size={10} fill="black" />)}</div>
                      </div>
                      <p className="text-xl italic text-gray-600 font-serif leading-tight">"{c.text || ""}"</p>
                      <span className="block mt-6 font-mono text-[10px] text-gray-400 uppercase font-bold">{c.date || "Unknown Date"}</span>
                   </div>
                 )) : (
                    <div className="text-center font-heading text-4xl text-zinc-300 uppercase">No Feedback Yet</div>
                 )}
              </div>
           </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={t?.spec || "SPEC"}>
          {selectedProduct && (
            <div className="space-y-8">
                {selectedProduct.image && <img src={selectedProduct.image} className="w-full h-64 object-cover border border-black shadow-[10px_10px_0_black]" alt="Product"/>}
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div><span className="text-[#ea281e] font-mono text-xs font-bold uppercase tracking-widest">{selectedProduct.app}</span><h2 className="text-5xl font-heading tracking-tighter italic">{selectedProduct.name}</h2></div>
                  <div className="text-4xl font-bold italic uppercase tracking-tighter">{selectedProduct.price}</div>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed border-t border-black pt-8 uppercase font-mono text-xs">{selectedProduct.desc}</p>
                <a href={`https://wa.me/6281319865384?text=Halo TOKKO, saya berminat order ${selectedProduct.name}`} target="_blank" rel="noreferrer" className="w-full bg-black text-white py-6 text-center font-heading text-2xl flex items-center justify-center gap-4 hover:bg-[#ea281e] transition-colors"><Phone /> ORDER VIA WHATSAPP</a>
            </div>
          )}
      </Modal>

      {/* Journal Modal */}
      <Modal isOpen={!!selectedJournal} onClose={() => setSelectedJournal(null)} title="JOURNAL ENTRY">
          {selectedJournal && (
            <div className="space-y-8">
                <img src={selectedJournal.image} className="w-full aspect-video object-cover border border-black shadow-[10px_10px_0_black]" alt="Journal"/>
                <div className="flex items-center gap-4">
                  <span className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{selectedJournal.type}</span>
                  <span className="font-mono text-xs text-gray-400 font-bold">{selectedJournal.date}</span>
                </div>
                <h2 className="text-5xl font-heading tracking-tighter leading-none uppercase">{selectedJournal.title}</h2>
                <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap uppercase font-mono text-xs">{selectedJournal.content}</div>
            </div>
          )}
      </Modal>
    </div>
  );
};

// ============================================================
// 7. ADMIN LOGIN VIEW
// ============================================================
const AdminLoginView = ({ loginForm, setLoginForm, handleAdminLogin, setView, t }) => (
    <div className="min-h-screen admin-login-bg text-white flex flex-col p-6 md:p-20 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#ea281e]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[14vw] md:text-[12vw] font-heading leading-none font-bold mb-10 tracking-tighter fade-up uppercase">Admin<br/><span className="text-[#ea281e]">{t?.future || "Tokko."}</span></h1>
            <div className="max-w-md w-full fade-up" style={{animationDelay: '0.2s'}}>
                <form onSubmit={handleAdminLogin} className="space-y-8 md:space-y-12">
                    <div className="group relative">
                        <label className="block text-[10px] font-mono tracking-widest text-gray-500 mb-2 uppercase font-bold">Nama</label>
                        <input type="text" className="w-full bg-transparent border-b border-gray-800 py-3 font-heading text-2xl outline-none focus:border-[#ea281e] uppercase transition-all" value={loginForm?.user || ""} onChange={e => setLoginForm({...loginForm, user: e.target.value})} />
                    </div>
                    <div className="group relative">
                        <label className="block text-[10px] font-mono tracking-widest text-gray-500 mb-2 uppercase font-bold">Token</label>
                        <input type="password" className="w-full bg-transparent border-b border-gray-800 py-3 font-heading text-2xl outline-none focus:border-[#ea281e] uppercase transition-all" value={loginForm?.pass || ""} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-6">
                        <button type="submit" className="bg-[#ea281e] text-white px-8 py-4 font-heading text-lg uppercase tracking-widest hover:bg-white hover:text-black transition-all font-bold">Masuk</button>
                        <button type="button" onClick={() => setView('landing')} className="text-gray-500 font-mono text-xs underline uppercase font-bold">{t?.logout || "Keluar"}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
);

// ============================================================
// 8. ADMIN DASHBOARD VIEW DENGAN BANNER & POLLING
// ============================================================
const AdminDashboard = ({ 
    activeTab, setActiveTab, globalStatus, setGlobalStatus, catalog, informations, banners, transactions, activities, comments,
    handleSaveCatalog, handleSaveInfo, handleSaveBanner, handleSavePoll, handleSaveTransaction, handleDelete, 
    handleLogout, handleApproveReview, t, polls
}) => {
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const tabs = ['SYSTEM', 'CATALOG', 'NEWS', 'BANNERS', 'POLLS', 'TRANSACTIONS', 'REVIEWS'];
    
    // Forms
    const [catForm, setCatForm] = useState({ name: '', app: '', price: '', desc: '', isBestSeller: false, imageUrl: '' });
    const [infoForm, setInfoForm] = useState({ title: '', content: '', imageUrl: '', isFeatured: false });
    const [banForm, setBanForm] = useState({ title: '', desc: '', imageUrl: '', type: 'image', orientation: 'landscape', link: '' });
    const [pollForm, setPollForm] = useState({ question: '', options: ['', ''], active: true });
    const [trxForm, setTrxForm] = useState({ name: '', app: '', durationDays: '', email: '' });

    const openEdit = (type, data) => {
        setEditingId(data.firebaseId);
        if(type === 'catalog') setCatForm({...data, imageUrl: data.image});
        if(type === 'news') setInfoForm({...data, imageUrl: data.image});
        if(type === 'banner') setBanForm({...data, imageUrl: data.image, link: data.link || ''});
        if(type === 'poll') setPollForm({...data, options: data.options.map(opt => opt.text)});
        if(type === 'trx') setTrxForm(data);
        setIsModalOpen(true);
    };

    const addPollOption = () => {
        setPollForm({...pollForm, options: [...pollForm.options, '']});
    };

    const removePollOption = (index) => {
        if (pollForm.options.length > 2) {
            const newOptions = pollForm.options.filter((_, i) => i !== index);
            setPollForm({...pollForm, options: newOptions});
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row pt-16 md:pt-24">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b-2 border-black z-50 flex justify-between items-center p-4">
                <h2 className="font-heading text-xl uppercase tracking-tighter">Admin Panel</h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 border border-black cursor-hover">
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`md:hidden fixed inset-0 bg-white z-40 pt-16 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 space-y-2 h-full overflow-y-auto">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} className={`w-full text-left font-heading text-lg p-4 border border-black transition-all mb-2 ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:bg-zinc-50'}`}>
                            {tab}
                        </button>
                    ))}
                    <div className="mt-6 pt-6 border-t border-black">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest p-4 border border-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-hover">
                            <LogOut size={14}/> LOGOUT SYSTEM
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay untuk menutup menu mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Sidebar for Desktop */}
            <aside className="hidden md:block w-64 border-r-2 border-black p-8 sticky top-24 h-[calc(100vh-6rem)] shrink-0">
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-2 h-2 bg-[#ea281e] rounded-full"></div>
                    <h2 className="font-heading text-xl uppercase tracking-tighter">Admin Panel</h2>
                </div>
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left font-heading text-lg p-3 border border-black transition-all mb-2 cursor-hover ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:bg-zinc-50'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
                <button onClick={handleLogout} className="mt-20 flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest cursor-hover hover:text-red-800 transition-colors">
                    <LogOut size={14}/> LOGOUT SYSTEM
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:p-16 overflow-y-auto no-scrollbar mt-16 md:mt-0">
                {/* Mobile Tabs Indicator */}
                <div className="md:hidden mb-6">
                    <div className="bg-black text-white p-3 font-heading text-center uppercase tracking-tighter flex justify-between items-center">
                        <span>{activeTab}</span>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1">
                            <ChevronDown size={20} className={`transform transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* 1. SYSTEM */}
                {activeTab === 'SYSTEM' && (
                    <div className="fade-up space-y-10">
                        <h2 className="text-4xl md:text-8xl font-heading tracking-tighter">SYSTEM</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Aktif', 'Perbaikan', 'Mati'].map(s => (
                                <button key={s} onClick={() => setGlobalStatus(s)} className={`p-6 md:p-12 border-2 font-heading text-2xl md:text-4xl transition-all cursor-hover ${globalStatus === s ? 'bg-black text-white border-black' : 'text-zinc-200 border-zinc-100 hover:border-black'}`}>
                                    {s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. CATALOG */}
                {activeTab === 'CATALOG' && (
                    <div className="fade-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 border-b-2 border-black pb-4 gap-4">
                            <h2 className="text-4xl md:text-8xl font-heading tracking-tighter">CATALOG</h2>
                            <button onClick={() => { setEditingId(null); setCatForm({ name: '', app: '', price: '', desc: '', isBestSeller: false, imageUrl: '' }); setIsModalOpen(true); }} className="bg-black text-white px-4 md:px-6 py-2 font-bold uppercase text-xs cursor-hover hover:bg-[#ea281e] transition-colors">
                                ADD NEW
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {(catalog || []).map(item => (
                                <div key={item.firebaseId} className="border-2 border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group bg-white shadow-[4px_4px_0_black]">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 border border-black overflow-hidden shrink-0">
                                            {item.image && <img src={item.image} className="w-full h-full object-cover" alt="prod"/>}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-heading text-lg md:text-3xl uppercase tracking-tighter leading-none line-clamp-1">{item.name}</h3>
                                            <p className="font-mono text-[9px] md:text-xs text-gray-400 uppercase font-bold">{item.app} — {item.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto justify-end">
                                        <button onClick={() => openEdit('catalog', item)} className="p-2 border border-black hover:bg-black transition-colors text-xs md:text-base cursor-hover">
                                            <Pencil size={16}/>
                                        </button>
                                        <button onClick={() => handleDelete('catalog', item.firebaseId)} className="p-2 border border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-colors text-xs md:text-base cursor-hover">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. NEWS */}
                {activeTab === 'NEWS' && (
                    <div className="fade-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 border-b-2 border-black pb-4 gap-4">
                            <h2 className="text-4xl md:text-8xl font-heading tracking-tighter">JOURNAL</h2>
                            <button onClick={() => { setEditingId(null); setInfoForm({ title: '', content: '', imageUrl: '', isFeatured: false }); setIsModalOpen(true); }} className="bg-black text-white px-4 md:px-6 py-2 font-bold uppercase text-xs cursor-hover hover:bg-[#ea281e] transition-colors">
                                NEW POST
                            </button>
                        </div>
                        <div className="space-y-4">
                            {(informations || []).map(info => (
                                <div key={info.firebaseId} className="border-2 border-black p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center group bg-white shadow-[4px_4px_0_black]">
                                    <div className="w-full md:w-20 h-20 border border-zinc-200 overflow-hidden shrink-0">
                                        <img src={info.image} className="w-full h-full object-cover" alt="news"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-heading text-lg md:text-xl uppercase tracking-tighter leading-none line-clamp-1">{info.title}</h3>
                                        <p className="text-[10px] font-mono text-zinc-400 font-bold mt-1 uppercase">{info.date}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto justify-end">
                                        <button onClick={() => openEdit('news', info)} className="p-2 border border-black hover:bg-black transition-colors cursor-hover">
                                            <Pencil size={16}/>
                                        </button>
                                        <button onClick={() => handleDelete('informations', info.firebaseId)} className="p-2 border border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-colors cursor-hover">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. BANNERS */}
                {activeTab === 'BANNERS' && (
                    <div className="fade-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 border-b-2 border-black pb-4 gap-4">
                            <h2 className="text-4xl md:text-8xl font-heading tracking-tighter">BANNERS</h2>
                            <button onClick={() => { setEditingId(null); setBanForm({ title: '', desc: '', imageUrl: '', type: 'image', orientation: 'landscape', link: '' }); setIsModalOpen(true); }} className="bg-black text-white px-4 md:px-6 py-2 font-bold uppercase text-xs cursor-hover hover:bg-[#ea281e] transition-colors">
                                NEW AD
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            {(banners || []).filter(b => b.type !== 'poll').map(b => (
                                <div key={b.firebaseId} className="border-2 border-black p-4 bg-white shadow-[4px_4px_0_black] md:shadow-[6px_6px_0_black] group">
                                    <div className="aspect-video bg-zinc-100 mb-4 overflow-hidden relative border border-black/10">
                                        {b.type === 'video' ? (
                                            <video src={b.image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                        ) : (
                                            <img src={b.image} className="w-full h-full object-cover" alt="Banner"/>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                                            {b.orientation}
                                        </div>
                                        {b.link && (
                                            <div className="absolute bottom-2 right-2 bg-white text-black px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                                                LINK
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                                        <h3 className="font-heading text-lg md:text-2xl truncate uppercase tracking-tighter italic line-clamp-1">
                                            {b.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit('banner', b)} className="p-1.5 border border-black hover:bg-black transition-colors cursor-hover">
                                                <Pencil size={14}/>
                                            </button>
                                            <button onClick={() => handleDelete('banners', b.firebaseId)} className="p-1.5 border border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-colors cursor-hover">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. POLLS */}
                {activeTab === 'POLLS' && (
                    <div className="fade-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 border-b-2 border-black pb-4 gap-4">
                            <h2 className="text-4xl md:text-8xl font-heading tracking-tighter">POLLING</h2>
                            <button onClick={() => { setEditingId(null); setPollForm({ question: '', options: ['', ''], active: true }); setIsModalOpen(true); }} className="bg-black text-white px-4 md:px-6 py-2 font-bold uppercase text-xs cursor-hover hover:bg-[#ea281e] transition-colors">
                                NEW POLL
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(polls || []).map(poll => {
                                const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
                                return (
                                    <div key={poll.firebaseId} className="border-2 border-black p-6 bg-white shadow-[4px_4px_0_black]">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-heading text-xl uppercase tracking-tighter flex-1">{poll.question}</h3>
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase ${poll.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {poll.active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            {poll.options?.map((option, idx) => {
                                                const percentage = totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0;
                                                return (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <span className="text-sm truncate">{option.text}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold">{option.votes || 0} votes</span>
                                                            <span className="text-xs text-gray-500">{percentage}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-xs text-gray-500">
                                                Total: <span className="font-bold">{totalVotes} votes</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit('poll', poll)} className="p-1.5 border border-black hover:bg-black transition-colors cursor-hover">
                                                    <Pencil size={14}/>
                                                </button>
                                                <button onClick={() => handleDelete('polls', poll.firebaseId)} className="p-1.5 border border-[#ea281e] text-[#ea281e] hover:bg-[#ea281e] hover:text-white transition-colors cursor-hover">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 6. TRANSACTIONS */}
                {activeTab === 'TRANSACTIONS' && (
                    <div className="fade-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 border-b-2 border-black pb-4 gap-4">
                            <h2 className="text-4xl md:text-8xl font-heading tracking-tighter">LOGBOOK</h2>
                            <button onClick={() => { setEditingId(null); setTrxForm({ name: '', app: '', durationDays: '', email: '' }); setIsModalOpen(true); }} className="bg-black text-white px-4 md:px-6 py-2 font-bold uppercase text-xs cursor-hover hover:bg-[#ea281e] transition-colors">
                                NEW ENTRY
                            </button>
                        </div>
                        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0_black] md:shadow-[6px_6px_0_black]">
                            <table className="w-full text-left font-mono text-xs uppercase font-bold min-w-[600px]">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="p-4 tracking-tighter">CLIENT</th>
                                        <th className="p-4">PLATFORM</th>
                                        <th className="p-4">REMAINING</th>
                                        <th className="p-4 text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {(transactions || []).map(t => (
                                        <tr key={t.firebaseId} className="hover:bg-zinc-50 transition-colors">
                                            <td className="p-4">
                                                <div className="text-sm font-black tracking-tighter">{t.name}</div>
                                                <div className="text-[9px] text-zinc-400 font-normal italic tracking-tight">{t.email}</div>
                                            </td>
                                            <td className="p-4 tracking-widest">{t.app}</td>
                                            <td className="p-4 font-heading text-lg"><TimeDisplay targetDate={t.targetDate} status={t.status}/></td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => openEdit('trx', t)} className="text-blue-600 hover:scale-110 transition-transform cursor-hover">
                                                        <Pencil size={16}/>
                                                    </button>
                                                    <button onClick={() => handleDelete('transactions', t.firebaseId)} className="text-[#ea281e] hover:scale-110 transition-transform cursor-hover">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 7. REVIEWS */}
                {activeTab === 'REVIEWS' && (
                  <div className="fade-up">
                    <h2 className="text-4xl md:text-8xl font-heading mb-6 md:mb-10 tracking-tighter border-b-2 border-black pb-4">FEEDBACK</h2>
                    <div className="space-y-6">
                      {(comments || []).filter(c => c.status === 'pending').map(c => (
                        <div key={c.firebaseId} className="border-2 border-orange-500 bg-orange-50 p-4 md:p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 shadow-[4px_4px_0_#f97316] md:shadow-[6px_6px_0_#f97316]">
                          <div className="flex-1 w-full uppercase font-bold">
                            <div className="flex items-center gap-3 mb-2 text-[10px] tracking-widest">
                              <span className="truncate max-w-[200px]">{c.email}</span>
                              <span className="bg-orange-500 text-white px-2 py-0.5">{c.role}</span>
                            </div>
                            <p className="text-lg md:text-xl lg:text-2xl font-serif leading-tight italic">"{c.text}"</p>
                          </div>
                          <div className="flex gap-3 w-full md:w-auto">
                            <button onClick={() => handleApproveReview(c.firebaseId)} className="flex-1 bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 font-bold uppercase text-[10px] border border-black shadow-[2px_2px_0_black] md:shadow-[4px_4px_0_black] hover:bg-green-700 transition-colors cursor-hover">
                              APPROVE
                            </button>
                            <button onClick={() => handleDelete('comments', c.firebaseId)} className="flex-1 bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 font-bold uppercase text-[10px] border border-black shadow-[2px_2px_0_black] md:shadow-[4px_4px_0_black] hover:bg-red-700 transition-colors cursor-hover">
                              REJECT
                            </button>
                          </div>
                        </div>
                      ))}
                      {(comments || []).filter(c => c.status === 'pending').length === 0 && (
                        <div className="text-center py-10 md:py-20 uppercase font-heading text-zinc-300 text-xl md:text-3xl">
                          Inbox is Clean
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </main>

            {/* SHARED MODAL PANEL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`MGMT: ${activeTab}`}>
                {activeTab === 'CATALOG' && (
                    <div className="space-y-6">
                        <input placeholder="PRODUCT NAME" className="w-full border-b-2 border-black py-3 outline-none font-heading text-xl md:text-2xl uppercase" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="PLATFORM" className="w-full border-b border-zinc-100 py-3 outline-none uppercase font-bold text-[10px]" value={catForm.app} onChange={e => setCatForm({...catForm, app: e.target.value})}/>
                            <input placeholder="PRICE" className="w-full border-b border-zinc-100 py-3 outline-none uppercase font-bold text-[10px]" value={catForm.price} onChange={e => setCatForm({...catForm, price: e.target.value})}/>
                        </div>
                        <input placeholder="IMAGE URL" className="w-full border-b-2 border-black py-3 outline-none font-mono text-xs" value={catForm.imageUrl} onChange={e => setCatForm({...catForm, imageUrl: e.target.value})}/>
                        <textarea placeholder="DESC" className="w-full h-32 border border-zinc-100 p-3 font-mono text-xs uppercase" value={catForm.desc} onChange={e => setCatForm({...catForm, desc: e.target.value})}/>
                        <label className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
                            <input type="checkbox" checked={catForm.isBestSeller} onChange={e => setCatForm({...catForm, isBestSeller: e.target.checked})}/> 
                            SHOWCASE ON HOME
                        </label>
                        <button onClick={async () => { await handleSaveCatalog(catForm, editingId); setIsModalOpen(false); }} className="w-full bg-black text-white py-4 md:py-5 font-bold uppercase tracking-widest hover:bg-[#ea281e] transition-colors cursor-hover">
                            COMMIT CHANGES
                        </button>
                    </div>
                )}
                {activeTab === 'NEWS' && (
                    <div className="space-y-6">
                        <input placeholder="TITLE" className="w-full border-b-2 border-black py-3 outline-none font-heading text-xl md:text-2xl uppercase" value={infoForm.title} onChange={e => setInfoForm({...infoForm, title: e.target.value})}/>
                        <input placeholder="IMAGE URL" className="w-full border-b-2 border-black py-3 outline-none font-mono text-xs" value={infoForm.imageUrl} onChange={e => setInfoForm({...infoForm, imageUrl: e.target.value})}/>
                        <textarea placeholder="CONTENT" className="w-full h-48 border border-zinc-100 p-3 font-mono text-xs uppercase" value={infoForm.content} onChange={e => setInfoForm({...infoForm, content: e.target.value})}/>
                        <button onClick={async () => { await handleSaveInfo(infoForm, editingId); setIsModalOpen(false); }} className="w-full bg-black text-white py-4 md:py-5 font-bold uppercase tracking-widest cursor-hover hover:bg-[#ea281e] transition-colors">
                            DEPLOY POST
                        </button>
                    </div>
                )}
                {activeTab === 'BANNERS' && (
                    <div className="space-y-6">
                        <input placeholder="CAMPAIGN NAME" className="w-full border-b-2 border-black py-3 outline-none font-heading text-xl md:text-2xl uppercase" value={banForm.title} onChange={e => setBanForm({...banForm, title: e.target.value})}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select className="p-3 border border-black font-bold uppercase text-[10px]" value={banForm.type} onChange={e => setBanForm({...banForm, type: e.target.value})}>
                                <option value="image">IMAGE</option>
                                <option value="video">VIDEO</option>
                            </select>
                            <select className="p-3 border border-black font-bold uppercase text-[10px]" value={banForm.orientation} onChange={e => setBanForm({...banForm, orientation: e.target.value})}>
                                <option value="landscape">LANDSCAPE</option>
                                <option value="portrait">PORTRAIT</option>
                            </select>
                        </div>
                        <input placeholder="IMAGE/VIDEO URL" className="w-full border-b-2 border-black py-3 outline-none font-mono text-xs" value={banForm.imageUrl} onChange={e => setBanForm({...banForm, imageUrl: e.target.value})}/>
                        <input placeholder="LINK (optional) e.g. https://example.com" className="w-full border-b-2 border-black py-3 outline-none font-mono text-xs" value={banForm.link} onChange={e => setBanForm({...banForm, link: e.target.value})}/>
                        <button onClick={async () => { const s = await handleSaveBanner(banForm, editingId); if(s) setIsModalOpen(false); }} className="w-full bg-black text-white py-4 md:py-5 font-bold uppercase tracking-widest cursor-hover hover:bg-[#ea281e] transition-colors">
                            LAUNCH AD
                        </button>
                    </div>
                )}
                {activeTab === 'POLLS' && (
                    <div className="space-y-6">
                        <input placeholder="POLL QUESTION" className="w-full border-b-2 border-black py-3 outline-none font-heading text-xl md:text-2xl uppercase" value={pollForm.question} onChange={e => setPollForm({...pollForm, question: e.target.value})}/>
                        
                        <div className="space-y-4">
                            <div className="text-sm font-bold uppercase">Poll Options</div>
                            {pollForm.options.map((option, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder={`Option ${index + 1}`}
                                        className="flex-1 border-b border-zinc-300 py-2 outline-none"
                                        value={option}
                                        onChange={e => {
                                            const newOptions = [...pollForm.options];
                                            newOptions[index] = e.target.value;
                                            setPollForm({...pollForm, options: newOptions});
                                        }}
                                    />
                                    {pollForm.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removePollOption(index)}
                                            className="text-red-500 cursor-hover"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addPollOption}
                                className="text-sm text-blue-500 cursor-hover"
                            >
                                + Add Option
                            </button>
                        </div>
                        
                        <label className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest cursor-pointer">
                            <input type="checkbox" checked={pollForm.active} onChange={e => setPollForm({...pollForm, active: e.target.checked})}/> 
                            ACTIVE POLL
                        </label>
                        
                        <button onClick={async () => { await handleSavePoll(pollForm, editingId); setIsModalOpen(false); }} className="w-full bg-black text-white py-4 md:py-5 font-bold uppercase tracking-widest hover:bg-[#ea281e] transition-colors cursor-hover">
                            {editingId ? 'UPDATE POLL' : 'CREATE POLL'}
                        </button>
                    </div>
                )}
                {activeTab === 'TRANSACTIONS' && (
                    <div className="space-y-6">
                        <input placeholder="CLIENT NAME" className="w-full border-b-2 border-black py-3 outline-none font-heading text-xl md:text-2xl uppercase" value={trxForm.name} onChange={e => setTrxForm({...trxForm, name: e.target.value})}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="APP / PLATFORM" className="w-full border-b border-zinc-100 py-3 outline-none font-bold text-[10px] uppercase" value={trxForm.app} onChange={e => setTrxForm({...trxForm, app: e.target.value})}/>
                            <input type="number" placeholder="DAYS (DURASI)" className="w-full border-b border-zinc-100 py-3 outline-none font-bold text-[10px] uppercase" value={trxForm.durationDays} onChange={e => setTrxForm({...trxForm, durationDays: e.target.value})}/>
                        </div>
                        <input placeholder="USER EMAIL" className="w-full border-b border-zinc-100 py-3 outline-none font-mono text-[10px] font-bold" value={trxForm.email} onChange={e => setTrxForm({...trxForm, email: e.target.value})}/>
                        <button onClick={async () => { await handleSaveTransaction(trxForm, editingId); setIsModalOpen(false); }} className="w-full bg-black text-white py-4 md:py-5 font-bold uppercase tracking-widest cursor-hover hover:bg-[#ea281e] transition-colors">
                            COMMIT DATA
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ============================================================
// 9. MAIN APP COMPONENT (ROOT)
// ============================================================
export default function App() {
  const [view, setView] = useState('landing');
  const [lang, setLang] = useState('id');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminTab, setAdminTab] = useState('SYSTEM');
  
  // Database States
  const [globalStatus, setGlobalStatus] = useState('...');
  const [catalog, setCatalog] = useState([]);
  const [informations, setInformations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [polls, setPolls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [commentEmail, setCommentEmail] = useState('');
  const [reviewType, setReviewType] = useState(null); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  const t = translations[lang];

  useEffect(() => {
    onAuthStateChanged(auth, (u) => { 
      if(!u) signInAnonymously(auth); 
      else subscribeData(); 
    });
  }, []);

  const subscribeData = () => {
    onSnapshot(doc(db, "settings", "global_status"), (d) => setGlobalStatus(d.exists() ? d.data().status : 'Aktif'));
    onSnapshot(query(collection(db, "catalog"), orderBy("id", "desc")), (s) => setCatalog(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
    onSnapshot(query(collection(db, "informations"), orderBy("id", "desc")), (s) => setInformations(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
    onSnapshot(query(collection(db, "transactions"), orderBy("id", "desc")), (s) => setTransactions(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
    onSnapshot(query(collection(db, "banners"), orderBy("id", "desc")), (s) => setBanners(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
    onSnapshot(query(collection(db, "polls"), orderBy("createdAt", "desc")), (s) => setPolls(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
    onSnapshot(query(collection(db, "activities"), orderBy("id", "desc")), (s) => setActivities(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
    onSnapshot(query(collection(db, "comments"), orderBy("timestamp", "desc")), (s) => setComments(s.docs.map(d => ({...d.data(), firebaseId: d.id}))));
  };

  const handleVerifyEmail = async () => {
      if(!commentEmail) return;
      setIsVerifying(true);
      try {
        const q = query(collection(db, "transactions"), where("email", "==", commentEmail.toLowerCase()));
        const snap = await getDocs(q);
        if(!snap.empty) setReviewType('customer');
        else alert("Email tidak terdaftar.");
      } catch(e) { console.error(e); }
      setIsVerifying(false);
  };

  const handlePostComment = async () => {
      if(!commentText) return;
      await addDoc(collection(db, "comments"), {
          email: commentEmail || "Guest",
          text: commentText,
          rating: commentRating,
          role: reviewType || "guest",
          status: reviewType === 'customer' ? 'approved' : 'pending',
          timestamp: Date.now(),
          date: new Date().toLocaleString('id-ID')
      });
      alert(reviewType === 'customer' ? "Ulasan tayang!" : "Menunggu Approval Admin.");
      setCommentText(''); 
      setReviewType(null); 
      setCommentEmail('');
  };

  const handleApproveReview = async (id) => { 
    await updateDoc(doc(db, "comments", id), { status: 'approved' }); 
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      const pollRef = doc(db, "polls", pollId);
      const optionPath = `options.${optionIndex}.votes`;
      
      await updateDoc(pollRef, {
        [optionPath]: increment(1),
        totalVotes: increment(1)
      });
      
      alert("Vote berhasil!");
      return true;
    } catch (error) {
      console.error("Error voting:", error);
      alert("Gagal melakukan vote.");
      return false;
    }
  };

  const handleSaveCatalog = async (data, editId) => {
    const payload = { 
      ...data, 
      image: data.imageUrl || '', 
      id: editId ? data.id : Date.now(),
      name: data.name || '',
      app: data.app || '',
      price: data.price || '',
      desc: data.desc || '',
      isBestSeller: data.isBestSeller || false
    };
    if(editId) await updateDoc(doc(db, "catalog", editId), payload);
    else await addDoc(collection(db, "catalog"), payload);
  };

  const handleSaveInfo = async (data, editId) => {
    const payload = {
      title: data.title || "Untitled",
      content: data.content || "",
      image: data.imageUrl || "",
      date: new Date().toLocaleString('id-ID'),
      id: editId ? data.id : Date.now(),
      isFeatured: data.isFeatured || false
    };
    if(editId) await updateDoc(doc(db, "informations", editId), payload);
    else await addDoc(collection(db, "informations"), payload);
  };

  const handleSaveBanner = async (data, editId) => {
    try {
      const payload = { 
        title: data.title || "Untitled", 
        image: data.imageUrl || '', 
        type: data.type || 'image', 
        orientation: data.orientation || 'landscape', 
        link: data.link || '',
        id: editId ? data.id : Date.now() 
      };
      if(editId) await updateDoc(doc(db, "banners", editId), payload);
      else await addDoc(collection(db, "banners"), payload);
      return true;
    } catch(e) { 
      console.error("Error saving banner:", e); 
      alert("Gagal menyimpan banner: " + e.message);
      return false; 
    }
  };

  const handleSavePoll = async (data, editId) => {
    try {
      const optionsWithVotes = data.options.map(option => ({
        text: option,
        votes: 0
      }));
      
      const payload = {
        question: data.question || "Untitled Poll",
        options: optionsWithVotes,
        active: data.active || true,
        totalVotes: 0,
        createdAt: new Date(),
        id: editId ? data.id : Date.now()
      };
      
      if(editId) await updateDoc(doc(db, "polls", editId), payload);
      else await addDoc(collection(db, "polls"), payload);
      return true;
    } catch(e) { 
      console.error("Error saving poll:", e); 
      alert("Gagal menyimpan poll: " + e.message);
      return false; 
    }
  };

  const handleSaveTransaction = async (data, editId) => {
    let payload = { 
      name: data.name || '', 
      app: data.app || '', 
      email: data.email.toLowerCase() || '', 
      status: 'Aktif' 
    };
    if(data.durationDays) {
        const tDate = new Date(); 
        tDate.setDate(tDate.getDate() + parseInt(data.durationDays));
        payload.targetDate = tDate;
    }
    payload.id = editId ? data.id : Date.now();
    
    if(editId) await updateDoc(doc(db, "transactions", editId), payload);
    else await addDoc(collection(db, "transactions"), payload);
  };

  const handleDelete = async (coll, id) => {
    if(window.confirm("Hapus Permanen?")) {
      try {
        await deleteDoc(doc(db, coll, id));
        alert("Data berhasil dihapus");
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Gagal menghapus data");
      }
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setView('landing');
  };

  return (
    <div className="antialiased select-none">
        <style>{globalStyles}</style>
        <CustomCursor />
        <MusicPlayer />
        
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} setView={setView} lang={lang} setLang={setLang} t={t} />
        
        <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`}>
            <nav className="flex flex-col items-start px-4 md:px-12">
                <button onClick={() => {setView('landing'); setIsMenuOpen(false);}} className="menu-link">{t?.home || "HOME"}</button>
                <button onClick={() => {setView('store'); setIsMenuOpen(false);}} className="menu-link">{t?.store || "STORE"}</button>
                <button onClick={() => {setView('admin'); setIsMenuOpen(false);}} className="menu-link uppercase">ADMIN</button>
            </nav>
        </div>

        {view === 'landing' && <LandingPage setView={setView} catalog={catalog} t={t} />}
        {view === 'store' && (
            <StorePage 
              globalStatus={globalStatus} catalog={catalog} informations={informations} activities={activities} 
              transactions={transactions} banners={banners} comments={comments} searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} handleVerifyEmail={handleVerifyEmail} isEmailVerified={!!reviewType}
              commentEmail={commentEmail} setCommentEmail={setCommentEmail} handlePostComment={handlePostComment}
              commentText={commentText} setCommentText={setCommentText} commentRating={commentRating} setCommentRating={setCommentRating}
              t={t} isVerifying={isVerifying} setReviewType={setReviewType} reviewType={reviewType}
              polls={polls} handleVote={handleVote}
            />
        )}
        
        {view === 'admin' && !isAdminLoggedIn && (
            <AdminLoginView loginForm={loginForm} setLoginForm={setLoginForm} handleAdminLogin={(e) => {
                e.preventDefault();
                if(loginForm.user === 'Bagas' && loginForm.pass === '51512') {
                  setIsAdminLoggedIn(true);
                  setAdminTab('SYSTEM');
                } else {
                  alert("Akses Ditolak: Data Tidak Valid");
                }
            }} setView={setView} t={t} />
        )}

        {view === 'admin' && isAdminLoggedIn && (
            <AdminDashboard 
                activeTab={adminTab} 
                setActiveTab={setAdminTab} 
                t={t}
                globalStatus={globalStatus} 
                setGlobalStatus={(s) => setDoc(doc(db, "settings", "global_status"), { status: s })}
                catalog={catalog} 
                informations={informations} 
                banners={banners} 
                transactions={transactions} 
                activities={activities} 
                comments={comments}
                polls={polls}
                handleSaveCatalog={handleSaveCatalog} 
                handleSaveInfo={handleSaveInfo} 
                handleSaveBanner={handleSaveBanner} 
                handleSavePoll={handleSavePoll}
                handleSaveTransaction={handleSaveTransaction}
                handleDelete={handleDelete}
                handleApproveReview={handleApproveReview} 
                handleLogout={handleLogout}
            />
        )}
    </div>
  );
}