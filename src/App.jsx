import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, query 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  LayoutDashboard, Users, ArrowLeftRight, TrendingUp, TrendingDown, 
  DollarSign, Menu, X, Calendar, Settings, UserPlus, Trash2, 
  Wallet, Phone, AlertCircle, Download, Cloud, Lock, Mail, 
  LogOut, Activity, BarChart3, Percent, ArrowUpRight, Plus, Landmark
} from 'lucide-react';

/**
 * JUAN SANTOS BUSINESS v8.0 - EDICIÓN ULTRA-RESPONSIVA
 * - Diseño adaptable para Celular, Tablet y PC.
 * - Reversión de Stock Automática al borrar operaciones.
 * - Registro de Cliente Rápido y Métodos de Pago.
 * - ROI (%) e Interés visual en alta resolución.
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
const appId = 'js-business-cloud-v8-responsive'; 

// --- COMPONENTE LOGIN ---
const LoginPage = ({ isRegistering, setIsRegistering, handleAuth, email, setEmail, password, setPassword, error, loading }) => {
  const [resetSent, setResetSent] = useState(false);
  const handleReset = async () => {
    if (!email) { alert("Escribe tu correo para recuperar clave."); return; }
    try { await sendPasswordResetEmail(auth, email); setResetSent(true); } 
    catch (err) { alert("Error: Correo no registrado."); }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-md p-8 sm:p-10 shadow-2xl border border-slate-100 animate-in zoom-in">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-blue-600/30"><Lock size={32} /></div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">JS Business</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">v8.0 Móvil & Cloud</p>
        </div>
        {resetSent ? (
          <div className="text-center p-6 bg-blue-50 rounded-2xl animate-in fade-in">
            <p className="text-blue-700 font-bold text-sm italic">Revisa tu correo para cambiar la clave.</p>
            <button onClick={() => setResetSent(false)} className="mt-4 text-xs font-black uppercase underline">Volver</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            {error && <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase flex items-center gap-2 border border-rose-100 animate-pulse"><AlertCircle size={16} /> {error}</div>}
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Email / Usuario</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="juan@negocio.com" /></div>
            <div className="space-y-1"><div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Clave</label><button type="button" onClick={handleReset} className="text-[9px] font-black text-blue-600 hover:underline italic">¿Olvidaste la clave?</button></div><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="••••••••" /></div>
            <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95">{loading ? "Conectando..." : isRegistering ? "Registrar Negocio" : "Entrar al Sistema"}</button>
          </form>
        )}
        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center hover:underline">{isRegistering ? "¿Ya tienes cuenta? Entra" : "¿Nuevo socio? Regístrate aquí"}</button>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const [user, setUser] = useState(null);
  const [businessAuth, setBusinessAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Por defecto cerrado en móvil
  const [showModal, setShowModal] = useState(null);
  const [balance, setBalance] = useState({ dop: 0, usd: 0 });
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [tempCapital, setTempCapital] = useState({ dop: "", usd: "" });
  const [authData, setAuthData] = useState({ email: '', password: '', isRegistering: false, error: '', loading: false });

  // --- LÓGICA FINANCIERA ---
  const metrics = useMemo(() => {
    const buys = transactions.filter(t => t.type === 'compra');
    const sells = transactions.filter(t => t.type === 'venta');
    const investedCapital = buys.reduce((acc, t) => acc + Number(t.total), 0);
    const totalUSDIn = buys.reduce((acc, t) => acc + Number(t.amount), 0);
    const avgBuyCost = totalUSDIn > 0 ? investedCapital / totalUSDIn : 59.10;
    const profit = sells.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - avgBuyCost)), 0);
    const roi = investedCapital > 0 ? (profit / investedCapital) * 100 : 0;
    return { profit, avgBuyCost, investedCapital, roi };
  }, [transactions]);

  // --- SINCRONIZACIÓN ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (curr) => { setUser(curr); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !businessAuth) return;
    const unsubC = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), (s) => setClients(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubT = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))));
    const unsubG = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), (s) => { 
      if(s.exists()){ setBalance(s.data().balance); } 
      else { setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: { dop: 0, usd: 0 } }); }
    });
    return () => { unsubC(); unsubT(); unsubG(); };
  }, [user, businessAuth]);

  // Cerrar sidebar al cambiar de pestaña en móvil
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [activeTab]);

  // --- ACCIONES ---
  const handleDeleteTransaction = async (tx) => {
    if (window.confirm(`¿BORRAR Y REVERTIR? \n\nSe devolverá el stock y ajustará el balance automáticamente.`)) {
      const revertBalance = tx.type === 'compra'
        ? { dop: balance.dop + tx.total, usd: balance.usd - tx.amount }
        : { dop: balance.dop - tx.total, usd: balance.usd + tx.amount };
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: revertBalance });
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id));
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthData({...authData, loading: true, error: ''});
    try {
      if (authData.isRegistering) await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      else await signInWithEmailAndPassword(auth, authData.email, authData.password);
      setBusinessAuth(true);
    } catch (err) { setAuthData({...authData, loading: false, error: 'Acceso denegado.'}); }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Activity className="text-blue-500 animate-spin" size={40} /></div>;
  if (!businessAuth) return <LoginPage isRegistering={authData.isRegistering} setIsRegistering={(v) => setAuthData({...authData, isRegistering: v})} handleAuth={handleAuth} email={authData.email} setEmail={(v) => setAuthData({...authData, email: v})} password={authData.password} setPassword={(v) => setAuthData({...authData, password: v})} error={authData.error} loading={authData.loading} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-x-hidden relative">
      
      {/* OVERLAY PARA MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR RESPONSIVO */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300 shadow-2xl border-r border-slate-800 
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-24'}`}>
        
        <div className="p-6 flex items-center justify-between font-black italic">
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <div className={`flex items-center gap-3 animate-in fade-in ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="bg-blue-600 p-2 rounded-xl"><DollarSign size={20} /></div>
              <h1 className="text-lg">JS BUSINESS</h1>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className={`p-2 hover:bg-slate-800 rounded-xl transition-all ${!isSidebarOpen && 'mx-auto'}`}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="flex-1 px-4 mt-10 space-y-3 font-bold text-[10px] uppercase tracking-widest">
           <NavItem icon={<LayoutDashboard size={22}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
           <NavItem icon={<Users size={22}/>} label="Directorio" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
           <NavItem icon={<ArrowLeftRight size={22}/>} label="Operaciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-6 border-t border-slate-800">
           <button onClick={() => { setBusinessAuth(false); signOut(auth); }} className={`w-full flex items-center gap-4 p-4 text-slate-400 font-bold text-xs uppercase hover:text-white transition-all ${!isSidebarOpen && 'justify-center'}`}>
             <LogOut size={20}/> {isSidebarOpen && "SALIR"}
           </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-12 transition-all duration-500">
        
        {/* BOTÓN HAMBURGUESA PARA MÓVIL (CUANDO EL SIDEBAR ESTÁ CERRADO) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-3 bg-white shadow-xl rounded-2xl border border-slate-100 text-slate-900">
            <Menu size={24} />
          </button>
        )}

        {/* BANNER PRINCIPAL RESPONSIVO */}
        <div className="bg-slate-900 p-6 sm:p-10 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] text-white shadow-2xl mb-8 lg:mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group border border-slate-800">
           <div className="relative z-10 text-center lg:text-left w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ledger Financial Active</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none italic">Juan Santos Business</h2>
              
              <div className="mt-6 sm:mt-8 bg-white/5 p-5 sm:p-6 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-md">
                 <div className="text-center sm:text-left">
                   <p className="text-[9px] uppercase font-black opacity-40 tracking-widest mb-1">Interés Ganado (ROI)</p>
                   <p className="text-4xl sm:text-5xl font-black text-blue-400 tracking-tighter italic">{metrics.roi.toFixed(1)}%</p>
                 </div>
                 <div className="hidden sm:block h-12 w-px bg-white/10"></div>
                 <div className="w-full sm:flex-1 space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase opacity-60"><span>Meta Semanal</span><span>{Math.min(metrics.roi, 100).toFixed(0)}%</span></div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{width: `${Math.min(metrics.roi, 100)}%`}}></div>
                    </div>
                 </div>
              </div>
           </div>
           <button onClick={() => setShowModal('transaction')} className="w-full lg:w-auto bg-blue-600 text-white px-8 py-5 rounded-[1.5rem] lg:rounded-[1.8rem] font-black text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10 hover:bg-blue-700 flex items-center justify-center gap-3">
             <Plus size={20} /> Nueva Operación
           </button>
           <Activity size={300} className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-1000 hidden lg:block" />
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 lg:space-y-12 animate-in fade-in">
            {/* KPI CARDS ADAPTABLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 font-bold">
               <StatBox label="Caja DOP Pesos" value={`RD$ ${balance.dop.toLocaleString()}`} onAction={() => setShowModal('update_capital')} color="text-slate-950" icon={<Wallet size={16}/>} />
               <StatBox label="Stock USD Dólares" value={`$ ${balance.usd.toLocaleString()}`} onAction={() => setShowModal('update_capital')} color="text-slate-950" icon={<TrendingUp size={16}/>} />
               
               <div className="bg-emerald-500 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all">
                  <p className="text-[9px] uppercase opacity-80 font-black mb-1 tracking-widest">Utilidad Real</p>
                  <p className="text-xl sm:text-2xl font-black tracking-tighter italic leading-none">RD$ {metrics.profit.toLocaleString()}</p>
               </div>
               <div className="bg-blue-600 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all">
                  <p className="text-[9px] uppercase opacity-80 font-black mb-1 tracking-widest text-center italic">Costo Promedio USD</p>
                  <p className="text-xl sm:text-2xl font-black tracking-tighter italic text-center leading-none">RD$ {metrics.avgBuyCost.toFixed(2)}</p>
               </div>
            </div>
            
            {/* REGISTRO MAESTRO RESPONSIVO */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-100 shadow-sm p-5 sm:p-10 font-bold">
               <h3 className="text-[10px] sm:text-[11px] uppercase text-slate-950 font-black tracking-[0.2em] mb-8 lg:mb-10 border-l-4 border-blue-600 pl-4">Registro Maestro de Operaciones</h3>
               <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
                 <table className="w-full text-left italic min-w-[700px]">
                   <thead>
                     <tr className="text-slate-950 uppercase text-[9px] sm:text-[10px] border-b-2 border-slate-100 tracking-widest font-black">
                       <th className="pb-6">Cliente</th>
                       <th className="pb-6 text-center">Tipo</th>
                       <th className="pb-6 text-center">Método</th>
                       <th className="pb-6 text-right">Monto USD</th>
                       <th className="pb-6 text-right">Tasa Real</th>
                       <th className="pb-6 text-right">Total RD$</th>
                       <th className="pb-6 w-10"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 text-sm text-slate-950">
                     {transactions.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50 transition-all font-black group">
                         <td className="py-6">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}<div className="text-[8px] text-slate-400 mt-1 uppercase font-bold not-italic">{t.date}</div></td>
                         <td className="text-center"><span className={`px-3 py-1 rounded-xl text-[8px] sm:text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-blue-600 text-white shadow-md shadow-blue-200'}`}>{t.type}</span></td>
                         <td className="text-center text-[9px] sm:text-[10px] text-slate-500 uppercase">{t.method || 'Efectivo'}</td>
                         <td className="py-6 text-right font-black text-base sm:text-lg text-slate-950 italic">${Number(t.amount).toLocaleString()}</td>
                         <td className="py-6 text-right font-black text-slate-400">RD$ {Number(t.rate).toFixed(2)}</td>
                         <td className="py-6 text-right font-black text-lg sm:text-xl text-blue-600 tracking-tighter">RD$ {Number(t.total).toLocaleString()}</td>
                         <td className="py-6 text-right"><button onClick={() => handleDeleteTransaction(t)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               {transactions.length === 0 && <div className="p-20 text-center text-slate-200 uppercase font-black tracking-widest text-lg italic">Sin movimientos registrados</div>}
            </div>
          </div>
        )}

        {/* MODALES ADAPTABLES AL CELULAR */}
        {showModal === 'transaction' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
             <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-xl shadow-2xl animate-in slide-in-from-bottom duration-300 p-6 sm:p-12 overflow-y-auto max-h-[95vh]">
                <div className="flex justify-between items-center mb-8 text-slate-950 font-black italic">
                   <span className="text-xl sm:text-2xl uppercase tracking-tighter">Ejecutar Transacción</span>
                   <button onClick={() => setShowModal(null)} className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X/></button>
                </div>
                
                <div className="flex justify-end mb-4">
                  <button onClick={() => setIsAddingNewClient(!isAddingNewClient)} className="text-[10px] text-blue-600 underline uppercase flex items-center gap-1 font-black"><UserPlus size={14}/> {isAddingNewClient ? "Lista de Socios" : "Registro Rápido"}</button>
                </div>

                <form className="space-y-5 sm:space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const f = e.target;
                  let clientId = f.client?.value;
                  if (isAddingNewClient) {
                    const newC = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), { name: f.newName.value, phone: f.newPhone.value, timestamp: new Date().toISOString() });
                    clientId = newC.id;
                  }
                  const amt = parseFloat(f.amount.value);
                  const rate = parseFloat(f.rate.value);
                  const type = f.type.value;
                  const total = amt * rate;

                  if(type === 'compra' && total > balance.dop) { alert(`ERROR: Fondos insuficientes en Pesos.`); return; }
                  if(type === 'venta' && amt > balance.usd) { alert(`ERROR: No hay stock suficiente en Dólares.`); return; }

                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { clientId, type, amount: amt, rate, total, method: f.method.value, timestamp: new Date().toISOString(), date: new Date().toLocaleDateString('es-DO') });
                  const newB = type === 'compra' ? { dop: balance.dop - total, usd: balance.usd + amt } : { dop: balance.dop + total, usd: balance.usd - amt };
                  await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                  setIsAddingNewClient(false);
                  setShowModal(null);
                }}>
                  {isAddingNewClient ? (
                    <div className="p-5 sm:p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                       <p className="text-[9px] uppercase font-black text-blue-600 mb-2 tracking-[0.2em]">Nuevo Socio Cloud</p>
                       <input required name="newName" placeholder="Nombre completo" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black shadow-inner outline-none focus:border-blue-500" />
                       <input required name="newPhone" placeholder="WhatsApp / Celular" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black shadow-inner outline-none focus:border-blue-500" />
                    </div>
                  ) : (
                    <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Socio Comercial</label><select name="client" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none focus:border-blue-500 outline-none text-slate-950 font-bold"><option value="">¿Quién realiza la operación?</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Operación</label><select name="type" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic appearance-none"><option value="compra">Compra USD</option><option value="venta">Venta USD</option></select></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Método</label><select name="method" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic appearance-none"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option></select></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Monto (USD$)</label><input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xl font-black italic text-slate-950" /></div>
                    <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic text-center block">Tasa Real Pactada</label><input required name="rate" type="number" step="0.01" defaultValue="59.35" className="w-full p-5 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] text-blue-700 text-2xl font-black text-center italic outline-none shadow-inner" /></div>
                  </div>
                  
                  <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.5rem] sm:rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all mt-4">Guardar en Cloud</button>
                </form>
             </div>
          </div>
        )}

        {showModal === 'update_capital' && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
             <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-sm p-8 sm:p-10 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-300">
                <h3 className="text-2xl font-black text-slate-950 mb-8 tracking-tighter text-center uppercase italic">Sincronizar Stock</h3>
                <div className="space-y-6">
                   <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-950 italic">RD$ Pesos (+/-)</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.dop} onChange={e => setTempCapital({...tempCapital, dop: e.target.value})} placeholder="0.00" /></div>
                   <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-950 italic">USD$ Stock (+/-)</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.usd} onChange={e => setTempCapital({...tempCapital, usd: e.target.value})} placeholder="0.00" /></div>
                </div>
                <div className="flex gap-4 mt-10">
                   <button onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 italic">Cerrar</button>
                   <button onClick={async () => {
                      const newB = { dop: balance.dop + (parseFloat(tempCapital.dop) || 0), usd: balance.usd + (parseFloat(tempCapital.usd) || 0) };
                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                      setTempCapital({ dop: "", usd: "" }); setShowModal(null);
                   }} className="flex-1 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl italic">Confirmar</button>
                </div>
             </div>
          </div>
        )}

        {/* DIRECTORIO DE CLIENTES RESPONSIVO */}
        {activeTab === 'clients' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6 sm:y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-100 shadow-sm gap-4">
               <h3 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-slate-950">Directorio Cloud</h3>
               <button onClick={() => setShowModal('transaction')} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 italic"><UserPlus size={18}/> NUEVO SOCIO</button>
            </div>
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl overflow-hidden border-2 border-slate-100 text-slate-950">
               <div className="overflow-x-auto">
                 <table className="w-full text-left italic font-black min-w-[500px]">
                    <thead className="bg-slate-900 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest border-b border-slate-800">
                       <tr><th className="p-6 sm:p-8">Socio Comercial</th><th className="p-6 sm:p-8">WhatsApp</th><th className="p-6 sm:p-8 text-center">Cloud Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {clients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-all font-black">
                             <td className="p-6 sm:p-8 font-black text-lg sm:text-xl tracking-tighter uppercase">{c.name}</td>
                             <td className="p-6 sm:p-8 text-slate-500 font-bold flex items-center gap-2 text-sm not-italic font-black tracking-widest"><Phone size={14} className="text-blue-500" /> {c.phone}</td>
                             <td className="p-6 sm:p-8 text-center"><span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl text-[9px] uppercase font-black">VERIFICADO</span></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// COMPONENTES AUXILIARES
const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all duration-500 group ${
      active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/50 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
    } ${!isOpen && 'justify-center p-4'}`}
  >
    <div className={`${active ? 'scale-110' : 'group-hover:rotate-12'} transition-transform`}>{icon}</div>
    {isOpen && <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>}
  </button>
);

const StatBox = ({ label, value, onAction, color, icon }) => (
  <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
     <div className="flex justify-between items-center mb-1">
        <p className={`text-[9px] uppercase font-black tracking-widest ${color}`}>{label}</p>
        <div className="opacity-20">{icon}</div>
     </div>
     <p className="text-xl sm:text-2xl font-black italic tracking-tighter truncate">{value}</p>
     <button onClick={onAction} className="text-[9px] text-blue-600 font-black uppercase mt-4 underline italic hover:text-blue-800 text-left w-fit transition-all">Sincronizar Stock</button>
  </div>
);

export default App;
