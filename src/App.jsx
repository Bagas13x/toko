import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, setDoc, deleteField, where, getDocs
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Layout, List, Users, Activity, ExternalLink, Menu, X, Check, 
  AlertTriangle, XCircle, ShoppingBag, Eye, Plus, FileText, 
  Trash2, Lock, LogOut, Phone, PauseCircle, Upload, Loader2, 
  Bell, MessageSquare, Send, CheckCircle2, Image as ImageIcon, 
  Pencil, AlertCircle, Search, Star, MapPin, Instagram, LayoutTemplate, Camera
} from 'lucide-react';

// --- KONFIGURASI DATABASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDep19oGqL8o0_LUZNbhLuRgCgyeLHdYQM",
  authDomain: "toko-19d24.firebaseapp.com",
  projectId: "toko-19d24",
  storageBucket: "toko-19d24.firebasestorage.app",
  messagingSenderId: "409041876870",
  appId: "1:409041876870:web:1aab7a9b842f8b14801e07",
  measurementId: "G-9LKCM0DD6H"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- CSS ---
const customStyles = `
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 25s linear infinite; }
  .reveal-hidden { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
  .reveal-visible { opacity: 1; transform: translateY(0); }
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
  .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hover-lift:hover { transform: translateY(-4px); box-shadow: 6px 6px 0px 0px rgba(0,0,0,1); }
`;

// --- COMPONENT: BANNER CAROUSEL ---
const BannerCarousel = ({ data }) => {
    const [current, setCurrent] = useState(0);
    const banners = data && data.length > 0 ? data : [
        { id: 1, title: "SELAMAT DATANG", desc: "Temukan Produk Digital Terbaik", image: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80" },
        { id: 2, title: "HARGA TERJANGKAU", desc: "Kualitas Premium Harga Teman", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80" }
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrent((prev) => (prev + 1) % banners.length), 3000);
        return () => clearInterval(timer);
    }, [banners.length]);

    return (
        <div className="relative w-full h-48 md:h-72 bg-gray-200 overflow-hidden border-2 border-black mt-6 group">
            {banners.map((banner, idx) => (
                <div key={banner.id || idx} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <span className="bg-white text-black px-3 py-1 text-xs md:text-sm font-black w-fit mb-2 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">{banner.title}</span>
                        <h2 className="text-white text-2xl md:text-4xl font-black italic tracking-tighter drop-shadow-lg">{banner.desc}</h2>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-4 right-6 flex gap-2">
                {banners.map((_, idx) => (
                    <div key={idx} className={`h-1.5 transition-all duration-500 rounded-full shadow-sm ${idx === current ? 'bg-white w-8' : 'bg-white/40 w-2'}`} />
                ))}
            </div>
        </div>
    );
};

// --- UTILITY COMPONENTS ---
const NotificationToast = ({ notification, onClose }) => {
  if (!notification) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] animate-bounce-in">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex items-center gap-3 max-w-sm">
        <div className="bg-black text-white p-2 rounded-full"><Bell size={20} /></div>
        <div><h4 className="font-bold text-sm font-serif uppercase tracking-wider">{notification.title}</h4><p className="text-xs text-gray-600 line-clamp-1">{notification.message}</p></div>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-black"><X size={16} /></button>
      </div>
    </div>
  );
};

const CustomAlert = ({ data, onClose }) => {
    if (!data) return null;
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
         <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm text-center relative">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 border-2 border-black text-black"><AlertCircle size={24} /></div>
            <h3 className="font-serif font-bold text-xl mb-2">{data.title}</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed font-sans">{data.message}</p>
            {data.type === 'product_not_found' ? (
                <a href="https://wa.me/6281319865384" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-8 py-3 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors w-full flex items-center justify-center gap-2" onClick={onClose}><Phone size={14} /> Hubungi Ketua</a>
            ) : (
                <button onClick={onClose} className="bg-black text-white px-8 py-2 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors w-full">Siap, Mengerti!</button>
            )}
         </div>
      </div>
    )
}

const TimeDisplay = ({ targetDate, status }) => {
  const [timeLeft, setTimeLeft] = useState("...");
  useEffect(() => {
    if (status !== 'Aktif') { setTimeLeft("TERHENTI"); return; }
    if (!targetDate) return;
    const target = targetDate.seconds ? new Date(targetDate.seconds * 1000) : new Date(targetDate);
    const calculate = () => {
      const now = new Date(); const difference = +target - +now;
      if (difference <= 0) { setTimeLeft("HABIS"); return; }
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${d}d ${h}j ${m}m ${s}d`);
    };
    calculate(); const timer = setInterval(calculate, 1000); return () => clearInterval(timer);
  }, [targetDate, status]);
  if (status !== 'Aktif') return <span className="inline-flex items-center gap-1 font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded text-[10px]"><PauseCircle size={10} /> STOP</span>;
  return <span className={`font-mono font-medium tracking-tight text-xs ${timeLeft === 'HABIS' ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{timeLeft}</span>;
};

const StatusBadge = ({ status }) => {
  let styles = "";
  switch (status) {
    case "Aktif": styles = "bg-green-100 text-green-800 border-green-300"; break;
    case "Perbaikan": styles = "bg-yellow-100 text-yellow-800 border-yellow-300"; break;
    case "Mati": styles = "bg-gray-100 text-gray-600 border-gray-300"; break;
    default: styles = "bg-blue-100 text-blue-800 border-blue-300";
  }
  return <span className={`inline-block px-2 py-0.5 text-[10px] font-serif uppercase tracking-widest border ${styles}`}>{status}</span>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50 sticky top-0 z-10">
          <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-black">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white rounded-none transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- HOOKS ---
const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('reveal-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-hidden').forEach(el => observer.observe(el));
    return () => document.querySelectorAll('.reveal-hidden').forEach(el => observer.unobserve(el));
  }); 
};

// --- APP UTAMA ---

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [view, setView] = useState('public'); 
  const [activeTab, setActiveTab] = useState('dasbor');
  const [publicTab, setPublicTab] = useState('beranda'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPublicMenuOpen, setIsPublicMenuOpen] = useState(false); 

  // Data
  const [globalStatus, setGlobalStatus] = useState('...');
  const [informations, setInformations] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [activities, setActivities] = useState([]);
  const [customerNumbers, setCustomerNumbers] = useState([]);

  // Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [customAlert, setCustomAlert] = useState(null); 
  const [editingId, setEditingId] = useState(null);
  
  // Modals
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false); 
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Forms
  const [newInfo, setNewInfo] = useState({ title: '', content: '', imageUrl: '', isFeatured: false });
  const [newProduct, setNewProduct] = useState({ name: '', app: '', price: '', desc: '', isBestSeller: false });
  const [newTransaction, setNewTransaction] = useState({ name: '', app: '', durationDays: '', phone: '', email: '', bonus: '' });
  const [newBanner, setNewBanner] = useState({ title: '', desc: '', imageUrl: '' }); 
  const [newActivity, setNewActivity] = useState({ caption: '', desc: '', imageUrl: '' });

  const [isUploading, setIsUploading] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [selectedBroadcastInfoId, setSelectedBroadcastInfoId] = useState(null);

  // Comment System
  const [commentEmail, setCommentEmail] = useState('');
  const [isCustomerVerified, setIsCustomerVerified] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useScrollAnimation();

  const triggerNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (error) { console.error("Auth Error:", error); } };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) subscribeToData();
    });
    return () => unsubscribeAuth();
  }, []);

  const subscribeToData = () => {
    onSnapshot(doc(db, "settings", "global_status"), (doc) => {
      if (doc.exists()) setGlobalStatus(doc.data().status); else setDoc(doc.ref, { status: "Aktif" });
      setIsLoading(false);
    });
    onSnapshot(query(collection(db, "catalog"), orderBy("id", "desc")), (snap) => setCatalog(snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }))));
    onSnapshot(query(collection(db, "informations"), orderBy("id", "desc")), (snap) => setInformations(snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }))));
    onSnapshot(query(collection(db, "transactions"), orderBy("id", "desc")), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }));
      setTransactions(data);
      setCustomerNumbers([...new Set(data.map(t => t.phone).filter(p => p && p.length > 5))]);
    });
    onSnapshot(query(collection(db, "comments"), orderBy("timestamp", "desc")), (snap) => setComments(snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }))));
    onSnapshot(query(collection(db, "banners"), orderBy("id", "desc")), (snap) => setBanners(snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }))));
    onSnapshot(query(collection(db, "activities"), orderBy("id", "desc")), (snap) => setActivities(snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }))));
  };

  // --- HANDLERS (LOGIC) ---
  const updateGlobalStatus = async (status) => { await setDoc(doc(db, "settings", "global_status"), { status }); };
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'Bagas' && loginForm.password === '51512') { setIsAdminLoggedIn(true); setLoginError(''); setView('admin'); } else { setLoginError('Bukan Ketua? Pergi deh'); }
  };
  const handleLogout = () => { setIsAdminLoggedIn(false); setLoginForm({ username: '', password: '' }); setView('public'); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = catalog.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.app.toLowerCase().includes(searchQuery.toLowerCase()));
    if (results.length > 0) setPublicTab('produk'); else setCustomAlert({ title: "Produk Kosong", message: "Yah sepertinya produk belum ditambah, lebih baiknya kamu hubungi Ketua", type: 'product_not_found' });
  };
  
  const handleImageFile = (e, setter, currentData) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) { setCustomAlert({ title: "Gagal Upload", message: "Ukuran gambar terlalu besar! Maksimal 800KB." }); return; }
      setIsUploading(true);
      const r = new FileReader();
      r.onloadend = () => { setter({ ...currentData, imageUrl: r.result }); setIsUploading(false); };
      r.readAsDataURL(file);
    }
  };

  // --- CRUD HELPERS ---
  const handleToggleFeaturedInfo = async (info) => {
     const batchUpdate = informations.filter(i => i.isFeatured && i.firebaseId !== info.firebaseId);
     batchUpdate.forEach(i => updateDoc(doc(db, "informations", i.firebaseId), { isFeatured: false }));
     await updateDoc(doc(db, "informations", info.firebaseId), { isFeatured: !info.isFeatured });
  }
  const handleSaveInfo = async () => {
    if(!newInfo.title) return;
    const data = { title: newInfo.title, content: newInfo.content, image: newInfo.imageUrl || "https://placehold.co/600x400/png?text=No+Image", isFeatured: newInfo.isFeatured || false, ...(editingId ? {} : { id: Date.now(), date: new Date().toLocaleDateString('id-ID') }) };
    if (editingId) await updateDoc(doc(db, "informations", editingId), data); else await addDoc(collection(db, "informations"), data);
    setNewInfo({ title: '', content: '', imageUrl: '' }); setIsInfoModalOpen(false); setEditingId(null);
  };
  const handleDeleteInfo = async (id) => { if(window.confirm("Hapus?")) await deleteDoc(doc(db, "informations", id)); };

  const handleToggleBestSeller = async (item) => { await updateDoc(doc(db, "catalog", item.firebaseId), { isBestSeller: !item.isBestSeller }); }
  const handleSaveProduct = async () => {
    if(!newProduct.name) return;
    if (editingId) await updateDoc(doc(db, "catalog", editingId), newProduct); else await addDoc(collection(db, "catalog"), { ...newProduct, id: Date.now() });
    setNewProduct({ name: '', app: '', price: '', desc: '' }); setIsCatalogModalOpen(false); setEditingId(null);
  };
  const handleDeleteProduct = async (id) => { if(window.confirm("Hapus?")) await deleteDoc(doc(db, "catalog", id)); };

  // NEW: BANNER CRUD
  const handleSaveBanner = async () => {
      if(!newBanner.title) return;
      const data = { title: newBanner.title, desc: newBanner.desc, image: newBanner.imageUrl, ...(editingId ? {} : { id: Date.now() }) };
      if (editingId) await updateDoc(doc(db, "banners", editingId), data); else await addDoc(collection(db, "banners"), data);
      setNewBanner({ title: '', desc: '', imageUrl: '' }); setIsBannerModalOpen(false); setEditingId(null);
  }
  const handleDeleteBanner = async (id) => { if(window.confirm("Hapus Banner?")) await deleteDoc(doc(db, "banners", id)); };

  const handleSaveActivity = async () => {
      if(!newActivity.caption) return;
      const data = { caption: newActivity.caption, desc: newActivity.desc, image: newActivity.imageUrl, ...(editingId ? {} : { id: Date.now(), date: new Date().toLocaleDateString('id-ID') }) };
      if (editingId) await updateDoc(doc(db, "activities", editingId), data); else await addDoc(collection(db, "activities"), data);
      setNewActivity({ caption: '', desc: '', imageUrl: '' }); setIsActivityModalOpen(false); setEditingId(null);
  }
  const handleDeleteActivity = async (id) => { if(window.confirm("Hapus?")) await deleteDoc(doc(db, "activities", id)); };

  const handleSaveTransaction = async () => {
    if (!newTransaction.name) return;
    let data = { name: newTransaction.name, app: newTransaction.app, phone: newTransaction.phone, email: newTransaction.email, bonus: newTransaction.bonus };
    if (newTransaction.durationDays) { const t = new Date(); t.setDate(t.getDate() + parseInt(newTransaction.durationDays)); data.targetDate = t; data.status = 'Aktif'; }
    if (editingId) await updateDoc(doc(db, "transactions", editingId), data); else await addDoc(collection(db, "transactions"), { ...data, id: Date.now(), status: 'Aktif' });
    setNewTransaction({ name: '', app: '', durationDays: '', phone: '', email: '', bonus: '' }); setIsTransactionModalOpen(false); setEditingId(null);
  };
  const handleStatusChange = async (t, newStatus) => {
    const ref = doc(db, "transactions", t.firebaseId);
    if (newStatus === 'Aktif' && t.status !== 'Aktif' && t.frozenRemaining) { const nt = new Date(Date.now() + t.frozenRemaining); await updateDoc(ref, { status: 'Aktif', targetDate: nt, frozenRemaining: deleteField() }); } 
    else if (newStatus !== 'Aktif' && t.status === 'Aktif') { const ct = t.targetDate.seconds ? new Date(t.targetDate.seconds * 1000) : new Date(t.targetDate); const rem = ct.getTime() - Date.now(); await updateDoc(ref, { status: newStatus, frozenRemaining: rem > 0 ? rem : 0 }); } 
    else await updateDoc(ref, { status: newStatus });
  };
  const handleDeleteTransaction = async (id) => { if(window.confirm("Hapus?")) await deleteDoc(doc(db, "transactions", id)); };

  const handleSelectInfoForBroadcast = (info) => { setSelectedBroadcastInfoId(info.id); setBroadcastMsg(`*${info.title.toUpperCase()}*\n\n${info.content}\n\n----------------\n\nAkses Katalog Lengkap:\nhttps://toko-dun.vercel.app/`); };
  const sendBroadcast = (phone) => { if (!phone) return; let p = phone.replace(/\D/g, ''); if (p.startsWith('0')) p = '62' + p.slice(1); window.open(`https://wa.me/${p}?text=${encodeURIComponent(broadcastMsg || "Halo kak! Cek katalog kami: https://toko-dun.vercel.app/")}`, '_blank'); };
  
  const handleVerifyCustomer = async () => {
    if (!commentEmail) { setCustomAlert({ title: "Email Kosong", message: "Tolong isi email kamu dulu ya!" }); return; }
    setIsCheckingEmail(true);
    const q = query(collection(db, "transactions"), where("email", "==", commentEmail));
    const snap = await getDocs(q);
    if (!snap.empty) { setIsCustomerVerified(true); triggerNotification("Berhasil", "Kamu terdaftar sebagai pelanggan!"); } 
    else { setCustomAlert({ title: "Ups, Maaf!", message: "Bukan langganan Toko, langganan dulu dong supaya bisa komen ~" }); setIsCustomerVerified(false); }
    setIsCheckingEmail(false);
  };
  const handlePostComment = async () => { if (!commentText) return; await addDoc(collection(db, "comments"), { email: commentEmail, text: commentText, image: commentImage, timestamp: Date.now(), date: new Date().toLocaleString() }); setCommentText(''); setCommentImage(''); setCustomAlert({ title: "Terima Kasih", message: "Komentar kamu berhasil dikirim!" }); };

  const filteredCatalog = catalog.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.app.toLowerCase().includes(searchQuery.toLowerCase()));
  const featuredInfo = informations.find(i => i.isFeatured);
  const bestSellers = catalog.filter(i => i.isBestSeller);

  // --- RENDERING ---

  if (isLoading) return <div className="min-h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-serif text-sm tracking-widest uppercase">Sebentar ketua...</p></div>;

  if (view === 'admin' && !isAdminLoggedIn) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-serif text-black">
        <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="text-center mb-8"><div className="w-16 h-16 bg-black text-white mx-auto flex items-center justify-center mb-4"><Lock size={32} /></div><h1 className="text-2xl font-bold uppercase tracking-widest">Ketua Only</h1></div>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div><label className="block text-sm font-bold mb-2">Username</label><input type="text" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} /></div>
            <div><label className="block text-sm font-bold mb-2">Password</label><input type="password" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} /></div>
            {loginError && <div className="bg-red-50 text-red-600 text-sm p-3 border border-red-200 text-center font-bold">{loginError}</div>}
            <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800">Masuk</button>
          </form>
          <div className="mt-8 text-center pt-6 border-t border-gray-200"><button onClick={() => setView('public')} className="text-sm font-mono text-gray-400 hover:text-black underline">&larr; Kembali ke Web</button></div>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white font-sans text-black overflow-hidden relative">
      <style>{customStyles}</style>
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />
      <CustomAlert data={customAlert} onClose={() => setCustomAlert(null)} />

      {view === 'admin' ? (
        <>
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-black text-gray-300 transform transition-none ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 flex flex-col border-r border-gray-800`}>
             <div className="p-6 border-b border-gray-800 bg-black"><h1 className="font-serif text-xl text-white tracking-wider font-bold">Lapor Ketua</h1><p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-1">Ketua Panel</p></div>
             <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scroll">
                {[{ id: 'dasbor', label: 'Dasbor', icon: Layout }, { id: 'banner', label: 'Banner Promo', icon: LayoutTemplate }, { id: 'katalog', label: 'Katalog', icon: ShoppingBag }, { id: 'info', label: 'Informasi', icon: FileText }, { id: 'kegiatan', label: 'Kegiatan', icon: Camera }, { id: 'broadcast', label: 'Broadcast WA', icon: MessageSquare }, { id: 'transaksi', label: 'Transaksi', icon: List }, { id: 'traffic', label: 'Traffic', icon: Activity }].map(item => (
                   <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMenuOpen(false);}} className={`w-full flex items-center px-4 py-3 text-sm font-medium border ${activeTab === item.id ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-900'}`}><item.icon size={18} className={`mr-3 ${activeTab === item.id ? 'text-black' : ''}`} />{item.label}</button>
                ))}
             </nav>
             <div className="p-4 border-t border-gray-800"><button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 text-sm font-medium w-full px-4 py-2"><LogOut size={16} className="mr-3" /> Keluar</button></div>
          </aside>
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
             <div className="md:hidden bg-black text-white p-4 flex justify-between items-center z-30 shadow-md"><span className="font-serif font-bold tracking-wide">ADMIN PANEL</span><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1"><Menu size={24} /></button></div>
             <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-white">
                <div className="max-w-6xl mx-auto pb-10">
                   {activeTab === 'dasbor' && <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><h2 className="font-serif text-2xl font-bold text-black mb-4 border-b-2 border-gray-100 pb-2">Status Utama</h2><div className="grid md:grid-cols-2 gap-8 mt-6"><div><label className="block font-serif text-gray-500 mb-3 text-sm uppercase tracking-wider font-bold">Ubah Status</label>{['Aktif', 'Perbaikan', 'Mati'].map((status) => (<button key={status} onClick={() => updateGlobalStatus(status)} className={`flex items-center justify-between px-5 py-3 border-2 text-left mb-2 ${globalStatus === status ? 'border-black bg-gray-100 font-bold text-black' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'}`}><span className="font-serif">{status}</span>{globalStatus === status && <Check size={16} />}</button>))}</div><div><div className="bg-gray-50 p-4 border border-gray-200 mb-4 text-center"><p className="text-xs text-gray-500 uppercase font-bold mb-2">Akses Web Publik</p><button onClick={() => setView('public')} className="w-full border-2 border-black bg-black text-white py-3 px-4 font-serif hover:bg-gray-800 flex justify-center items-center gap-2"><ExternalLink size={16} /> Lihat Web</button></div></div></div></div>}
                   {activeTab === 'banner' && <div className="space-y-6"><div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-bold text-black">Banner Promo</h2><button onClick={() => { setEditingId(null); setNewBanner({ title: '', desc: '', imageUrl: '' }); setIsBannerModalOpen(true); }} className="bg-black text-white px-4 py-2 font-serif text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2"><Plus size={16} /> Tambah</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{banners.map((ban) => (<div key={ban.id} className="bg-white border-2 border-black relative group h-40 overflow-hidden"><img src={ban.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4"><h3 className="text-white font-bold">{ban.title}</h3><p className="text-gray-200 text-xs">{ban.desc}</p></div><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => {setEditingId(ban.firebaseId); setNewBanner(ban); setIsBannerModalOpen(true)}} className="bg-white p-1 border border-black"><Pencil size={14}/></button><button onClick={() => handleDeleteBanner(ban.firebaseId)} className="bg-red-500 text-white p-1 border border-black"><Trash2 size={14}/></button></div></div>))}</div><Modal isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} title={editingId ? "Edit Banner" : "Tambah Banner"}><div className="space-y-4 font-serif"><input type="text" placeholder="Judul Promo (Singkat)" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none font-bold" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} /><input type="text" placeholder="Deskripsi Singkat" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newBanner.desc} onChange={e => setNewBanner({...newBanner, desc: e.target.value})} /><div className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50 relative"><input type="file" accept="image/*" onChange={(e) => handleImageFile(e, setNewBanner, newBanner)} className="absolute inset-0 opacity-0 cursor-pointer" />{isUploading ? <span className="animate-pulse">Uploading...</span> : newBanner.imageUrl ? <img src={newBanner.imageUrl} className="h-32 mx-auto object-cover" /> : <span>Upload Banner (Landscape)</span>}</div><button onClick={handleSaveBanner} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">{editingId ? "UPDATE" : "SIMPAN"}</button></div></Modal></div>}
                   {activeTab === 'katalog' && <div className="space-y-6"><div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-bold text-black">Manajemen Katalog</h2><button onClick={() => { setEditingId(null); setNewProduct({ name: '', app: '', price: '', desc: '', isBestSeller: false }); setIsCatalogModalOpen(true); }} className="bg-black text-white px-4 py-2 font-serif text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2"><Plus size={16} /> Tambah</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{catalog.map((item) => (<div key={item.id} className="bg-white border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col relative group"><div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleToggleBestSeller(item)} className="p-1 bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-50"><Star size={16} fill={item.isBestSeller ? "gold" : "none"} /></button><button onClick={() => openProductModal(item)} className="text-blue-500 bg-white p-1 border border-blue-500 hover:bg-blue-50"><Pencil size={16}/></button><button onClick={() => handleDeleteProduct(item.firebaseId)} className="text-red-500 bg-white p-1 border border-red-500 hover:bg-red-50"><Trash2 size={16}/></button></div><div className="bg-gray-50 p-6 border-b-2 border-black flex items-center justify-center"><ShoppingBag size={40} className="text-gray-400" /></div><div className="p-5 flex-1 flex flex-col"><h3 className="font-serif font-bold text-lg text-black mb-1">{item.name}</h3><span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 w-fit mb-3 border border-gray-200">{item.app}</span><p className="text-gray-500 text-sm font-serif italic mb-4 line-clamp-2">"{item.desc}"</p><div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center"><span className="font-mono font-bold text-black">{item.price}</span></div></div></div>))}</div><Modal isOpen={isCatalogModalOpen} onClose={() => setIsCatalogModalOpen(false)} title={editingId ? "Edit Produk" : "Tambah Produk"}><div className="space-y-4 font-serif"><input type="text" placeholder="Nama Produk" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Aplikasi" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newProduct.app} onChange={e => setNewProduct({...newProduct, app: e.target.value})} /><input type="text" placeholder="Harga" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div><textarea placeholder="Deskripsi (Gunakan Enter untuk baris baru)" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none h-24" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})}></textarea><button onClick={handleSaveProduct} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">{editingId ? "UPDATE" : "SIMPAN"}</button></div></Modal></div>}
                   {activeTab === 'info' && <div className="space-y-6"><div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-bold text-black">Kelola Informasi</h2><button onClick={() => openInfoModal()} className="bg-black text-white px-4 py-2 font-serif text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2"><Plus size={16} /> Tambah</button></div><div className="grid grid-cols-1 gap-6">{informations.map((info) => (<div key={info.id} className="flex flex-col md:flex-row bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group"><div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleToggleFeaturedInfo(info)} className="p-1 bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-50" title="Tampilkan di Beranda"><Star size={16} fill={info.isFeatured ? "gold" : "none"} /></button><button onClick={() => openInfoModal(info)} className="text-blue-500 bg-white p-1 border border-blue-500 hover:bg-blue-50"><Pencil size={16}/></button><button onClick={() => handleDeleteInfo(info.firebaseId)} className="text-red-500 bg-white p-1 border border-red-500 hover:bg-red-50"><Trash2 size={16}/></button></div><div className="md:w-48 h-48 md:h-auto bg-gray-100 relative shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-black"><img src={info.image} alt="cover" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/png'} /></div><div className="p-6 flex-1 flex flex-col"><div className="flex justify-between items-start mb-2"><span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{info.date}</span></div><h3 className="font-serif font-bold text-xl text-black mb-3">{info.title}</h3><p className="text-gray-600 font-serif text-sm line-clamp-2 mb-4 whitespace-pre-wrap">{info.content}</p></div></div>))}</div><Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title={editingId ? "Edit Info" : "Tambah Info"}><div className="space-y-4 font-serif"><input type="text" placeholder="Judul" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none font-bold" value={newInfo.title} onChange={e => setNewInfo({...newInfo, title: e.target.value})} /><div className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50 relative"><input type="file" accept="image/*" onChange={(e) => handleImageFile(e, setNewInfo, newInfo)} className="absolute inset-0 opacity-0 cursor-pointer" />{isUploading ? <span className="animate-pulse font-bold">Uploading...</span> : newInfo.imageUrl ? <img src={newInfo.imageUrl} className="h-32 mx-auto object-cover border border-black" /> : <div className="flex flex-col items-center text-gray-400"><Upload size={24} className="mb-2" /><span className="text-sm">Klik untuk upload foto</span></div>}</div><textarea placeholder="Isi Konten (Gunakan Enter untuk baris baru)" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none h-40 text-sm" value={newInfo.content} onChange={e => setNewInfo({...newInfo, content: e.target.value})}></textarea><button onClick={handleSaveInfo} disabled={isUploading} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800 disabled:opacity-50">{editingId ? "UPDATE" : "PUBLIKASIKAN"}</button></div></Modal></div>}
                   {activeTab === 'kegiatan' && <div className="space-y-6"><div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-bold text-black">Kegiatan Admin</h2><button onClick={() => { setEditingId(null); setNewActivity({ caption: '', desc: '', imageUrl: '' }); setIsActivityModalOpen(true); }} className="bg-black text-white px-4 py-2 font-serif text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2"><Plus size={16} /> Tambah</button></div><div className="grid grid-cols-1 gap-6">{activities.map((act) => (<div key={act.id} className="bg-white border-2 border-black p-4 relative group"><div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => {setEditingId(act.firebaseId); setNewActivity(act); setIsActivityModalOpen(true)}} className="text-blue-500 bg-white p-1 border border-blue-500"><Pencil size={16}/></button><button onClick={() => handleDeleteActivity(act.firebaseId)} className="text-red-500 bg-white p-1 border border-red-500"><Trash2 size={16}/></button></div><img src={act.image} className="w-full h-48 object-cover mb-4 border border-gray-200" /><h3 className="font-bold text-lg mb-2">{act.caption}</h3><p className="text-sm text-gray-600 line-clamp-3">{act.desc}</p><span className="text-xs text-gray-400 mt-2 block">{act.date}</span></div>))}</div><Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title={editingId ? "Edit Kegiatan" : "Tambah Kegiatan"}><div className="space-y-4 font-serif"><input type="text" placeholder="Caption Singkat" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none font-bold" value={newActivity.caption} onChange={e => setNewActivity({...newActivity, caption: e.target.value})} /><div className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:bg-gray-50 relative"><input type="file" accept="image/*" onChange={(e) => handleImageFile(e, setNewActivity, newActivity)} className="absolute inset-0 opacity-0 cursor-pointer" />{isUploading ? <span className="animate-pulse">Uploading...</span> : newActivity.imageUrl ? <img src={newActivity.imageUrl} className="h-32 mx-auto object-cover" /> : <span>Upload Foto</span>}</div><textarea placeholder="Deskripsi Kegiatan" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none h-32 text-sm" value={newActivity.desc} onChange={e => setNewActivity({...newActivity, desc: e.target.value})}></textarea><button onClick={handleSaveActivity} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">{editingId ? "UPDATE" : "POSTING"}</button></div></Modal></div>}
                   {activeTab === 'broadcast' && <div className="grid md:grid-cols-2 gap-8"><div className="space-y-6"><div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><h2 className="font-serif text-2xl font-bold text-black mb-4">1. Pesan Broadcast</h2><div className="mb-4"><label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pilih Dari Informasi:</label><div className="flex gap-2 overflow-x-auto pb-2">{informations.map((info) => (<div key={info.id} onClick={() => handleSelectInfoForBroadcast(info)} className={`flex-shrink-0 w-40 p-2 border-2 cursor-pointer transition-all ${selectedBroadcastInfoId === info.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-black'}`}><div className="h-20 bg-gray-100 mb-2 overflow-hidden"><img src={info.image} className="w-full h-full object-cover" /></div><p className="text-xs font-bold truncate">{info.title}</p></div>))}</div></div><textarea className="w-full h-40 border-2 border-gray-300 p-3 focus:border-black outline-none font-sans text-sm" placeholder="Tulis pesan..." value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)}></textarea></div></div><div className="space-y-6"><div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><h2 className="font-serif text-2xl font-bold text-black mb-4">2. Kirim Ke Pelanggan</h2><div className="bg-gray-50 border-2 border-gray-100 h-80 overflow-y-auto p-2 space-y-2">{customerNumbers.map((phone, idx) => (<div key={idx} className="flex justify-between items-center bg-white p-3 border border-gray-200 shadow-sm"><div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-full text-green-600"><Phone size={14} /></div><span className="font-mono text-sm font-bold text-gray-700">{phone}</span></div><button onClick={() => sendBroadcast(phone)} className="bg-black text-white px-4 py-1.5 text-xs font-bold hover:bg-gray-800 flex items-center gap-2 uppercase tracking-wider">Kirim <Send size={10} /></button></div>))}</div></div></div></div>}
                   {activeTab === 'transaksi' && <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><div className="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center"><h2 className="font-serif text-xl font-bold text-black">Jurnal Transaksi</h2><button onClick={() => openTransactionModal()} className="bg-black text-white px-3 py-1 font-serif text-xs hover:bg-gray-800 shadow-sm flex items-center gap-2"><Plus size={14} /> Data Baru</button></div><div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[900px]"><thead className="bg-gray-100 text-black font-serif text-sm uppercase tracking-wider"><tr><th className="px-6 py-4 border-b-2 border-gray-200">Nama Transaksi</th><th className="px-6 py-4 border-b-2 border-gray-200">Aplikasi</th><th className="px-6 py-4 border-b-2 border-gray-200">Durasi</th><th className="px-6 py-4 border-b-2 border-gray-200">Kontak</th><th className="px-6 py-4 border-b-2 border-gray-200">Bonus</th><th className="px-6 py-4 border-b-2 border-gray-200">Status</th><th className="px-6 py-4 border-b-2 border-gray-200">Aksi</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm">{transactions.map((t) => (<tr key={t.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-serif font-medium text-black">{t.name}</td><td className="px-6 py-4 font-serif text-gray-600">{t.app}</td><td className="px-6 py-4"><TimeDisplay targetDate={t.targetDate} status={t.status} /></td><td className="px-6 py-4 font-mono text-xs text-gray-500">{t.phone}<br/>{t.email}</td><td className="px-6 py-4 font-serif text-gray-600 italic">{t.bonus}</td><td className="px-6 py-4"><select value={t.status} onChange={(e) => handleStatusChange(t, e.target.value)} className="bg-transparent text-xs font-serif uppercase border border-gray-300 py-1 px-2 cursor-pointer hover:bg-white w-full"><option value="Aktif">Aktif</option><option value="Perbaikan">Perbaikan</option><option value="Mati">Mati</option><option value="Planning">Planning</option></select></td><td className="px-6 py-4 flex gap-2"><button onClick={() => openTransactionModal(t)} className="text-blue-500 hover:text-blue-700"><Pencil size={16}/></button><button onClick={() => handleDeleteTransaction(t.firebaseId)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div><Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={editingId ? "Edit Transaksi" : "Input Transaksi"}><div className="space-y-4 font-serif"><input type="text" placeholder="Nama Item" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.name} onChange={e => setNewTransaction({...newTransaction, name: e.target.value})} /><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Aplikasi" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.app} onChange={e => setNewTransaction({...newTransaction, app: e.target.value})} /><input type="number" placeholder="Durasi" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.durationDays} onChange={e => setNewTransaction({...newTransaction, durationDays: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="No. HP" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.phone} onChange={e => setNewTransaction({...newTransaction, phone: e.target.value})} /><input type="text" placeholder="Email" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.email} onChange={e => setNewTransaction({...newTransaction, email: e.target.value})} /></div><input type="text" placeholder="Bonus" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.bonus} onChange={e => setNewTransaction({...newTransaction, bonus: e.target.value})} /><button onClick={handleSaveTransaction} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">{editingId ? "UPDATE" : "SIMPAN"}</button></div></Modal></div>}
                   {activeTab === 'traffic' && <div className="border-2 border-black bg-gray-50 p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><h2 className="font-serif text-lg text-gray-500 uppercase tracking-[0.2em] mb-8">Status Operasional</h2><div className="w-32 h-32 md:w-48 md:h-48 border-4 mx-auto flex items-center justify-center mb-6 bg-white border-black">{globalStatus === 'Aktif' && <Check size={80} className="text-black" strokeWidth={3} />}{globalStatus === 'Perbaikan' && <AlertTriangle size={80} className="text-black" strokeWidth={3} />}{globalStatus === 'Mati' && <XCircle size={80} className="text-black" strokeWidth={3} />}</div><h1 className="text-5xl font-serif font-bold text-black tracking-tight">{globalStatus}</h1></div>}
                </div>
             </div>
          </main>
        </>
      ) : (
        // --- TAMPILAN PUBLIK (BERANDA TABS) ---
        <div className="min-h-screen w-full bg-white text-black font-serif pb-20 overflow-y-auto">
           {/* HEADER */}
           <div className="border-b-4 border-black py-4 px-4 bg-white sticky top-0 z-50">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase cursor-pointer" onClick={() => setPublicTab('beranda')}>TOKO</h1>
                 </div>
                 
                 {/* Desktop Nav */}
                 <div className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-widest">
                    {['beranda', 'informasi', 'produk', 'kontak', 'transaksi', 'ulasan'].map((tab) => (
                       <button 
                          key={tab} 
                          onClick={() => setPublicTab(tab)}
                          className={`${publicTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black'} px-3 py-1 transition-colors`}
                       >
                          {tab}
                       </button>
                    ))}
                 </div>

                 <div className="flex items-center gap-4">
                    <button onClick={() => setView('admin')} className="text-[10px] font-mono text-gray-400 hover:text-black underline hidden md:block">[Ketua]</button>
                    <button className="md:hidden" onClick={() => setIsPublicMenuOpen(!isPublicMenuOpen)}>
                       {isPublicMenuOpen ? <X /> : <Menu />}
                    </button>
                 </div>
              </div>

              {/* Mobile Nav */}
              {isPublicMenuOpen && (
                 <div className="md:hidden border-t-2 border-black mt-4 pt-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
                    {['beranda', 'informasi', 'produk', 'kontak', 'transaksi', 'ulasan'].map((tab) => (
                       <button 
                          key={tab} 
                          onClick={() => { setPublicTab(tab); setIsPublicMenuOpen(false); }}
                          className={`text-left px-2 py-2 text-sm font-bold uppercase ${publicTab === tab ? 'bg-black text-white' : 'text-gray-500'}`}
                       >
                          {tab}
                       </button>
                    ))}
                    <button onClick={() => setView('admin')} className="text-left px-2 py-2 text-xs font-mono text-gray-400 mt-2 border-t border-gray-100 pt-2">Login Ketua &rarr;</button>
                 </div>
              )}
           </div>
           
           <div className="max-w-5xl mx-auto px-4 py-8">
              
              {/* TAB CONTENT: BERANDA */}
              {publicTab === 'beranda' && (
                  <div className="space-y-12 animate-in fade-in duration-300">
                      <section className="text-center border-b-2 border-gray-100 pb-12">
                        <span className="inline-block px-3 py-1 bg-black text-white text-xs font-mono mb-4">SISTEM STATUS</span>
                        <div className={`text-5xl md:text-8xl font-black uppercase tracking-widest mb-2 ${globalStatus === 'Aktif' ? 'text-green-700' : globalStatus === 'Perbaikan' ? 'text-yellow-600' : 'text-red-700'}`}>{globalStatus}</div>
                        <p className="text-gray-400 text-sm italic font-mono">Selalu update setiap Jamnya</p>
                      </section>

                      <div className="w-full overflow-hidden whitespace-nowrap bg-stone-100 py-4 -mx-4 md:-mx-0">
                        <div className="inline-block animate-marquee">
                            <span className="mx-12 font-black uppercase text-2xl tracking-widest text-stone-300">Awanku Digital</span>
                            <span className="mx-12 font-black uppercase text-2xl tracking-widest text-black">TapPay MarketPlace</span>
                            <span className="mx-12 font-black uppercase text-2xl tracking-widest text-stone-300">Awanku Digital</span>
                            <span className="mx-12 font-black uppercase text-2xl tracking-widest text-black">TapPay MarketPlace</span>
                            <span className="mx-12 font-black uppercase text-2xl tracking-widest text-stone-300">Awanku Digital</span>
                            <span className="mx-12 font-black uppercase text-2xl tracking-widest text-black">TapPay MarketPlace</span>
                        </div>
                      </div>

                      {/* SEARCH & BANNER (NEW) */}
                      <section className="space-y-6">
                         <form onSubmit={handleSearch} className="flex w-full border-2 border-black"><input type="text" placeholder="Cari produk (contoh: Netflix)..." className="flex-1 p-3 outline-none font-sans text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><button type="submit" className="bg-black text-white px-4 hover:bg-gray-800"><Search size={20} /></button></form>
                         <BannerCarousel data={banners} />
                      </section>

                      {/* FEATURED INFO */}
                      {featuredInfo && (
                        <section className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover-lift">
                           <div className="flex items-center gap-2 mb-4"><Star size={20} fill="gold" className="text-yellow-500"/><h2 className="font-bold text-lg uppercase tracking-wider">Info Penting</h2></div>
                           <div className="flex flex-col md:flex-row gap-6">
                              <img src={featuredInfo.image} className="w-full md:w-1/3 h-48 object-cover border border-gray-200" />
                              <div>
                                 <span className="text-xs text-gray-400 font-mono mb-2 block">{featuredInfo.date}</span>
                                 <h3 className="text-2xl font-bold mb-3">{featuredInfo.title}</h3>
                                 <p className="text-gray-600 text-sm line-clamp-3 mb-4">{featuredInfo.content}</p>
                                 <button onClick={() => {setSelectedInfo(featuredInfo); setIsReadMoreOpen(true);}} className="text-xs font-bold underline">BACA SELENGKAPNYA &rarr;</button>
                              </div>
                           </div>
                        </section>
                      )}

                      {/* BEST SELLER */}
                      {bestSellers.length > 0 && (
                          <section>
                             <div className="border-l-4 border-black pl-4 mb-8"><h2 className="text-3xl font-bold italic inline-block">BEST SELLER</h2></div>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {bestSellers.map((item) => (
                                    <div key={item.id} className="bg-stone-50 border border-gray-200 p-4 hover-lift cursor-pointer" onClick={() => {setSelectedProduct(item); setIsPreviewModalOpen(true);}}>
                                        <div className="flex justify-between mb-2"><h4 className="font-bold">{item.name}</h4><Star size={14} fill="gold" className="text-yellow-500"/></div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.desc}</p>
                                        <span className="font-mono font-bold text-sm block border-t pt-2">{item.price}</span>
                                    </div>
                                ))}
                             </div>
                          </section>
                      )}
                  </div>
              )}

              {/* TAB: KONTAK & KEGIATAN (NEW) */}
              {publicTab === 'kontak' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="grid md:grid-cols-2 gap-8 mb-12">
                          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 border-2 border-black flex items-center justify-center overflow-hidden"><img src="https://ui-avatars.com/api/?name=Admin+Toko&background=random" className="w-full h-full"/></div>
                              <h2 className="text-2xl font-bold mb-1">Admin Toko</h2>
                              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mb-6 ${globalStatus === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  <div className={`w-2 h-2 rounded-full ${globalStatus === 'Aktif' ? 'bg-green-600' : 'bg-red-600'}`}></div> {globalStatus === 'Aktif' ? 'Online' : 'Offline'}
                              </div>
                              <div className="space-y-3 text-left">
                                  <a href="https://wa.me/6281319865384" target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"><Phone size={18} /> <span className="font-mono text-sm">+62 813-1986-5384</span></a>
                                  <a href="#" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"><Instagram size={18} /> <span className="font-mono text-sm">@awanku_digital</span></a>
                              </div>
                          </div>
                          <div className="bg-stone-100 border-2 border-black p-8 flex flex-col justify-center items-center text-center">
                              <MapPin size={40} className="mb-4 text-black"/>
                              <h3 className="font-bold text-xl mb-2">Lokasi Kami</h3>
                              <p className="text-gray-600 text-sm">Jakarta, Indonesia</p>
                              {/* <div className="w-full h-32 bg-gray-200 mt-6 flex items-center justify-center border border-gray-300 text-gray-400 text-xs italic">[Map Placeholder]</div> */}
                          </div>
                      </div>

                      <div className="border-l-4 border-black pl-4 mb-8"><h2 className="text-3xl font-bold italic">KEGIATAN KAMI</h2></div>
                      <div className="grid grid-cols-1 gap-8">
                          {activities.length === 0 ? <p className="text-gray-400 italic">Belum ada kegiatan.</p> : activities.map((act) => (
                              <div key={act.id} className="bg-white border border-gray-200 p-0 flex flex-col md:flex-row hover:shadow-lg transition">
                                  <img src={act.image} className="w-full md:w-1/3 h-64 object-cover" />
                                  <div className="p-6 flex-1">
                                      <span className="text-xs font-mono text-gray-400 mb-2 block">{act.date}</span>
                                      <h3 className="text-2xl font-bold mb-4">{act.caption}</h3>
                                      <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{act.desc}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {publicTab === 'informasi' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="border-l-4 border-black pl-4 mb-8"><h2 className="text-3xl font-bold italic">INFORMASI TERBARU</h2></div>
                      <div className="space-y-8">
                          {informations.length === 0 ? <p className="text-gray-400 italic">Belum ada informasi terbaru.</p> : informations.map((info) => (
                              <div key={info.id} className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8 last:border-0 hover-lift p-4 transition-all">
                                  <div className="md:w-1/3 aspect-video bg-gray-100 border border-gray-200 overflow-hidden shrink-0"><img src={info.image} alt="info" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" onError={(e) => e.target.src = 'https://placehold.co/600x400/png'} /></div>
                                  <div className="md:w-2/3 flex flex-col"><span className="text-xs font-mono text-gray-400 mb-2 block">{info.date}</span><h3 className="text-2xl font-bold text-black mb-3">{info.title}</h3><p className="text-gray-600 leading-relaxed font-serif text-sm line-clamp-3 mb-4 whitespace-pre-wrap">{info.content}</p><div className="mt-auto"><button onClick={() => {setSelectedInfo(info); setIsReadMoreOpen(true);}} className="text-sm font-bold border-b-2 border-black hover:bg-black hover:text-white px-1 inline-block">BACA SELENGKAPNYA</button></div></div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {publicTab === 'produk' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                     <div className="border-l-4 border-black pl-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-3xl font-bold italic inline-block">KATALOG PRODUK</h2>
                        <form onSubmit={handleSearch} className="flex w-full md:w-auto border border-black"><input type="text" placeholder="Cari..." className="w-full md:w-48 p-2 outline-none font-sans text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><button type="submit" className="bg-black text-white px-3 hover:bg-gray-800"><Search size={16} /></button></form>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         {filteredCatalog.length === 0 ? <p className="text-gray-400 italic col-span-full text-center py-10">{searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada produk."}</p> : filteredCatalog.map((item) => (
                             <div key={item.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col p-6 hover-lift cursor-pointer" onClick={() => {setSelectedProduct(item); setIsPreviewModalOpen(true);}}>
                                <div className="flex justify-between items-start mb-4"><h3 className="font-bold text-xl">{item.name}</h3><span className="bg-gray-100 text-xs px-2 py-1 font-mono uppercase border border-gray-200">{item.app}</span></div>
                                <p className="text-gray-600 text-sm italic mb-6 line-clamp-3 whitespace-pre-wrap">{item.desc}</p>
                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100"><span className="font-mono font-bold text-lg">{item.price}</span><button className="text-xs font-bold underline hover:bg-black hover:text-white px-2 py-1">DETAIL &rarr;</button></div>
                             </div>
                         ))}
                     </div>
                  </div>
              )}

              {publicTab === 'transaksi' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                     <div className="border-l-4 border-black pl-4 mb-8"><h2 className="text-3xl font-bold italic inline-block">LIVE TRANSAKSI</h2></div>
                     <div className="border-2 border-black bg-white overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]"><thead className="bg-gray-100 border-b-2 border-black font-mono text-xs uppercase"><tr><th className="px-4 py-3 border-r border-gray-300">Produk</th><th className="px-4 py-3 border-r border-gray-300">Waktu Tersisa</th><th className="px-4 py-3 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-200 text-sm">{transactions.map(t => (<tr key={t.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-bold border-r border-gray-200 w-1/3">{t.name}</td><td className="px-4 py-3 font-mono text-gray-600 border-r border-gray-200 w-1/3"><TimeDisplay targetDate={t.targetDate} status={t.status} /></td><td className="px-4 py-3 text-center w-1/3"><StatusBadge status={t.status} /></td></tr>))}</tbody></table>
                     </div>
                  </div>
              )}

              {publicTab === 'ulasan' && (
                  <div className="bg-stone-50 p-6 md:p-10 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="text-center mb-8"><h2 className="text-2xl font-bold italic mb-2">SUARA PELANGGAN</h2><p className="text-sm text-gray-500 font-serif">Khusus untuk pelanggan setia Toko Awanku Digital.</p></div>
                      {!isCustomerVerified && (<div className="max-w-md mx-auto bg-white p-6 border-b-2 border-black text-center"><p className="text-sm font-bold mb-4">Masuk untuk Berkomentar</p><input type="email" placeholder="Masukkan Gmail kamu..." className="w-full border-b-2 border-gray-300 p-3 mb-4 text-center font-mono text-sm outline-none focus:border-black" value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} /><button onClick={handleVerifyCustomer} disabled={isCheckingEmail} className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center gap-2">{isCheckingEmail ? <Loader2 className="animate-spin" size={16} /> : "Cek Data Pelanggan"}</button></div>)}
                      {isCustomerVerified && (<div className="max-w-xl mx-auto mb-10"><div className="bg-white p-4 border-b-2 border-black"><div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 size={16} /></div><span className="text-xs font-mono text-green-700">Terverifikasi: {commentEmail}</span></div><textarea className="w-full h-24 border-b-2 border-gray-200 p-3 mb-3 text-sm focus:border-black outline-none resize-none" placeholder="Tulis ulasanmu disini..." value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea><div className="flex justify-between items-center"><label className="cursor-pointer bg-gray-100 px-3 py-2 rounded flex items-center gap-2 text-xs font-bold hover:bg-gray-200"><ImageIcon size={16} /> {commentImage ? "Ganti Foto" : "Upload Foto"} <input type="file" accept="image/*" className="hidden" onChange={handleCommentImage} /></label><button onClick={handlePostComment} className="bg-black text-white px-6 py-2 font-bold text-xs uppercase hover:bg-gray-800 flex items-center gap-2">Kirim <Send size={12} /></button></div>{commentImage && (<div className="mt-3 w-20 h-20 border border-gray-200 relative"><img src={commentImage} className="w-full h-full object-cover" /><button onClick={() => setCommentImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button></div>)}</div></div>)}
                      <div className="space-y-6 mt-8 max-w-2xl mx-auto">{comments.length === 0 ? <p className="text-center text-gray-400 text-sm italic">Belum ada komentar.</p> : comments.map((comment) => (<div key={comment.firebaseId} className="flex gap-4 border-b border-gray-200 pb-4"><div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm shrink-0 rounded-full">{comment.email.charAt(0).toUpperCase()}</div><div className="flex-1"><div className="flex justify-between items-start mb-1"><span className="font-bold text-sm">{comment.email.split('@')[0]}</span><span className="text-[10px] text-gray-400">{comment.date}</span></div><p className="text-sm text-gray-600 leading-relaxed mb-2 whitespace-pre-wrap">{comment.text}</p>{comment.image && <img src={comment.image} className="h-20 w-auto border border-gray-100 cursor-zoom-in hover:opacity-90 rounded" onClick={() => setPreviewImage(comment.image)} />}</div></div>))}</div>
                  </div>
              )}
              
              <footer className="text-center pt-12 text-xs font-mono text-gray-400 border-t border-gray-100 mt-12">&copy; 2024 TOKO LEDGER.</footer>
           </div>

           {/* MODALS */}
           <Modal isOpen={isReadMoreOpen} onClose={() => setIsReadMoreOpen(false)} title="Informasi Lengkap">
              {selectedInfo && <div className="font-serif"><div className="w-full h-64 bg-gray-100 border border-gray-200 mb-6 overflow-hidden"><img src={selectedInfo.image} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/png'} /></div><span className="text-xs font-mono text-gray-500 mb-2 block">{selectedInfo.date}</span><h2 className="text-3xl font-bold mb-6">{selectedInfo.title}</h2><div className="text-gray-700 leading-loose whitespace-pre-wrap text-base">{selectedInfo.content}</div></div>}
           </Modal>
           <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Detail Produk">
              {selectedProduct && <div className="font-serif"><div className="border-2 border-black p-6 bg-white relative"><div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4"><div className="w-16 h-16 bg-gray-100 flex items-center justify-center border border-gray-200"><ShoppingBag size={24}/></div><div><h2 className="text-xl font-bold">{selectedProduct.name}</h2><p className="text-sm text-gray-500 font-mono">{selectedProduct.app}</p></div></div><div className="bg-gray-50 p-4 border border-gray-100 mb-6 text-sm text-gray-600 leading-relaxed italic whitespace-pre-wrap">{selectedProduct.desc}</div><div className="flex justify-between items-center"><div><p className="text-xs text-gray-400 uppercase">Harga</p><p className="text-2xl font-mono font-bold">{selectedProduct.price}</p></div><a href={`https://wa.me/6281319865384?text=${encodeURIComponent(`Halo Toko, saya mau beli Produk ${selectedProduct.name} ready gak??`)}`} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 flex items-center gap-2"><Phone size={16} /> Hubungi Ketua</a></div></div></div>}
          </Modal>
          {previewImage && <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-screen object-contain" /></div>}
        </div>
      )}
      {isMenuOpen && <div className="fixed inset-0 bg-black/80 z-30 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}
    </div>
  );
}