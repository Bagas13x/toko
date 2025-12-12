import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  setDoc,
  deleteField // Import penting untuk menghapus field sisa waktu
} from "firebase/firestore";
import { 
  Layout, List, Users, Activity, ExternalLink, Menu, X, Check, 
  AlertTriangle, XCircle, ShoppingBag, Eye, Plus, FileText, 
  ImageIcon, Trash2, Lock, LogOut, Phone, PauseCircle
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
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase Error:", error);
}

// --- UTILITY COMPONENTS ---

// Komponen Waktu (Cerdas: Bisa Berhenti)
const TimeDisplay = ({ targetDate, status }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // LOGIKA 1: Jika status bukan Aktif, jangan jalankan timer (Tampilkan status beku)
    if (status !== 'Aktif') {
      setTimeLeft("TERHENTI");
      return; 
    }

    if (!targetDate) return;
    const target = targetDate.seconds ? new Date(targetDate.seconds * 1000) : new Date(targetDate);

    const calculate = () => {
      const now = new Date();
      const difference = +target - +now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("EXPIRED");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate, status]); // Re-run jika status berubah

  // Tampilan visual saat timer berjalan vs berhenti
  if (status !== 'Aktif') {
    return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded text-xs">
            <PauseCircle size={12} /> DIJEDA
        </span>
    );
  }

  return (
    <span className={`font-mono font-medium tracking-tight ${isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
      {timeLeft}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  let styles = "";
  switch (status) {
    case "Aktif": styles = "bg-green-100 text-green-800 border-green-300"; break;
    case "Perbaikan": styles = "bg-yellow-100 text-yellow-800 border-yellow-300"; break;
    case "Mati": styles = "bg-gray-100 text-gray-600 border-gray-300"; break;
    default: styles = "bg-blue-100 text-blue-800 border-blue-300";
  }
  return (
    <span className={`inline-block px-3 py-1 text-[10px] md:text-xs font-serif uppercase tracking-widest border ${styles}`}>
      {status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
          <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-black">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white rounded-none">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [view, setView] = useState('admin');
  const [activeTab, setActiveTab] = useState('dasbor');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Data State
  const [globalStatus, setGlobalStatus] = useState('Aktif');
  const [informations, setInformations] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Modals & Inputs
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [newInfo, setNewInfo] = useState({ title: '', content: '', imageUrl: '' });

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', app: '', price: '', desc: '' });

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ name: '', app: '', durationDays: 30, phone: '', email: '', bonus: '' });

  // Database Listeners
  useEffect(() => {
    if (!db) return;

    const unsubStatus = onSnapshot(doc(db, "settings", "global_status"), (doc) => {
      if (doc.exists()) setGlobalStatus(doc.data().status);
      else setDoc(doc.ref, { status: "Aktif" });
    });

    const qCatalog = query(collection(db, "catalog"), orderBy("id", "desc"));
    const unsubCatalog = onSnapshot(qCatalog, (snapshot) => {
      setCatalog(snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
    });

    const qInfo = query(collection(db, "informations"), orderBy("id", "desc"));
    const unsubInfo = onSnapshot(qInfo, (snapshot) => {
      setInformations(snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
    });

    const qTrans = query(collection(db, "transactions"), orderBy("id", "desc"));
    const unsubTrans = onSnapshot(qTrans, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
    });

    return () => { unsubStatus(); unsubCatalog(); unsubInfo(); unsubTrans(); };
  }, []);

  // Handlers
  const updateGlobalStatus = async (status) => {
    if (db) await setDoc(doc(db, "settings", "global_status"), { status });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'bagas' && loginForm.password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
      setView('admin');
    } else {
      setLoginError('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
    setView('admin');
  };

  const handleAddInfo = async () => {
    if(!newInfo.title || !newInfo.content) return;
    const infoData = {
      id: Date.now(),
      title: newInfo.title,
      content: newInfo.content,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      image: newInfo.imageUrl || "https://placehold.co/600x400/png"
    };
    if (db) await addDoc(collection(db, "informations"), infoData);
    setNewInfo({ title: '', content: '', imageUrl: '' });
    setIsInfoModalOpen(false);
  };

  const handleDeleteInfo = async (firebaseId) => {
    if (db) await deleteDoc(doc(db, "informations", firebaseId));
  };

  const handleAddProduct = async () => {
    if(!newProduct.name || !newProduct.price) return;
    const prodData = { ...newProduct, id: Date.now() };
    if (db) await addDoc(collection(db, "catalog"), prodData);
    setNewProduct({ name: '', app: '', price: '', desc: '' });
    setIsCatalogModalOpen(false);
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.name) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(newTransaction.durationDays));
    
    const transData = {
      id: Date.now(),
      name: newTransaction.name,
      app: newTransaction.app,
      targetDate: targetDate,
      phone: newTransaction.phone,
      email: newTransaction.email,
      bonus: newTransaction.bonus,
      status: 'Aktif' // Default Status
    };
    if (db) await addDoc(collection(db, "transactions"), transData);
    setNewTransaction({ name: '', app: '', durationDays: 30, phone: '', email: '', bonus: '' });
    setIsTransactionModalOpen(false);
  }

  // --- LOGIKA CERDAS PAUSE/RESUME TIMER ---
  const handleStatusChange = async (transaction, newStatus) => {
    if (!db) return;
    const docRef = doc(db, "transactions", transaction.firebaseId);
    
    // 1. Jika mengubah KE 'Aktif' (Melanjutkan Waktu)
    if (newStatus === 'Aktif' && transaction.status !== 'Aktif') {
        // Cek apakah ada sisa waktu yang dibekukan
        if (transaction.frozenRemaining) {
            // Hitung target date baru: Sekarang + Sisa Waktu
            const newTargetDate = new Date(Date.now() + transaction.frozenRemaining);
            
            await updateDoc(docRef, { 
                status: 'Aktif',
                targetDate: newTargetDate, // Update target date
                frozenRemaining: deleteField() // Hapus simpanan sisa waktu
            });
        } else {
            // Fallback jika tidak ada data beku (langsung aktifkan saja)
            await updateDoc(docRef, { status: 'Aktif' });
        }
    } 
    // 2. Jika mengubah KE 'Non-Aktif' (Membekukan Waktu)
    else if (newStatus !== 'Aktif' && transaction.status === 'Aktif') {
        // Hitung sisa waktu saat ini
        const currentTarget = transaction.targetDate.seconds ? new Date(transaction.targetDate.seconds * 1000) : new Date(transaction.targetDate);
        const remainingMillis = currentTarget.getTime() - Date.now();

        await updateDoc(docRef, { 
            status: newStatus,
            frozenRemaining: remainingMillis > 0 ? remainingMillis : 0 // Simpan sisa waktu
        });
    } 
    // 3. Perubahan status biasa (Non-Aktif ke Non-Aktif lain)
    else {
        await updateDoc(docRef, { status: newStatus });
    }
  };

  // --- RENDERING ---

  if (view === 'admin' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-serif text-black">
        <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white mx-auto flex items-center justify-center mb-4"><Lock size={32} /></div>
            <h1 className="text-2xl font-bold uppercase tracking-widest">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Username</label>
              <input type="text" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input type="password" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            {loginError && <div className="bg-red-50 text-red-600 text-sm p-3 border border-red-200 text-center font-bold">{loginError}</div>}
            <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800">Masuk</button>
          </form>
          <div className="mt-8 text-center pt-6 border-t border-gray-200">
             <button onClick={() => setView('public')} className="text-sm font-mono text-gray-400 hover:text-black underline">&larr; Halaman Publik</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white font-sans text-black overflow-hidden">
      {view === 'admin' ? (
        <>
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-black text-gray-300 transform transition-none ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 flex flex-col border-r border-gray-800`}>
             <div className="p-6 border-b border-gray-800 bg-black">
                <h1 className="font-serif text-xl text-white tracking-wider font-bold">TOKO</h1>
                <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-1">Admin Panel</p>
             </div>
             <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {[{ id: 'dasbor', label: 'Dasbor', icon: Layout }, { id: 'katalog', label: 'Katalog Produk', icon: ShoppingBag }, { id: 'info', label: 'Informasi', icon: FileText }, { id: 'transaksi', label: 'Data Transaksi', icon: List }, { id: 'traffic', label: 'Traffic', icon: Activity }].map(item => (
                   <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMenuOpen(false);}} className={`w-full flex items-center px-4 py-3 text-sm font-medium border ${activeTab === item.id ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-900'}`}>
                      <item.icon size={18} className={`mr-3 ${activeTab === item.id ? 'text-black' : ''}`} />{item.label}
                   </button>
                ))}
             </nav>
             <div className="p-4 border-t border-gray-800">
                <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 text-sm font-medium w-full px-4 py-2"><LogOut size={16} className="mr-3" /> Keluar</button>
             </div>
          </aside>
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
             <div className="md:hidden bg-black text-white p-4 flex justify-between items-center z-30 shadow-md">
                <span className="font-serif font-bold tracking-wide">ADMIN PANEL</span>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1"><Menu size={24} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-white">
                <div className="max-w-6xl mx-auto pb-10">
                   {activeTab === 'dasbor' && (
                      <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="font-serif text-2xl font-bold text-black mb-4 border-b-2 border-gray-100 pb-2">Pusat Kontrol</h2>
                        <div className="grid md:grid-cols-2 gap-8 mt-6">
                          <div>
                            <label className="block font-serif text-gray-500 mb-3 text-sm uppercase tracking-wider font-bold">Status TOKO</label>
                            {['Aktif', 'Perbaikan', 'Mati'].map((status) => (
                              <button key={status} onClick={() => updateGlobalStatus(status)} className={`flex items-center justify-between px-5 py-3 border-2 text-left mb-2 ${globalStatus === status ? 'border-black bg-gray-100 font-bold text-black' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'}`}>
                                <span className="font-serif">{status}</span>{globalStatus === status && <Check size={16} />}
                              </button>
                            ))}
                          </div>
                          <div>
                             <div className="bg-gray-50 p-4 border border-gray-200 mb-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Link Akses</p>
                                <p className="text-sm font-mono text-gray-800 break-all">https://TOKO.catalog/public</p>
                             </div>
                             <button onClick={() => setView('public')} className="w-full border-2 border-black bg-black text-white py-3 px-4 font-serif hover:bg-gray-800 flex justify-center items-center gap-2"><ExternalLink size={16} /> Buka Halaman Publik</button>
                          </div>
                        </div>
                      </div>
                   )}
                   {activeTab === 'katalog' && (
                      <div className="space-y-6">
                         <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-bold text-black">Manajemen Katalog</h2><button onClick={() => setIsCatalogModalOpen(true)} className="bg-black text-white px-4 py-2 font-serif text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2"><Plus size={16} /> Tambah</button></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {catalog.map((item) => (
                                 <div key={item.id} className="bg-white border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                                     <div className="bg-gray-50 p-6 border-b-2 border-black flex items-center justify-center"><ShoppingBag size={40} className="text-gray-400" /></div>
                                     <div className="p-5 flex-1 flex flex-col">
                                         <h3 className="font-serif font-bold text-lg text-black mb-1">{item.name}</h3>
                                         <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 w-fit mb-3 border border-gray-200">{item.app}</span>
                                         <p className="text-gray-500 text-sm font-serif italic mb-4 line-clamp-2">"{item.desc}"</p>
                                         <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center"><span className="font-mono font-bold text-black">{item.price}</span></div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <Modal isOpen={isCatalogModalOpen} onClose={() => setIsCatalogModalOpen(false)} title="Tambah Produk">
                            <div className="space-y-4 font-serif">
                               <input type="text" placeholder="Nama Produk" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                               <div className="grid grid-cols-2 gap-4">
                                  <input type="text" placeholder="Aplikasi" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newProduct.app} onChange={e => setNewProduct({...newProduct, app: e.target.value})} />
                                  <input type="text" placeholder="Harga" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                               </div>
                               <textarea placeholder="Deskripsi" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none h-24" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})}></textarea>
                               <button onClick={handleAddProduct} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">SIMPAN</button>
                            </div>
                         </Modal>
                      </div>
                   )}
                   {activeTab === 'info' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-2xl font-bold text-black">Kelola Informasi</h2><button onClick={() => setIsInfoModalOpen(true)} className="bg-black text-white px-4 py-2 font-serif text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2"><Plus size={16} /> Tambah</button></div>
                        <div className="grid grid-cols-1 gap-6">
                          {informations.map((info) => (
                             <div key={info.id} className="flex flex-col md:flex-row bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="md:w-48 h-48 md:h-auto bg-gray-100 relative shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-black"><img src={info.image} alt="cover" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/png'} /></div>
                                <div className="p-6 flex-1 flex flex-col">
                                   <div className="flex justify-between items-start mb-2"><span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{info.date}</span><button onClick={() => handleDeleteInfo(info.firebaseId)} className="text-gray-300 hover:text-red-600"><Trash2 size={18} /></button></div>
                                   <h3 className="font-serif font-bold text-xl text-black mb-3">{info.title}</h3>
                                   <p className="text-gray-600 font-serif text-sm line-clamp-2 mb-4">{info.content}</p>
                                </div>
                             </div>
                          ))}
                        </div>
                        <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Tambah Informasi">
                            <div className="space-y-4 font-serif">
                               <input type="text" placeholder="Judul" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none font-bold" value={newInfo.title} onChange={e => setNewInfo({...newInfo, title: e.target.value})} />
                               <input type="text" placeholder="URL Gambar (Link)" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none font-mono text-sm" value={newInfo.imageUrl} onChange={e => setNewInfo({...newInfo, imageUrl: e.target.value})} />
                               <textarea placeholder="Isi Konten" className="w-full border-2 border-gray-300 p-3 focus:border-black outline-none h-40 text-sm" value={newInfo.content} onChange={e => setNewInfo({...newInfo, content: e.target.value})}></textarea>
                               <button onClick={handleAddInfo} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">PUBLIKASIKAN</button>
                            </div>
                        </Modal>
                      </div>
                   )}
                   {activeTab === 'transaksi' && (
                      <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center"><h2 className="font-serif text-xl font-bold text-black">Jurnal Transaksi</h2><button onClick={() => setIsTransactionModalOpen(true)} className="bg-black text-white px-3 py-1 font-serif text-xs hover:bg-gray-800 shadow-sm flex items-center gap-2"><Plus size={14} /> Data Baru</button></div>
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-gray-100 text-black font-serif text-sm uppercase tracking-wider"><tr><th className="px-6 py-4 border-b-2 border-gray-200">Nama Transaksi</th><th className="px-6 py-4 border-b-2 border-gray-200">Aplikasi</th><th className="px-6 py-4 border-b-2 border-gray-200">Durasi</th><th className="px-6 py-4 border-b-2 border-gray-200">Kontak</th><th className="px-6 py-4 border-b-2 border-gray-200">Bonus</th><th className="px-6 py-4 border-b-2 border-gray-200">Status</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 text-sm">{transactions.map((t) => (<tr key={t.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-serif font-medium text-black">{t.name}</td><td className="px-6 py-4 font-serif text-gray-600">{t.app}</td><td className="px-6 py-4"><TimeDisplay targetDate={t.targetDate} status={t.status} /></td><td className="px-6 py-4 font-mono text-xs text-gray-500">{t.phone}<br/>{t.email}</td><td className="px-6 py-4 font-serif text-gray-600 italic">{t.bonus}</td><td className="px-6 py-4"><select value={t.status} onChange={(e) => handleStatusChange(t, e.target.value)} className="bg-transparent text-xs font-serif uppercase border border-gray-300 py-1 px-2 cursor-pointer hover:bg-white w-full"><option value="Aktif">Aktif</option><option value="Perbaikan">Perbaikan</option><option value="Mati">Mati</option><option value="Planning">Planning</option></select></td></tr>))}</tbody>
                          </table>
                        </div>
                        <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title="Input Transaksi">
                            <div className="space-y-4 font-serif">
                               <input type="text" placeholder="Nama Item" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.name} onChange={e => setNewTransaction({...newTransaction, name: e.target.value})} />
                               <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Aplikasi" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.app} onChange={e => setNewTransaction({...newTransaction, app: e.target.value})} /><input type="number" placeholder="Durasi (Hari)" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.durationDays} onChange={e => setNewTransaction({...newTransaction, durationDays: e.target.value})} /></div>
                               <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="No. HP" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.phone} onChange={e => setNewTransaction({...newTransaction, phone: e.target.value})} /><input type="text" placeholder="Email" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.email} onChange={e => setNewTransaction({...newTransaction, email: e.target.value})} /></div>
                               <input type="text" placeholder="Bonus" className="w-full border-2 border-gray-300 p-2 focus:border-black outline-none" value={newTransaction.bonus} onChange={e => setNewTransaction({...newTransaction, bonus: e.target.value})} />
                               <button onClick={handleAddTransaction} className="w-full bg-black text-white py-3 font-bold hover:bg-gray-800">SIMPAN DATA</button>
                            </div>
                        </Modal>
                      </div>
                   )}
                   {activeTab === 'traffic' && (
                      <div className="border-2 border-black bg-gray-50 p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                         <h2 className="font-serif text-lg text-gray-500 uppercase tracking-[0.2em] mb-8">Status Operasional</h2>
                         <div className="w-32 h-32 md:w-48 md:h-48 border-4 mx-auto flex items-center justify-center mb-6 bg-white border-black">{globalStatus === 'Aktif' && <Check size={80} className="text-black" strokeWidth={3} />}{globalStatus === 'Perbaikan' && <AlertTriangle size={80} className="text-black" strokeWidth={3} />}{globalStatus === 'Mati' && <XCircle size={80} className="text-black" strokeWidth={3} />}</div>
                         <h1 className="text-5xl font-serif font-bold text-black tracking-tight">{globalStatus}</h1>
                      </div>
                   )}
                </div>
             </div>
          </main>
        </>
      ) : (
        <div className="min-h-screen w-full bg-white text-black font-serif pb-20 overflow-y-auto">
           <div className="border-b-4 border-black py-6 px-4 mb-8 bg-white sticky top-0 z-50">
              <div className="max-w-5xl mx-auto flex justify-between items-end">
                 <div><h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-1">TOKO</h1><p className="text-[10px] md:text-xs font-mono text-gray-400 tracking-widest uppercase">Catalog & Status Monitor</p></div>
                 <button onClick={() => setView('admin')} className="text-xs font-mono text-gray-400 hover:text-black underline">[Admin Login]</button>
              </div>
           </div>
           <div className="max-w-5xl mx-auto px-4 space-y-16">
              <section className="text-center border-b-2 border-gray-100 pb-12">
                 <span className="inline-block px-3 py-1 bg-black text-white text-xs font-mono mb-4">SYSTEM STATUS</span>
                 <div className={`text-5xl md:text-8xl font-black uppercase tracking-widest mb-2 ${globalStatus === 'Aktif' ? 'text-green-700' : globalStatus === 'Perbaikan' ? 'text-yellow-600' : 'text-red-700'}`}>{globalStatus}</div>
                 <p className="text-gray-400 text-sm italic font-mono">Real-time update</p>
              </section>
              <section>
                 <h2 className="text-3xl font-bold italic border-b-4 border-black inline-block mb-8">Katalog Produk</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {catalog.map((item) => (
                         <div key={item.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-none">
                            <div className="flex justify-between items-start mb-4"><h3 className="font-bold text-xl">{item.name}</h3><span className="bg-gray-100 text-xs px-2 py-1 font-mono uppercase border border-gray-200">{item.app}</span></div>
                            <p className="text-gray-600 text-sm italic mb-6 line-clamp-3">"{item.desc}"</p>
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100"><span className="font-mono font-bold text-lg">{item.price}</span><button onClick={() => {setSelectedProduct(item); setIsPreviewModalOpen(true);}} className="text-xs font-bold underline hover:bg-black hover:text-white px-2 py-1">DETAIL &rarr;</button></div>
                         </div>
                     ))}
                 </div>
              </section>
              <section>
                  <h2 className="text-3xl font-bold italic border-b-4 border-black inline-block mb-8">Informasi</h2>
                  <div className="space-y-8">
                      {informations.map((info) => (
                          <div key={info.id} className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8 last:border-0">
                              <div className="md:w-1/3 aspect-video bg-gray-100 border border-gray-200 overflow-hidden shrink-0"><img src={info.image} alt="info" className="w-full h-full object-cover grayscale hover:grayscale-0" onError={(e) => e.target.src = 'https://placehold.co/600x400/png'} /></div>
                              <div className="md:w-2/3 flex flex-col"><span className="text-xs font-mono text-gray-400 mb-2 block">{info.date}</span><h3 className="text-2xl font-bold text-black mb-3">{info.title}</h3><p className="text-gray-600 leading-relaxed font-serif text-sm line-clamp-3 mb-4">{info.content}</p><div className="mt-auto"><button onClick={() => {setSelectedInfo(info); setIsReadMoreOpen(true);}} className="text-sm font-bold border-b-2 border-black hover:bg-black hover:text-white px-1 inline-block">BACA SELENGKAPNYA</button></div></div>
                          </div>
                      ))}
                  </div>
              </section>
              <section>
                 <h2 className="text-2xl font-bold italic mb-6">Live Transaksi</h2>
                 <div className="border-2 border-black bg-white overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                       <thead className="bg-gray-100 border-b-2 border-black font-mono text-xs uppercase"><tr><th className="px-4 py-3 border-r border-gray-300">Produk</th><th className="px-4 py-3 border-r border-gray-300">Waktu Tersisa</th><th className="px-4 py-3 text-center">Status</th></tr></thead>
                       <tbody className="divide-y divide-gray-200 text-sm">{transactions.map(t => (<tr key={t.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-bold border-r border-gray-200 w-1/3">{t.name}</td><td className="px-4 py-3 font-mono text-gray-600 border-r border-gray-200 w-1/3"><TimeDisplay targetDate={t.targetDate} status={t.status} /></td><td className="px-4 py-3 text-center w-1/3"><StatusBadge status={t.status} /></td></tr>))}</tbody>
                    </table>
                 </div>
              </section>
              <footer className="text-center pt-12 text-xs font-mono text-gray-400 border-t border-gray-100 mt-12">&copy; 2024 TOKO LEDGER.</footer>
           </div>
           <Modal isOpen={isReadMoreOpen} onClose={() => setIsReadMoreOpen(false)} title="Informasi Lengkap">
              {selectedInfo && (
                <div className="font-serif"><div className="w-full h-64 bg-gray-100 border border-gray-200 mb-6 overflow-hidden"><img src={selectedInfo.image} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/600x400/png'} /></div><span className="text-xs font-mono text-gray-500 mb-2 block">{selectedInfo.date}</span><h2 className="text-3xl font-bold mb-6">{selectedInfo.title}</h2><div className="text-gray-700 leading-loose whitespace-pre-wrap text-base">{selectedInfo.content}</div></div>
              )}
           </Modal>
           <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Detail Produk">
              {selectedProduct && (
                  <div className="font-serif"><div className="border-2 border-black p-6 bg-white relative"><div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4"><div className="w-16 h-16 bg-gray-100 flex items-center justify-center border border-gray-200"><ShoppingBag size={24}/></div><div><h2 className="text-xl font-bold">{selectedProduct.name}</h2><p className="text-sm text-gray-500 font-mono">{selectedProduct.app}</p></div></div><div className="bg-gray-50 p-4 border border-gray-100 mb-6 text-sm text-gray-600 leading-relaxed italic">"{selectedProduct.desc}"</div><div className="flex justify-between items-center"><div><p className="text-xs text-gray-400 uppercase">Harga</p><p className="text-2xl font-mono font-bold">{selectedProduct.price}</p></div><button className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 flex items-center gap-2"><Phone size={16} /> Hubungi Admin</button></div></div></div>
              )}
          </Modal>
        </div>
      )}
      {isMenuOpen && <div className="fixed inset-0 bg-black/80 z-30 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}
    </div>
  );
}