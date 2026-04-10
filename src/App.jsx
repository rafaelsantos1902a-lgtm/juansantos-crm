import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, query, getDoc 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  LayoutDashboard, Users, ArrowLeftRight, PlusCircle, Search, 
  TrendingUp, TrendingDown, DollarSign, Menu, X, Calendar, 
  Settings, CheckCircle, UserPlus, Trash2, Wallet, Plus, 
  Phone, Landmark, Banknote, AlertCircle, Save, Download,
  Cloud, Lock, Mail, LogOut, KeyRound, LineChart, Percent,
  Activity, BarChart3, ArrowUpRight
} from 'lucide-react';

/**
 * JUAN SANTOS BUSINESS v5.2 - PRODUCCIÓN FINAL
 * - Conexión oficial a Firebase juansantosbusiness-47ff1.
 * - Inteligencia de Spread (Margen Real) y Costo Promedio.
 * - Sistema de Seguridad y Recuperación de Acceso.
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

const DOMINICAN_BANKS = ["Banreservas", "Banco Popular", "Banco BHD", "Scotiabank", "Banco Santa Cruz", "Asociación Popular"];

// --- COMPONENTE LOGIN ---
const LoginPage = ({ isRegistering, setIsRegistering, handleAuth, email, setEmail, password, setPassword, error, loading }) => {
  const [resetSent, setResetSent] = useState(false);
  
  const handleReset = async () => {
    if (!email) { alert("Ingresa tu email primero."); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      alert("Error: Correo no encontrado en el sistema.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-blue-600/30">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">JS Business</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">Acceso Cloud v5.2</p>
        </div>

        {resetSent ? (
          <div className="text-center p-6 bg-blue-50 rounded-2xl animate-in fade-in">
            <p className="text-blue-700 font-bold text-sm italic">Revisa tu correo electrónico para cambiar la contraseña.</p>
            <button onClick={() => setResetSent(false)} className="mt-4 text-xs font-black uppercase underline text-slate-400">Volver</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            {error && <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase flex items-center gap-2 border border-rose-100"><AlertCircle size={16} /> {error}</div>}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Usuario</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="juan@negocio.com" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                {!isRegistering && <button type="button" onClick={handleReset} className="text-[9px] font-black text-blue-600 hover:underline italic">¿Olvidaste la clave?</button>}
              </div>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="••••••••" />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Conectando..." : isRegistering ? "Registrar Mi Negocio" : "Iniciar Sesión"}
            </button>
          </form>
        )}

        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center hover:underline">
          {isRegistering ? "¿Ya tienes cuenta? Entra" : "¿Nuevo socio? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
};

// --- APP ---
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

  // Inteligencia Financiera: Lógica de Spread y Ganancia Real
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (curr) => { 
      setUser(curr); 
      setLoading(false); 
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !businessAuth) return;

    const unsubC = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), (s) => 
      setClients(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubT = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    });

    const unsubG = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), (s) => { 
      if(s.exists()){ 
        setBalance(s.data().balance || { dop: 0, usd: 0 }); 
        setRates(s.data().rates || { buy: 58.50, sell: 59.35 }); 
      } else {
        setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: { dop: 0, usd: 0 }, rates: { buy: 58.50, sell: 59.35 } });
      }
    });
    return () => { unsubC(); unsubT(); unsubG(); };
  }, [user, businessAuth]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthData({...authData, loading: true, error: ''});
    try {
      if (authData.isRegistering) await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      else await signInWithEmailAndPassword(auth, authData.email, authData.password);
      setBusinessAuth(true);
    } catch (err) {
      setAuthError("Acceso denegado.");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Activity className="text-blue-500 animate-spin" size={40} /></div>;
  if (!businessAuth) return <LoginPage isRegistering={authData.isRegistering} setIsRegistering={(v) => setAuthData({...authData, isRegistering: v})} handleAuth={handleAuth} email={authData.email} setEmail={(v) => setAuthData({...authData, email: v})} password={authData.password} setPassword={(v) => setAuthData({...authData, password: v})} error={authData.error} loading={authData.loading} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-slate-900 text-white flex flex-col fixed h-full z-40 transition-all duration-500`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && <div className="flex items-center gap-3"><div className="bg-blue-600 p-2.5 rounded-xl"><DollarSign size={20} strokeWidth={4} /></div><h1 className="font-black italic uppercase">JS Business</h1></div>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-800 rounded-xl">{isSidebarOpen ? <X /> : <Menu />}</button>
        </div>
        <nav className="flex-1 px-4 mt-10 space-y-3 font-bold text-[10px] uppercase tracking-widest">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-xl' : 'opacity-40 hover:bg-slate-800 transition-all'}`}><LayoutDashboard size={20}/> {isSidebarOpen && "Dashboard"}</button>
           <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${activeTab === 'clients' ? 'bg-blue-600 shadow-xl' : 'opacity-40 hover:bg-slate-800 transition-all'}`}><Users size={20}/> {isSidebarOpen && "Clientes"}</button>
           <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${activeTab === 'transactions' ? 'bg-blue-600 shadow-xl' : 'opacity-40 hover:bg-slate-800 transition-all'}`}><ArrowLeftRight size={20}/> {isSidebarOpen && "Operaciones"}</button>
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={() => { setBusinessAuth(false); signOut(auth); }} className="w-full flex items-center gap-4 p-4 text-slate-400 font-bold text-xs uppercase hover:text-white transition-all"><LogOut size={20}/> {isSidebarOpen && "Salir"}</button></div>
      </aside>

      <main className={`flex-1 ${isSidebarOpen ? 'ml-80' : 'ml-24'} p-10 lg:p-16 transition-all duration-500`}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] text-white shadow-2xl mb-12 flex justify-between items-center relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest">Cloud Connected • Live</span></div>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Juan Santos Business</h2>
              <p className="text-blue-100 font-bold mt-2 opacity-80 uppercase text-xs tracking-widest">Ingeniería Financiera v5.2</p>
           </div>
           <button onClick={() => setShowModal('transaction')} className="bg-white text-blue-700 px-10 py-5 rounded-[1.5rem] font-black text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10">Nueva Operación</button>
           <Activity size={250} className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-bold">
               <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-between hover:shadow-xl transition-all"><p className="text-[10px] uppercase opacity-40 mb-1 tracking-widest flex justify-between items-center">Efectivo DOP <Wallet size={14}/></p><p className="text-2xl font-black italic">RD$ {balance.dop.toLocaleString()}</p></div>
               <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col justify-between hover:shadow-xl transition-all"><p className="text-[10px] uppercase text-emerald-600 mb-1 tracking-widest flex justify-between items-center">Stock USD <TrendingUp size={14}/></p><p className="text-2xl font-black text-emerald-700 italic">${balance.usd.toLocaleString()}</p></div>
               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all"><p className="text-[10px] uppercase opacity-40 mb-1 tracking-widest flex justify-between items-center">Ganancia Real <BarChart3 size={14}/></p><p className="text-2xl font-black italic tracking-tighter">RD$ {metrics.profit.toLocaleString()}</p></div>
               <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all"><p className="text-[10px] uppercase opacity-60 mb-1 tracking-widest flex justify-between items-center">Spread Prom. <Percent size={14}/></p><p className="text-2xl font-black italic tracking-tighter">RD$ {metrics.spread.toFixed(2)}</p></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col justify-between font-bold">
                  <div>
                    <div className="flex justify-between items-center mb-10 uppercase text-[10px] tracking-widest"><span className="flex items-center gap-2"><Settings size={18} className="text-slate-300"/> Tasa Sugerida</span><button onClick={async () => { if(isEditingRates) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { rates }); setIsEditingRates(!isEditingRates); }} className="text-blue-600 underline">{isEditingRates ? "Guardar" : "Editar"}</button></div>
                    <div className="space-y-10">
                       <div><p className="text-[10px] opacity-40 mb-2 uppercase">Compra</p>{isEditingRates ? <input type="number" step="0.01" className="text-6xl font-black w-full" value={rates.buy} onChange={e => setRates({...rates, buy: parseFloat(e.target.value)})} /> : <p className="text-7xl font-black tracking-tighter italic leading-none">{rates.buy.toFixed(2)}</p>}</div>
                       <div className="h-px bg-slate-100"></div>
                       <div><p className="text-[10px] opacity-40 mb-2 uppercase">Venta</p>{isEditingRates ? <input type="number" step="0.01" className="text-6xl font-black w-full" value={rates.sell} onChange={e => setRates({...rates, sell: parseFloat(e.target.value)})} /> : <p className="text-7xl font-black tracking-tighter italic leading-none">{rates.sell.toFixed(2)}</p>}</div>
                    </div>
                  </div>
               </div>
               <div className="lg:col-span-2 bg-white rounded-[3.5rem] border shadow-sm p-10 font-bold overflow-hidden"><h3 className="text-[10px] uppercase opacity-40 tracking-widest mb-10 italic font-black">Actividad Reciente</h3><div className="overflow-x-auto"><table className="w-full text-left italic"><thead><tr className="opacity-40 uppercase text-[9px] border-b tracking-widest"><th className="pb-6">Cliente</th><th className="pb-6 text-center">Operación</th><th className="pb-6 text-right">Monto USD$</th><th className="pb-6 text-right">Total RD$</th></tr></thead><tbody className="divide-y divide-slate-50 text-sm">{transactions.slice(0, 5).map(t => (<tr key={t.id} className="hover:bg-slate-50 transition-all font-black"><td className="py-6">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}<div className="text-[8px] opacity-40 mt-1 uppercase">{t.date}</div></td><td className="text-center"><span className={`px-4 py-1.5 rounded-xl text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{t.type}</span></td><td className="py-6 text-right text-lg tracking-tighter">${t.amount.toLocaleString()}</td><td className="py-6 text-right font-black">RD$ {t.total.toLocaleString()}</td></tr>))}</tbody></table></div></div>
            </div>
          </div>
        )}

        {showModal === 'transaction' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 font-black">
             <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-white animate-in zoom-in p-12 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10 italic text-2xl uppercase tracking-tighter"><span>Operación Business</span><button onClick={() => setShowModal(null)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X/></button></div>
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const f = e.target;
                  const amt = parseFloat(f.amount.value);
                  const rate = parseFloat(f.rate.value);
                  const type = f.type.value;
                  const total = amt * rate;
                  if(type === 'compra' && total > balance.dop) { alert("DOP insuficiente"); return; }
                  if(type === 'venta' && amt > balance.usd) { alert("USD insuficiente"); return; }
                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { clientId: f.client.value, type, amount: amt, rate, total, timestamp: new Date().toISOString(), date: new Date().toLocaleDateString('es-DO') });
                  const newB = type === 'compra' ? { dop: balance.dop - total, usd: balance.usd + amt } : { dop: balance.dop + total, usd: balance.usd - amt };
                  await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                  setShowModal(null);
                }}>
                  <div className="space-y-2"><label className="text-[10px] uppercase tracking-widest opacity-40 italic">Seleccionar Cliente</label><select name="client" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none"><option value="">Invitado / Casual</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-5"><div className="space-y-2"><label className="text-[10px] uppercase tracking-widest opacity-40 italic">Operación</label><select name="type" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none transition-all"><option value="compra">Compra</option><option value="venta">Venta</option></select></div><div className="space-y-2"><label className="text-[10px] uppercase tracking-widest opacity-40 italic">Monto USD</label><input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xl italic" /></div></div>
                  <div className="space-y-2 text-center"><label className="text-[10px] uppercase opacity-40 italic block mb-2">Tasa RD$</label><input required name="rate" type="number" step="0.01" defaultValue={rates.buy} className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] text-blue-700 text-4xl text-center italic outline-none shadow-inner" /></div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 active:scale-95 transition-all mt-6 shadow-blue-600/30">Sincronizar Operación</button>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
