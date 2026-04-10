import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  query 
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Menu, 
  X, 
  Calendar, 
  Settings, 
  UserPlus, 
  Trash2, 
  Wallet, 
  Plus, 
  Phone, 
  AlertCircle, 
  Download,
  Cloud, 
  Lock, 
  Mail, 
  LogOut, 
  Activity, 
  BarChart3, 
  Percent,
  ArrowUpRight
} from 'lucide-react';

/**
 * JUAN SANTOS BUSINESS v5.6 - ESTABLE & CONECTADO
 * - Lógica de Spread (Ganancia) basada en Costo Promedio Ponderado.
 * - Recuperación de contraseña vía Email funcional.
 * - Conexión oficial verificada a Firebase juansantosbusiness-47ff1.
 */

// --- CONFIGURACIÓN OFICIAL RAFAEL SANTOS ---
const firebaseConfig = {
  apiKey: "AIzaSyARQ70nwt87z8cD4n8ZWQLG0ZN4LXyI9vM",
  authDomain: "juansantosbusiness-47ff1.firebaseapp.com",
  projectId: "juansantosbusiness-47ff1",
  storageBucket: "juansantosbusiness-47ff1.firebasestorage.app",
  messagingSenderId: "752459930835",
  appId: "1:752459930835:web:8228c56019214a6fe7c826"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'js-business-cloud-prod'; 

// --- COMPONENTES DE INTERFAZ ---

const LoginPage = ({ isRegistering, setIsRegistering, handleAuth, email, setEmail, password, setPassword, error, loading }) => {
  const [resetSent, setResetSent] = useState(false);
  
  const handleReset = async () => {
    if (!email) {
      alert("Por favor, escribe tu correo para enviarte el enlace.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      alert("Error: El correo no está registrado.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8 text-center text-slate-900">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-blue-600/30">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">JS Business</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">Seguridad Cloud v5.6</p>
        </div>

        {resetSent ? (
          <div className="text-center p-6 bg-blue-50 rounded-2xl animate-in fade-in">
            <p className="text-blue-700 font-bold text-sm italic">¡Enlace enviado! Revisa tu bandeja de entrada.</p>
            <button onClick={() => setResetSent(false)} className="mt-4 text-xs font-black uppercase underline text-slate-400">Volver al login</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase flex items-center gap-2 border border-rose-100 animate-pulse">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Usuario</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm text-slate-900 shadow-inner" 
                placeholder="juan@negocio.com" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                {!isRegistering && (
                  <button type="button" onClick={handleReset} className="text-[9px] font-black text-blue-600 hover:underline italic">
                    ¿Olvidaste la clave?
                  </button>
                )}
              </div>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm text-slate-900 shadow-inner" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Conectando..." : isRegistering ? "Crear Mi Cuenta Business" : "Iniciar Sesión Business"}
            </button>
          </form>
        )}

        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="w-full mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center hover:underline"
        >
          {isRegistering ? "¿Ya tienes cuenta? Entra aquí" : "¿Eres nuevo socio? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---

const App = () => {
  const [user, setUser] = useState(null);
  const [businessAuth, setBusinessAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [authData, setAuthData] = useState({ email: '', password: '', isRegistering: false, error: '', loading: false });
  const [balance, setBalance] = useState({ dop: 0, usd: 0 });
  const [rates, setRates] = useState({ buy: 58.50, sell: 59.35 });
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tempCapital, setTempCapital] = useState({ dop: "", usd: "" });
  const [isEditingRates, setIsEditingRates] = useState(false);

  // Inteligencia Financiera: Lógica de Spread y Ganancia
  const metrics = useMemo(() => {
    const buys = transactions.filter(t => t.type === 'compra');
    const totalUSDIn = buys.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalDOPPaid = buys.reduce((acc, t) => acc + Number(t.total), 0);
    const avgBuyCost = totalUSDIn > 0 ? totalDOPPaid / totalUSDIn : rates.buy;

    const sells = transactions.filter(t => t.type === 'venta');
    const totalUSDOut = sells.reduce((acc, t) => acc + Number(t.amount), 0);
    const profit = sells.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - avgBuyCost)), 0);
    
    const spread = totalUSDOut > 0 ? profit / totalUSDOut : (rates.sell - rates.buy);
    return { profit, spread, avgBuyCost };
  }, [transactions, rates]);

  // 1. Inicialización de Autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => { 
      setUser(currUser); 
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronización con Firestore (Regla de Rutas Estrictas)
  useEffect(() => {
    if (!user || !businessAuth) return;

    // Ruta de Clientes
    const unsubC = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), (s) => 
      setClients(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // Ruta de Transacciones
    const unsubT = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    });

    // Ruta de Ajustes Globales
    const unsubG = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), (s) => { 
      if(s.exists()){ 
        setBalance(s.data().balance || { dop: 0, usd: 0 }); 
        setRates(s.data().rates || { buy: 58.50, sell: 59.35 }); 
      } else {
        setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { 
          balance: { dop: 0, usd: 0 }, 
          rates: { buy: 58.50, sell: 59.35 } 
        });
      }
    });

    return () => { unsubC(); unsubT(); unsubG(); };
  }, [user, businessAuth]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthData({...authData, loading: true, error: ''});
    try {
      if (authData.isRegistering) {
        await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
      }
      setBusinessAuth(true);
    } catch (err) {
      setAuthData({...authData, loading: false, error: 'Credenciales inválidas. Verifica tus datos.'});
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar la sesión del sistema?")) {
      setBusinessAuth(false);
      signOut(auth);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
       <Activity className="text-blue-500 animate-spin" size={50} />
    </div>
  );

  if (!businessAuth) return (
    <LoginPage 
      isRegistering={authData.isRegistering} 
      setIsRegistering={(v) => setAuthData({...authData, isRegistering: v})} 
      handleAuth={handleAuthSubmit} 
      email={authData.email} 
      setEmail={(v) => setAuthData({...authData, email: v})} 
      password={authData.password} 
      setPassword={(v) => setAuthData({...authData, password: v})} 
      error={authData.error} 
      loading={authData.loading} 
    />
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-slate-900 text-white transition-all duration-500 flex flex-col fixed h-full z-40 shadow-2xl`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30">
                <DollarSign size={20} strokeWidth={4} />
              </div>
              <h1 className="font-black italic text-xl uppercase tracking-tighter">JS Business</h1>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-800 rounded-xl transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-10 space-y-3 font-bold text-[10px] uppercase tracking-widest">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'opacity-40 hover:bg-slate-800 hover:opacity-100'}`}><LayoutDashboard size={20}/> {isSidebarOpen && "Escritorio"}</button>
           <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'clients' ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'opacity-40 hover:bg-slate-800 hover:opacity-100'}`}><Users size={20}/> {isSidebarOpen && "Clientes"}</button>
           <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'transactions' ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'opacity-40 hover:bg-slate-800 hover:opacity-100'}`}><ArrowLeftRight size={20}/> {isSidebarOpen && "Operaciones"}</button>
        </nav>

        <div className="p-6 border-t border-slate-800/50">
           <div className={`bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
             <Cloud size={20} className="text-emerald-500" />
             {isSidebarOpen && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Nube Conectada</p>}
           </div>
           <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-4 text-slate-400 font-bold text-[10px] uppercase hover:text-white transition-all ${!isSidebarOpen && 'justify-center'}`}>
             <LogOut size={20}/> {isSidebarOpen && "Salir del Sistema"}
           </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-80' : 'ml-24'} p-10 lg:p-16`}>
        {/* BANNER PRO */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 p-12 rounded-[3.5rem] text-white shadow-2xl mb-12 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative group">
           <div className="relative z-10 text-center md:text-left">
              <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Juan Santos Business • Live Cloud</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none italic drop-shadow-lg">Dashboard Pro</h2>
              <p className="text-blue-100 font-bold mt-4 opacity-80 uppercase text-[10px] tracking-[0.3em]">Ingeniería Financiera v5.6</p>
           </div>
           <div className="flex gap-4 relative z-10">
             <button onClick={() => setShowModal('transaction')} className="bg-white text-blue-700 px-10 py-5 rounded-[1.8rem] font-black text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all">Nueva Operación</button>
           </div>
           <Activity size={250} className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-bold">
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                 <p className="text-[10px] uppercase opacity-40 mb-2 tracking-widest flex justify-between items-center">Efectivo DOP <Wallet size={14} /></p>
                 <p className="text-3xl font-black tracking-tighter italic">RD$ {balance.dop.toLocaleString()}</p>
                 <button onClick={() => setShowModal('update_capital')} className="mt-4 text-[9px] text-blue-600 underline uppercase font-black">+ Fondeo</button>
               </div>
               <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 hover:shadow-xl transition-all group">
                 <p className="text-[10px] uppercase text-emerald-600 mb-2 tracking-widest flex justify-between items-center">Stock USD <TrendingUp size={14} /></p>
                 <p className="text-3xl font-black tracking-tighter italic text-emerald-700">${balance.usd.toLocaleString()}</p>
                 <button onClick={() => setShowModal('update_capital')} className="mt-4 text-[9px] text-emerald-600 underline uppercase font-black">+ Stock</button>
               </div>
               <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl hover:-translate-y-1 transition-all">
                 <p className="text-[10px] uppercase opacity-40 mb-2 tracking-widest flex justify-between items-center">Ganancia Real <BarChart3 size={14} /></p>
                 <p className="text-3xl font-black tracking-tighter italic">RD$ {metrics.profit.toLocaleString()}</p>
                 <p className="text-[9px] opacity-40 mt-2 italic font-medium uppercase tracking-widest">Costo USD: RD$ {metrics.avgBuyCost.toFixed(2)}</p>
               </div>
               <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl hover:-translate-y-1 transition-all">
                 <p className="text-[10px] uppercase opacity-60 mb-2 tracking-widest flex justify-between items-center">Spread Prom. <Percent size={14} /></p>
                 <p className="text-3xl font-black tracking-tighter italic">RD$ {metrics.spread.toFixed(2)}</p>
                 <p className="text-[9px] opacity-60 mt-2 italic font-medium uppercase tracking-widest">RD$ por Dólar</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               {/* PIZARRA DE TASAS */}
               <div className="bg-white p-10 rounded-[3.5rem] border shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-10 font-black uppercase text-[10px] tracking-widest">
                       <span className="flex items-center gap-2"><Settings size={16} className="text-slate-300" /> Tasa de Referencia</span>
                       <button onClick={async () => { 
                         if(isEditingRates) {
                           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { rates }); 
                         }
                         setIsEditingRates(!isEditingRates); 
                       }} className="text-blue-600 underline decoration-2">{isEditingRates ? "GUARDAR" : "EDITAR"}</button>
                    </div>
                    <div className="space-y-10">
                       <div>
                         <p className="text-[10px] font-black uppercase opacity-40 mb-3 ml-1 tracking-widest">Compra</p>
                         {isEditingRates ? (
                           <input 
                            type="number" 
                            step="0.01" 
                            className="text-6xl font-black w-full outline-none text-blue-600 bg-blue-50/50 p-2 rounded-2xl" 
                            value={rates.buy} 
                            onChange={e => setRates({...rates, buy: parseFloat(e.target.value)})} 
                           />
                         ) : (
                           <p className="text-7xl font-black tracking-tighter leading-none italic">{rates.buy.toFixed(2)}</p>
                         )}
                       </div>
                       <div className="h-px bg-slate-100 w-full"></div>
                       <div>
                         <p className="text-[10px] font-black uppercase opacity-40 mb-3 ml-1 tracking-widest">Venta</p>
                         {isEditingRates ? (
                           <input 
                            type="number" 
                            step="0.01" 
                            className="text-6xl font-black w-full outline-none text-blue-600 bg-blue-50/50 p-2 rounded-2xl" 
                            value={rates.sell} 
                            onChange={e => setRates({...rates, sell: parseFloat(e.target.value)})} 
                           />
                         ) : (
                           <p className="text-7xl font-black tracking-tighter leading-none italic">{rates.sell.toFixed(2)}</p>
                         )}
                       </div>
                    </div>
                  </div>
               </div>

               {/* RECIENTES */}
               <div className="lg:col-span-2 bg-white rounded-[3.5rem] border shadow-sm p-10 font-bold overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black uppercase text-[10px] opacity-40 tracking-widest italic">Actividad Reciente</h3>
                    <button onClick={() => setActiveTab('transactions')} className="text-[10px] text-blue-600 font-black uppercase underline decoration-2">Ver Historial Maestro</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm italic">
                      <thead>
                        <tr className="opacity-40 uppercase text-[9px] border-b tracking-widest">
                          <th className="pb-6">Cliente</th>
                          <th className="pb-6 text-center">Tipo</th>
                          <th className="pb-6 text-right">Monto USD$</th>
                          <th className="pb-6 text-right">RD$ Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.slice(0, 6).map(t => (
                          <tr key={t.id} className="group hover:bg-slate-50 transition-all font-black">
                            <td className="py-6 text-slate-900 leading-none">
                              {clients.find(c => c.id === t.clientId)?.name || 'Invitado Casual'}
                              <div className="text-[8px] opacity-40 font-bold uppercase mt-1 tracking-widest">{t.date}</div>
                            </td>
                            <td className="text-center">
                              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="py-6 text-right font-black text-lg tracking-tighter">${t.amount.toLocaleString()}</td>
                            <td className="py-6 text-right font-black text-slate-900 leading-none">RD$ {t.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {transactions.length === 0 && <div className="p-20 text-center opacity-10 italic uppercase font-black text-xs tracking-widest">Sin operaciones registradas</div>}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* MODAL TRANSACCION */}
        {showModal === 'transaction' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 font-black">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-white animate-in zoom-in p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-10 italic text-2xl uppercase tracking-tighter">
                <span>Nueva Transacción Business</span>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X/></button>
              </div>
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const f = e.target;
                const amt = parseFloat(f.amount.value);
                const rate = parseFloat(f.rate.value);
                const type = f.type.value;
                const total = amt * rate;

                if(type === 'compra' && total > balance.dop) { alert("DOP insuficiente en caja"); return; }
                if(type === 'venta' && amt > balance.usd) { alert("Stock USD insuficiente"); return; }

                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { 
                  clientId: f.client.value || 'guest', 
                  type, amount: amt, rate, total, 
                  timestamp: new Date().toISOString(), 
                  date: new Date().toLocaleDateString('es-DO') 
                });

                const newB = type === 'compra' 
                  ? { dop: balance.dop - total, usd: balance.usd + amt } 
                  : { dop: balance.dop + total, usd: balance.usd - amt };
                
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                setShowModal(null);
              }}>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 italic ml-1">Elegir Cliente</label>
                  <select name="client" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none focus:border-blue-500 outline-none transition-all">
                    <option value="">Invitado / Casual</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 italic ml-1">Operación</label>
                    <select name="type" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none focus:border-blue-500 outline-none transition-all">
                      <option value="compra">Compra (Pesos Out)</option>
                      <option value="venta">Venta (Dólares Out)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 italic ml-1">Monto USD</label>
                    <input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xl italic focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 italic block mb-2">Tasa Pactada RD$</label>
                  <input required name="rate" type="number" step="0.01" defaultValue={rates.buy} className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] text-blue-700 text-4xl text-center italic outline-none shadow-inner" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 active:scale-95 transition-all mt-6 shadow-blue-600/30">Sincronizar Operación</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL FONDEO / STOCK */}
        {showModal === 'update_capital' && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in border border-slate-100 font-bold">
                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter text-center uppercase leading-none italic">Sincronizar Stock Cloud</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40 leading-none">Añadir RD$ Pesos</label>
                     <input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center shadow-inner" value={tempCapital.dop} onChange={e => setTempCapital({...tempCapital, dop: e.target.value})} placeholder="0.00" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40 leading-none">Añadir USD$ Stock</label>
                     <input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center shadow-inner" value={tempCapital.usd} onChange={e => setTempCapital({...tempCapital, usd: e.target.value})} placeholder="0.00" />
                   </div>
                </div>
                <div className="flex gap-4 mt-10">
                   <button onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cerrar</button>
                   <button onClick={async () => {
                      const newB = { 
                        dop: balance.dop + (parseFloat(tempCapital.dop) || 0), 
                        usd: balance.usd + (parseFloat(tempCapital.usd) || 0) 
                      };
                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                      setTempCapital({ dop: "", usd: "" });
                      setShowModal(null);
                   }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20">Confirmar Inyección</button>
                </div>
             </div>
          </div>
        )}

        {/* TABLA CLIENTES */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-[3.5rem] border shadow-sm p-12 animate-in slide-in-from-bottom-8">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Directorio de Clientes</h3>
                <button onClick={() => setShowModal('client')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all">
                  <UserPlus size={18}/> NUEVO CLIENTE
                </button>
             </div>
             <table className="w-full text-left italic">
                <thead><tr className="opacity-40 uppercase text-[9px] border-b tracking-widest"><th className="pb-6 p-4">Nombre Completo</th><th className="pb-6 p-4">WhatsApp / Contacto</th><th className="pb-6 p-4 text-center">Acciones</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-6 font-black text-xl text-slate-900">{c.name}</td>
                      <td className="p-6 font-bold text-slate-400 flex items-center gap-2"><Phone size={14}/> {c.phone}</td>
                      <td className="p-6 text-center"><button className="text-[10px] font-black text-blue-600 uppercase underline">Ver Perfil</button></td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {clients.length === 0 && <div className="p-20 text-center opacity-10 italic uppercase font-black text-xs tracking-widest leading-none">No hay clientes registrados en la nube</div>}
          </div>
        )}

        {/* MODAL CLIENTE */}
        {showModal === 'client' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in border border-slate-100 font-black italic">
                <h3 className="text-2xl uppercase mb-8">Registrar Socio / Cliente</h3>
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const f = e.target;
                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), {
                    name: f.name.value, phone: f.phone.value, timestamp: new Date().toISOString()
                  });
                  setShowModal(null);
                }}>
                   <div className="space-y-4 font-bold not-italic">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase opacity-40 ml-1">Nombre Completo</label>
                        <input required name="name" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 transition-all" placeholder="Juan Pérez" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase opacity-40 ml-1">Teléfono / WhatsApp</label>
                        <input required name="phone" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 transition-all" placeholder="809-000-0000" />
                      </div>
                   </div>
                   <div className="flex gap-4 mt-10">
                      <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                      <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Guardar en Cloud</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* TABLA HISTORIAL COMPLETO */}
        {activeTab === 'transactions' && (
           <div className="bg-white rounded-[3.5rem] border shadow-sm p-12 animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                   <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Historial Maestro</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Registro centralizado de operaciones</p>
                </div>
                <button onClick={() => {
                   const headers = ["Fecha", "Cliente", "Tipo", "USD$", "Tasa", "RD$ Total"];
                   const rows = transactions.map(t => [t.date, clients.find(c => c.id === t.clientId)?.name || 'Invitado', t.type.toUpperCase(), t.amount, t.rate, t.total]);
                   const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
                   window.open(encodeURI(csv));
                }} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all">
                  <Download size={18}/> EXPORTAR EXCEL
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left italic">
                  <thead><tr className="opacity-40 uppercase text-[9px] border-b tracking-widest"><th className="pb-6 p-4">Fecha</th><th className="pb-6 p-4">Cliente</th><th className="pb-6 p-4">Tipo</th><th className="pb-6 p-4 text-right">USD$</th><th className="pb-6 p-4 text-right">RD$ Total</th></tr></thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-all font-black">
                        <td className="p-6 text-slate-400 uppercase text-[10px]">{t.date}</td>
                        <td className="p-6 text-xl text-slate-900">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}</td>
                        <td className="p-6 italic"><span className={`px-4 py-1 rounded-xl text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{t.type}</span></td>
                        <td className="p-6 text-right text-xl tracking-tighter">${Number(t.amount).toLocaleString()}</td>
                        <td className="p-6 text-right text-slate-900">RD$ {Number(t.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
