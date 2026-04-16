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
  LogOut, Activity, BarChart3, Percent, ArrowUpRight, Plus, Landmark, Printer, FileText
} from 'lucide-react';

/**
 * JUAN SANTOS BUSINESS v9.1 - SISTEMA CORPORATIVO COMPLETO
 * - Restaurada: Copia de Respaldo (Exportar a Excel).
 * - Generación de Recibos de Transacción (Imprimibles).
 * - Generación de Reporte Diario de Cierre de Caja (Imprimible).
 * - Función para Borrar/Restablecer Capital a Cero.
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-900 print:hidden">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-md p-8 sm:p-10 shadow-2xl border border-slate-100 animate-in zoom-in">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-blue-600/30"><Lock size={32} /></div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">JS Business</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">v9.1 Corporativo</p>
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [balance, setBalance] = useState({ dop: 0, usd: 0 });
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [tempCapital, setTempCapital] = useState({ dop: "", usd: "" });
  const [authData, setAuthData] = useState({ email: '', password: '', isRegistering: false, error: '', loading: false });
  const [printData, setPrintData] = useState(null);

  // --- LÓGICA FINANCIERA ---
  const metrics = useMemo(() => {
    const buys = transactions.filter(t => t.type === 'compra');
    const sells = transactions.filter(t => t.type === 'venta');
    const investedCapital = buys.reduce((acc, t) => acc + Number(t.total), 0);
    const totalUSDIn = buys.reduce((acc, t) => acc + Number(t.amount), 0);
    const avgBuyCost = totalUSDIn > 0 ? investedCapital / totalUSDIn : 59.10;
    const profit = sells.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - avgBuyCost)), 0);
    const roi = investedCapital > 0 ? (profit / investedCapital) * 100 : 0;
    return { profit, avgBuyCost, investedCapital, roi, buys, sells };
  }, [transactions]);

  // --- IMPRESIÓN EFECTO ---
  useEffect(() => {
    if (printData) {
      setTimeout(() => { window.print(); }, 300);
    }
  }, [printData]);

  useEffect(() => {
    const handleAfterPrint = () => setPrintData(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

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

  const handleResetCapital = async () => {
    if (window.confirm("⚠️ ¡PELIGRO! ¿Estás totalmente seguro de BORRAR A CERO el capital en caja e inventario?")) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: { dop: 0, usd: 0 } });
      setShowModal(null);
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

  const generateDailyReport = () => {
    const today = new Date().toLocaleDateString('es-DO');
    const todayTx = transactions.filter(t => t.date === today);
    setPrintData({ type: 'report', date: today, data: todayTx });
  };

  const exportCSV = () => {
    const headers = ["Fecha", "Cliente", "Operación", "Método", "USD$", "Tasa Real", "RD$ Total"];
    const rows = transactions.map(t => [
      t.date, 
      clients.find(c => c.id === t.clientId)?.name || 'Invitado', 
      t.type.toUpperCase(), 
      t.method || 'Efectivo',
      t.amount, 
      t.rate, 
      t.total
    ]);
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `JS_Business_Respaldo_${new Date().toLocaleDateString('es-DO')}.csv`);
    link.click();
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center print:hidden"><Activity className="text-blue-500 animate-spin" size={40} /></div>;
  if (!businessAuth) return <LoginPage isRegistering={authData.isRegistering} setIsRegistering={(v) => setAuthData({...authData, isRegistering: v})} handleAuth={handleAuth} email={authData.email} setEmail={(v) => setAuthData({...authData, email: v})} password={authData.password} setPassword={(v) => setAuthData({...authData, password: v})} error={authData.error} loading={authData.loading} />;

  return (
    <>
      {/* VISTA PRINCIPAL DE LA APP (SE OCULTA AL IMPRIMIR) */}
      <div className={`min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-x-hidden relative ${printData ? 'hidden' : 'block'} print:hidden`}>
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300 shadow-2xl border-r border-slate-800 ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-24'}`}>
          <div className="p-6 flex items-center justify-between font-black italic">
            {(isSidebarOpen || window.innerWidth >= 1024) && (
              <div className={`flex items-center gap-3 animate-in fade-in ${!isSidebarOpen && 'lg:hidden'}`}>
                <div className="bg-blue-600 p-2 rounded-xl"><DollarSign size={20} /></div>
                <h1 className="text-lg">JS BUSINESS</h1>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 hover:bg-slate-800 rounded-xl transition-all ${!isSidebarOpen && 'mx-auto'}`}>{isSidebarOpen ? <X /> : <Menu />}</button>
          </div>
          <nav className="flex-1 px-4 mt-10 space-y-3 font-bold text-[10px] uppercase tracking-widest">
             <NavItem icon={<LayoutDashboard size={22}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
             <NavItem icon={<Users size={22}/>} label="Directorio" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
             <NavItem icon={<ArrowLeftRight size={22}/>} label="Operaciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
          </nav>
          <div className="p-6 border-t border-slate-800"><button onClick={() => { setBusinessAuth(false); signOut(auth); }} className={`w-full flex items-center gap-4 p-4 text-slate-400 font-bold text-xs uppercase hover:text-white transition-all ${!isSidebarOpen && 'justify-center'}`}><LogOut size={20}/> {isSidebarOpen && "SALIR"}</button></div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-12 transition-all duration-500">
          {!isSidebarOpen && <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-4 left-4 z-30 p-3 bg-white shadow-xl rounded-2xl border border-slate-100 text-slate-900"><Menu size={24} /></button>}

          <div className="bg-slate-900 p-6 sm:p-10 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] text-white shadow-2xl mb-8 lg:mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group border border-slate-800">
             <div className="relative z-10 text-center lg:text-left w-full lg:w-auto">
                <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Terminal Activa</span></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none italic">Juan Santos Business</h2>
                <div className="mt-6 sm:mt-8 bg-white/5 p-5 sm:p-6 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-md">
                   <div className="text-center sm:text-left">
                     <p className="text-[9px] uppercase font-black opacity-40 tracking-widest mb-1">Interés Ganado (ROI)</p>
                     <p className="text-4xl sm:text-5xl font-black text-blue-400 tracking-tighter italic">{metrics.roi.toFixed(1)}%</p>
                   </div>
                   <div className="hidden sm:block h-12 w-px bg-white/10"></div>
                   <div className="w-full sm:flex-1 space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase opacity-60"><span>Meta Operativa</span><span>{Math.min(metrics.roi, 100).toFixed(0)}%</span></div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{width: `${Math.min(metrics.roi, 100)}%`}}></div></div>
                   </div>
                </div>
             </div>
             <div className="flex flex-col gap-4 relative z-10 w-full lg:w-auto">
               {/* BOTÓN RESTAURADO: COPIA DE RESPALDO (EXCEL) */}
               <button onClick={exportCSV} className="w-full lg:w-auto bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs tracking-widest uppercase hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 border border-emerald-500 shadow-xl"><Download size={18}/> Respaldar a Excel</button>
               
               <button onClick={generateDailyReport} className="w-full lg:w-auto bg-white/10 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs tracking-widest uppercase hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/10"><FileText size={18}/> Reporte Diario</button>
               <button onClick={() => setShowModal('transaction')} className="w-full lg:w-auto bg-blue-600 text-white px-8 py-5 rounded-[1.5rem] lg:rounded-[1.8rem] font-black text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all hover:bg-blue-700 flex items-center justify-center gap-3"><Plus size={20} /> Nueva Operación</button>
             </div>
             <Activity size={300} className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-1000 hidden lg:block" />
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8 lg:space-y-12 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 font-bold">
                 <StatBox label="Caja DOP Pesos" value={`RD$ ${balance.dop.toLocaleString()}`} onAction={() => setShowModal('update_capital')} color="text-slate-950" icon={<Wallet size={16}/>} />
                 <StatBox label="Stock USD Dólares" value={`$ ${balance.usd.toLocaleString()}`} onAction={() => setShowModal('update_capital')} color="text-slate-950" icon={<TrendingUp size={16}/>} />
                 <div className="bg-emerald-500 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all"><p className="text-[9px] uppercase opacity-80 font-black mb-1 tracking-widest">Utilidad Real</p><p className="text-xl sm:text-2xl font-black tracking-tighter italic leading-none">RD$ {metrics.profit.toLocaleString()}</p></div>
                 <div className="bg-blue-600 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all"><p className="text-[9px] uppercase opacity-80 font-black mb-1 tracking-widest text-center italic">Costo Prom. USD</p><p className="text-xl sm:text-2xl font-black tracking-tighter italic text-center leading-none">RD$ {metrics.avgBuyCost.toFixed(2)}</p></div>
              </div>
              
              <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-100 shadow-sm p-5 sm:p-10 font-bold">
                 <div className="flex justify-between items-center mb-8 lg:mb-10">
                   <h3 className="text-[10px] sm:text-[11px] uppercase text-slate-950 font-black tracking-[0.2em] border-l-4 border-blue-600 pl-4">Registro Maestro</h3>
                   <div className="flex gap-4">
                     <button onClick={generateDailyReport} className="text-[10px] uppercase text-blue-600 font-black underline flex items-center gap-2"><Printer size={14}/> Imprimir Cierre</button>
                   </div>
                 </div>
                 <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0"><table className="w-full text-left italic min-w-[700px]">
                   <thead><tr className="text-slate-950 uppercase text-[9px] sm:text-[10px] border-b-2 border-slate-100 tracking-widest font-black"><th className="pb-6">Cliente</th><th className="pb-6 text-center">Tipo</th><th className="pb-6 text-center">Método</th><th className="pb-6 text-right">Monto USD</th><th className="pb-6 text-right">Tasa Real</th><th className="pb-6 text-right">Total RD$</th><th className="pb-6 text-center">Acción</th></tr></thead>
                   <tbody className="divide-y divide-slate-50 text-sm text-slate-950">
                     {transactions.slice(0, 5).map(t => (
                       <tr key={t.id} className="hover:bg-slate-50 transition-all font-black group">
                         <td className="py-6">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}<div className="text-[8px] text-slate-400 mt-1 uppercase font-bold not-italic">{t.date}</div></td>
                         <td className="text-center"><span className={`px-3 py-1 rounded-xl text-[8px] sm:text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-blue-600 text-white shadow-md shadow-blue-200'}`}>{t.type}</span></td>
                         <td className="text-center text-[9px] sm:text-[10px] text-slate-500 uppercase">{t.method || 'Efectivo'}</td>
                         <td className="py-6 text-right font-black text-base sm:text-lg text-slate-950 italic">${Number(t.amount).toLocaleString()}</td>
                         <td className="py-6 text-right font-black text-slate-400">RD$ {Number(t.rate).toFixed(2)}</td>
                         <td className="py-6 text-right font-black text-lg sm:text-xl text-blue-600 tracking-tighter">RD$ {Number(t.total).toLocaleString()}</td>
                         <td className="py-6 text-center flex items-center justify-center gap-2">
                           <button onClick={() => setPrintData({type: 'receipt', data: t})} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Printer size={18}/></button>
                           <button onClick={() => handleDeleteTransaction(t)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table></div>
                 {transactions.length === 0 && <div className="p-20 text-center text-slate-200 uppercase font-black tracking-widest text-lg italic">Sin movimientos</div>}
              </div>
            </div>
          )}

          {showModal === 'transaction' && (
            <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
               <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-xl shadow-2xl animate-in slide-in-from-bottom duration-300 p-6 sm:p-12 overflow-y-auto max-h-[95vh]">
                  <div className="flex justify-between items-center mb-8 text-slate-950 font-black italic"><span className="text-xl sm:text-2xl uppercase tracking-tighter">Ejecutar Transacción</span><button onClick={() => setShowModal(null)} className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X/></button></div>
                  <div className="flex justify-end mb-4"><button onClick={() => setIsAddingNewClient(!isAddingNewClient)} className="text-[10px] text-blue-600 underline uppercase flex items-center gap-1 font-black"><UserPlus size={14}/> {isAddingNewClient ? "Lista de Socios" : "Registro Rápido"}</button></div>
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
                    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { clientId: clientId || 'Invitado', type, amount: amt, rate, total, method: f.method.value, timestamp: new Date().toISOString(), date: new Date().toLocaleDateString('es-DO') });
                    const newB = type === 'compra' ? { dop: balance.dop - total, usd: balance.usd + amt } : { dop: balance.dop + total, usd: balance.usd - amt };
                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                    setIsAddingNewClient(false);
                    setShowModal(null);
                    
                    // Imprimir recibo automáticamente
                    if(window.confirm("Operación guardada. ¿Deseas imprimir el recibo ahora?")){
                      setPrintData({type: 'receipt', data: { id: docRef.id, clientId: clientId || 'Invitado', type, amount: amt, rate, total, method: f.method.value, date: new Date().toLocaleDateString('es-DO') }});
                    }
                  }}>
                    {isAddingNewClient ? (
                      <div className="p-5 sm:p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                         <p className="text-[9px] uppercase font-black text-blue-600 mb-2 tracking-[0.2em]">Nuevo Socio</p>
                         <input required name="newName" placeholder="Nombre completo" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black shadow-inner outline-none focus:border-blue-500" />
                         <input required name="newPhone" placeholder="WhatsApp / Celular" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black shadow-inner outline-none focus:border-blue-500" />
                      </div>
                    ) : (
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Socio Comercial</label><select name="client" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none focus:border-blue-500 outline-none text-slate-950 font-bold"><option value="">Invitado / Público General</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Operación</label><select name="type" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic appearance-none"><option value="compra">Compra USD</option><option value="venta">Venta USD</option></select></div>
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Método</label><select name="method" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic appearance-none"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Monto (USD$)</label><input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xl font-black italic text-slate-950" /></div>
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic text-center block">Tasa Pactada</label><input required name="rate" type="number" step="0.01" defaultValue="59.35" className="w-full p-5 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] text-blue-700 text-2xl font-black text-center italic outline-none shadow-inner" /></div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.5rem] sm:rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all mt-4">Guardar e Imprimir</button>
                  </form>
               </div>
            </div>
          )}

          {showModal === 'update_capital' && (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
               <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-sm p-8 sm:p-10 shadow-2xl border border-slate-100 font-bold">
                  <h3 className="text-2xl font-black text-slate-950 mb-8 tracking-tighter text-center uppercase italic">Sincronizar Stock</h3>
                  <div className="space-y-6">
                     <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-950 italic">Añadir RD$ Pesos</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.dop} onChange={e => setTempCapital({...tempCapital, dop: e.target.value})} placeholder="0.00" /></div>
                     <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-950 italic">Añadir USD$ Stock</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.usd} onChange={e => setTempCapital({...tempCapital, usd: e.target.value})} placeholder="0.00" /></div>
                  </div>
                  <div className="flex gap-4 mt-6">
                     <button onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 italic bg-slate-100 rounded-2xl">Cerrar</button>
                     <button onClick={async () => {
                        const newB = { dop: balance.dop + (parseFloat(tempCapital.dop) || 0), usd: balance.usd + (parseFloat(tempCapital.usd) || 0) };
                        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                        setTempCapital({ dop: "", usd: "" }); setShowModal(null);
                     }} className="flex-1 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl italic">Añadir</button>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button onClick={handleResetCapital} className="w-full py-4 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"><Trash2 size={14}/> BORRAR TODO EL CAPITAL</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6 sm:y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-100 shadow-sm gap-4">
                 <h3 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-slate-950">Directorio</h3>
                 <button onClick={() => setShowModal('transaction')} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 italic"><UserPlus size={18}/> NUEVO SOCIO</button>
              </div>
              <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl overflow-hidden border-2 border-slate-100 text-slate-950">
                 <div className="overflow-x-auto"><table className="w-full text-left italic font-black min-w-[500px]">
                    <thead className="bg-slate-900 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest border-b border-slate-800">
                       <tr><th className="p-6 sm:p-8">Nombre</th><th className="p-6 sm:p-8">WhatsApp</th><th className="p-6 sm:p-8 text-center">Estatus</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {clients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-all font-black"><td className="p-6 sm:p-8 font-black text-lg sm:text-xl tracking-tighter uppercase">{c.name}</td><td className="p-6 sm:p-8 text-slate-500 font-bold flex items-center gap-2 text-sm not-italic font-black tracking-widest"><Phone size={14} className="text-blue-500" /> {c.phone}</td><td className="p-6 sm:p-8 text-center"><span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl text-[9px] uppercase font-black">ACTIVO</span></td></tr>
                       ))}
                    </tbody>
                 </table></div>
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
             <div className="animate-in slide-in-from-bottom-8 duration-700 bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm p-10 font-bold">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic text-slate-950">Todas las Operaciones</h3>
                  <div className="flex gap-4">
                    <button onClick={exportCSV} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"><Download size={16}/> Respaldo</button>
                    <button onClick={generateDailyReport} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md"><Printer size={16}/> Reporte Cierre</button>
                  </div>
                </div>
                 <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0"><table className="w-full text-left italic min-w-[700px]">
                   <thead><tr className="text-slate-950 uppercase text-[9px] sm:text-[10px] border-b-2 border-slate-100 tracking-widest font-black"><th className="pb-6">Cliente</th><th className="pb-6 text-center">Tipo</th><th className="pb-6 text-center">Método</th><th className="pb-6 text-right">USD$</th><th className="pb-6 text-right">Tasa</th><th className="pb-6 text-right">RD$</th><th className="pb-6 text-center">Acción</th></tr></thead>
                   <tbody className="divide-y divide-slate-50 text-sm text-slate-950">
                     {transactions.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50 transition-all font-black group">
                         <td className="py-6">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}<div className="text-[8px] text-slate-400 mt-1 uppercase font-bold not-italic">{t.date}</div></td>
                         <td className="text-center"><span className={`px-3 py-1 rounded-xl text-[8px] sm:text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>{t.type}</span></td>
                         <td className="text-center text-[9px] sm:text-[10px] text-slate-500 uppercase">{t.method || 'Efectivo'}</td>
                         <td className="py-6 text-right font-black text-base sm:text-lg text-slate-950 italic">${Number(t.amount).toLocaleString()}</td>
                         <td className="py-6 text-right font-black text-slate-400">RD$ {Number(t.rate).toFixed(2)}</td>
                         <td className="py-6 text-right font-black text-lg sm:text-xl text-blue-600 tracking-tighter">RD$ {Number(t.total).toLocaleString()}</td>
                         <td className="py-6 text-center flex justify-center gap-2"><button onClick={() => setPrintData({type: 'receipt', data: t})} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Printer size={18}/></button><button onClick={() => handleDeleteTransaction(t)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table></div>
             </div>
          )}

        </main>
      </div>

      {/* --- SECCIÓN EXCLUSIVA DE IMPRESIÓN --- */}
      {printData && (
        <div className="hidden print:block bg-white text-black font-sans p-8 absolute inset-0 z-[9999]">
          
          {printData.type === 'receipt' && (
            <div className="max-w-2xl mx-auto border-2 border-black p-10 rounded-2xl">
              <div className="text-center mb-10 border-b-4 border-black pb-6">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">JUAN SANTOS</h1>
                <p className="text-xl font-bold uppercase tracking-[0.3em]">Business Financial</p>
                <p className="text-sm font-bold mt-2">RNC: 1-23-45678-9 | Tel: (809) 000-0000</p>
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-widest text-center mb-8 border-y-2 border-black py-2">Recibo de Operación</h2>
              
              <div className="grid grid-cols-2 gap-4 text-sm font-bold mb-10">
                <div><p className="text-gray-500 uppercase text-[10px]">Fecha:</p><p className="text-lg">{printData.data.date}</p></div>
                <div className="text-right"><p className="text-gray-500 uppercase text-[10px]">Ticket #:</p><p className="text-lg">{printData.data.id?.substring(0,8).toUpperCase()}</p></div>
                <div className="col-span-2"><p className="text-gray-500 uppercase text-[10px]">Cliente:</p><p className="text-2xl uppercase">{clients.find(c => c.id === printData.data.clientId)?.name || 'Cliente Casual'}</p></div>
              </div>

              <table className="w-full text-left font-black text-lg mb-10 border-t-2 border-b-2 border-black">
                <thead><tr className="border-b-2 border-black"><th className="py-4">DESCRIPCIÓN</th><th className="py-4 text-right">MONTO</th></tr></thead>
                <tbody>
                  <tr><td className="py-4 uppercase">{printData.data.type} DE DÓLARES</td><td className="py-4 text-right">USD$ {Number(printData.data.amount).toLocaleString()}</td></tr>
                  <tr><td className="py-4 uppercase text-sm">TASA CAMBIARIA</td><td className="py-4 text-right text-sm">RD$ {Number(printData.data.rate).toFixed(2)}</td></tr>
                  <tr><td className="py-4 uppercase text-sm">MÉTODO PAGO</td><td className="py-4 text-right text-sm uppercase">{printData.data.method || 'Efectivo'}</td></tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center bg-gray-100 p-6 rounded-2xl border-2 border-black">
                <span className="text-xl font-black uppercase">TOTAL (RD$):</span>
                <span className="text-4xl font-black">RD$ {Number(printData.data.total).toLocaleString()}</span>
              </div>

              <div className="mt-20 pt-10 border-t-2 border-black flex justify-between px-10 text-center font-bold text-sm">
                <div><div className="w-48 border-b border-black mb-2"></div>Firma Autorizada</div>
                <div><div className="w-48 border-b border-black mb-2"></div>Firma Cliente</div>
              </div>
            </div>
          )}

          {printData.type === 'report' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-end border-b-4 border-black pb-6 mb-10">
                <div>
                  <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">JUAN SANTOS</h1>
                  <p className="text-lg font-bold uppercase tracking-[0.3em]">Cierre de Caja Operativo</p>
                </div>
                <div className="text-right font-bold text-xl uppercase">Fecha: <br/>{printData.date}</div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-10">
                 <div className="border-2 border-black p-6 rounded-2xl"><p className="text-xs uppercase font-black text-gray-500">Capital DOP Final</p><p className="text-3xl font-black">RD$ {balance.dop.toLocaleString()}</p></div>
                 <div className="border-2 border-black p-6 rounded-2xl"><p className="text-xs uppercase font-black text-gray-500">Stock USD Final</p><p className="text-3xl font-black">USD$ {balance.usd.toLocaleString()}</p></div>
                 <div className="border-2 border-black p-6 rounded-2xl bg-gray-100"><p className="text-xs uppercase font-black text-gray-500">Operaciones Hoy</p><p className="text-3xl font-black">{printData.data.length}</p></div>
              </div>

              <h2 className="text-xl font-black uppercase tracking-widest mb-4">Detalle de Movimientos Diarios</h2>
              <table className="w-full text-left font-bold text-sm border-2 border-black">
                <thead className="bg-gray-100 border-b-2 border-black"><tr className="uppercase text-xs"><th className="p-4">Hora/ID</th><th className="p-4">Cliente</th><th className="p-4">Tipo</th><th className="p-4">Método</th><th className="p-4 text-right">USD$</th><th className="p-4 text-right">Tasa</th><th className="p-4 text-right">RD$ Total</th></tr></thead>
                <tbody className="divide-y divide-gray-300">
                  {printData.data.map(t => (
                    <tr key={t.id}>
                      <td className="p-4 text-xs font-mono">{t.id.substring(0,6)}</td>
                      <td className="p-4 uppercase">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}</td>
                      <td className="p-4 uppercase">{t.type}</td>
                      <td className="p-4 uppercase">{t.method || 'Efectivo'}</td>
                      <td className="p-4 text-right">${Number(t.amount).toLocaleString()}</td>
                      <td className="p-4 text-right">{Number(t.rate).toFixed(2)}</td>
                      <td className="p-4 text-right font-black">RD$ {Number(t.total).toLocaleString()}</td>
                    </tr>
                  ))}
                  {printData.data.length === 0 && <tr><td colSpan="7" className="p-10 text-center uppercase text-gray-400">No hay movimientos registrados hoy</td></tr>}
                </tbody>
              </table>
              
              <div className="mt-20 pt-10 text-center font-bold text-xs uppercase tracking-widest border-t-2 border-black">
                <p>Reporte generado automáticamente por JS Business Financial System</p>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};

// COMPONENTES AUXILIARES
const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all duration-500 group ${active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/50 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'} ${!isOpen && 'justify-center p-4'}`}>
    <div className={`${active ? 'scale-110' : 'group-hover:rotate-12'} transition-transform`}>{icon}</div>
    {isOpen && <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>}
  </button>
);

const StatBox = ({ label, value, onAction, color, icon }) => (
  <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
     <div className="flex justify-between items-center mb-1"><p className={`text-[9px] uppercase font-black tracking-widest ${color}`}>{label}</p><div className="opacity-20">{icon}</div></div>
     <p className="text-xl sm:text-2xl font-black italic tracking-tighter truncate">{value}</p>
     <button onClick={onAction} className="text-[9px] text-blue-600 font-black uppercase mt-4 underline italic hover:text-blue-800 text-left w-fit transition-all">Sincronizar Stock</button>
  </div>
);

export default App;
