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
 * JUAN SANTOS BUSINESS FINANCIAL v11.0
 * - Recibos limpios sin firmas (informativos).
 * - Etiquetas actualizadas: "Número de Transacción".
 * - Eliminación de versión en impresos.
 * - Soporte total para celular, tablet y PC.
 */

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
const appId = 'js-business-cloud-v11-final'; 

// --- COMPONENTES ---

const LoginPage = ({ isRegistering, setIsRegistering, handleAuth, email, setEmail, password, setPassword, error, loading }) => {
  const [resetSent, setResetSent] = useState(false);
  const handleReset = async () => {
    if (!email) { alert("Ingresa tu correo para recuperar clave."); return; }
    try { await sendPasswordResetEmail(auth, email); setResetSent(true); } 
    catch (err) { alert("Error: Correo no registrado."); }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-900 print:hidden">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-slate-100 animate-in zoom-in">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl"><Lock size={32} /></div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none text-center">Juan Santos<br/>Business Financial</h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-4">Acceso Corporativo Seguro</p>
        </div>
        {resetSent ? (
          <div className="text-center p-6 bg-blue-50 rounded-2xl animate-in fade-in">
            <p className="text-blue-700 font-bold text-sm italic">Enlace enviado. Revisa tu correo.</p>
            <button onClick={() => setResetSent(false)} className="mt-4 text-xs font-black uppercase underline">Volver</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            {error && <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase flex items-center gap-2 border border-rose-100 animate-pulse"><AlertCircle size={16} /> {error}</div>}
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Email / Usuario</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm shadow-inner" placeholder="juan@negocio.com" /></div>
            <div className="space-y-1"><div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Clave</label><button type="button" onClick={handleReset} className="text-[9px] font-black text-blue-600 hover:underline italic">¿Olvidaste la clave?</button></div><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm shadow-inner" placeholder="••••••••" /></div>
            <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">{loading ? "Conectando..." : isRegistering ? "Registrar Empresa" : "Entrar al Sistema"}</button>
          </form>
        )}
        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center hover:underline">{isRegistering ? "¿Ya tienes cuenta? Entra" : "¿Nueva cuenta de empresa? Regístrate aquí"}</button>
      </div>
    </div>
  );
};

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
    const avgBuyCost = totalUSDIn > 0 ? investedCapital / totalUSDIn : 59.50;
    const profit = sells.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - avgBuyCost)), 0);
    const roi = investedCapital > 0 ? (profit / investedCapital) * 100 : 0;
    return { profit, avgBuyCost, investedCapital, roi, buys, sells };
  }, [transactions]);

  // --- IMPRESIÓN ---
  useEffect(() => {
    if (printData) {
      setTimeout(() => { window.print(); }, 400);
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
    if (window.confirm(`⚠️ CONFIRMAR REVERSIÓN \n\nEsta operación devolverá el inventario y pesos a la caja automáticamente.`)) {
      const revertBalance = tx.type === 'compra'
        ? { dop: balance.dop + tx.total, usd: balance.usd - tx.amount }
        : { dop: balance.dop - tx.total, usd: balance.usd + tx.amount };
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: revertBalance });
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id));
    }
  };

  const handleDeleteClient = async (client) => {
    if (window.confirm(`⚠️ ADVERTENCIA DE SEGURIDAD \n\n¿Estás seguro de ELIMINAR al cliente "${client.name}"?\nSe perderá su contacto, pero sus operaciones pasadas se mantendrán registradas.`)) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', client.id));
    }
  };

  const handleResetCapital = async () => {
    if (window.confirm("🔴 ACCIÓN IRREVERSIBLE: ¿Deseas borrar TODO el capital y ponerlo en CERO?")) {
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
    
    // Calcular métricas exactas del día
    const dailySells = todayTx.filter(t => t.type === 'venta');
    const dailyProfit = dailySells.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - metrics.avgBuyCost)), 0);
    const dailyCapitalSold = dailySells.reduce((acc, t) => acc + (Number(t.amount) * metrics.avgBuyCost), 0);
    const dailyROI = dailyCapitalSold > 0 ? (dailyProfit / dailyCapitalSold) * 100 : 0;

    setPrintData({ 
      type: 'report', 
      date: today, 
      data: todayTx,
      dailyProfit,
      dailyROI
    });
  };

  const exportCSV = () => {
    const headers = ["Fecha", "Cliente", "Tipo", "Método", "USD$", "Tasa", "Total RD$"];
    const rows = transactions.map(t => [t.date, clients.find(c => c.id === t.clientId)?.name || 'Invitado', t.type.toUpperCase(), t.method || 'Efectivo', t.amount, t.rate, t.total]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JS_Respaldo_${new Date().getTime()}.csv`);
    link.click();
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center print:hidden"><Activity className="text-blue-500 animate-spin" size={40} /></div>;
  if (!businessAuth) return <LoginPage isRegistering={authData.isRegistering} setIsRegistering={(v) => setAuthData({...authData, isRegistering: v})} handleAuth={handleAuth} email={authData.email} setEmail={(v) => setAuthData({...authData, email: v})} password={authData.password} setPassword={(v) => setAuthData({...authData, password: v})} error={authData.error} loading={authData.loading} />;

  return (
    <>
      <div className={`min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-x-hidden relative ${printData ? 'hidden' : 'block'} print:hidden`}>
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300 shadow-2xl border-r border-slate-800 ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-24'}`}>
          <div className="p-6 flex items-center justify-between font-black italic">
            {(isSidebarOpen || window.innerWidth >= 1024) && (
              <div className={`flex items-center gap-3 animate-in fade-in ${!isSidebarOpen && 'lg:hidden'}`}>
                <div className="bg-blue-600 p-2 rounded-xl"><DollarSign size={20} /></div>
                <h1 className="text-sm leading-tight">JUAN SANTOS<br/>BUSINESS FINANCIAL</h1>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`p-2 hover:bg-slate-800 rounded-xl transition-all ${!isSidebarOpen && 'mx-auto'}`}>{isSidebarOpen ? <X /> : <Menu />}</button>
          </div>
          <nav className="flex-1 px-4 mt-10 space-y-3 font-bold text-[10px] uppercase tracking-widest">
             <NavItem icon={<LayoutDashboard size={22}/>} label="Escritorio" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
             <NavItem icon={<Users size={22}/>} label="Socios" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
             <NavItem icon={<ArrowLeftRight size={22}/>} label="Operaciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
          </nav>
          <div className="p-6 border-t border-slate-800"><button onClick={() => { setBusinessAuth(false); signOut(auth); }} className={`w-full flex items-center gap-4 p-4 text-slate-400 font-bold text-xs uppercase hover:text-white transition-all ${!isSidebarOpen && 'justify-center'}`}><LogOut size={20}/> {isSidebarOpen && "SALIR"}</button></div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-12 transition-all duration-500">
          {!isSidebarOpen && <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-4 left-4 z-30 p-3 bg-white shadow-xl rounded-2xl border border-slate-100 text-slate-900"><Menu size={24} /></button>}

          <div className="bg-slate-900 p-6 sm:p-10 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] text-white shadow-2xl mb-8 lg:mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group border border-slate-800">
             <div className="relative z-10 text-center lg:text-left w-full lg:w-auto">
                <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Servicio en Línea</span></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none italic">Juan Santos Business Financial</h2>
                <div className="mt-8 bg-white/5 p-5 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-md">
                   <div>
                     <p className="text-[9px] uppercase font-black opacity-40 tracking-widest mb-1">Interés Ganado (ROI)</p>
                     <p className="text-4xl sm:text-5xl font-black text-blue-400 tracking-tighter italic">{metrics.roi.toFixed(1)}%</p>
                   </div>
                   <div className="hidden sm:block h-12 w-px bg-white/10"></div>
                   <div className="w-full sm:flex-1 space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase opacity-60"><span>Crecimiento de Capital</span><span>{Math.min(metrics.roi, 100).toFixed(0)}%</span></div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_#3b82f6]" style={{width: `${Math.min(metrics.roi, 100)}%`}}></div></div>
                   </div>
                </div>
             </div>
             <div className="flex flex-col gap-3 relative z-10 w-full lg:w-auto">
               <button onClick={exportCSV} className="w-full bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg"><Download size={18}/> Exportar Datos</button>
               <button onClick={generateDailyReport} className="w-full bg-white/10 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/10"><FileText size={18}/> Reporte Diario</button>
               <button onClick={() => setShowModal('transaction')} className="w-full bg-blue-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all hover:bg-blue-700 flex items-center justify-center gap-3"><Plus size={20} /> Registrar Cambio</button>
             </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-bold">
                 <StatBox label="Caja DOP" value={`RD$ ${balance.dop.toLocaleString()}`} onAction={() => setShowModal('update_capital')} color="text-slate-950" icon={<Wallet size={16}/>} />
                 <StatBox label="Stock USD" value={`$ ${balance.usd.toLocaleString()}`} onAction={() => setShowModal('update_capital')} color="text-slate-950" icon={<TrendingUp size={16}/>} />
                 <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all"><p className="text-[10px] uppercase opacity-80 font-black mb-1 tracking-widest">Utilidad Real</p><p className="text-2xl font-black tracking-tighter italic">RD$ {metrics.profit.toLocaleString()}</p></div>
                 <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all"><p className="text-[10px] uppercase opacity-80 font-black mb-1 tracking-widest text-center italic">Costo Promedio USD</p><p className="text-2xl font-black tracking-tighter italic text-center">RD$ {metrics.avgBuyCost.toFixed(2)}</p></div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm p-6 sm:p-10 font-bold">
                 <div className="flex justify-between items-center mb-10 border-l-4 border-blue-600 pl-4">
                   <h3 className="text-sm sm:text-lg uppercase text-slate-950 font-black tracking-[0.2em]">Últimas Operaciones</h3>
                   <button onClick={generateDailyReport} className="text-[10px] uppercase text-blue-600 font-black underline flex items-center gap-2"><Printer size={16}/> Imprimir Cierre</button>
                 </div>
                 <div className="overflow-x-auto"><table className="w-full text-left italic min-w-[800px]">
                   <thead><tr className="text-slate-950 uppercase text-[10px] border-b-2 border-slate-100 tracking-widest font-black"><th className="pb-6 px-4">Socio</th><th className="pb-6 text-center">Tipo</th><th className="pb-6 text-center">Método</th><th className="pb-6 text-right">USD$</th><th className="pb-6 text-right">Tasa Real</th><th className="pb-6 text-right">RD$ Total</th><th className="pb-6 text-center">Acción</th></tr></thead>
                   <tbody className="divide-y divide-slate-50 text-sm text-slate-950">
                     {transactions.slice(0, 8).map(t => (
                       <tr key={t.id} className="hover:bg-slate-50 transition-all font-black group">
                         <td className="py-6 px-4">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}<div className="text-[8px] text-slate-400 mt-1 font-bold not-italic">{t.date}</div></td>
                         <td className="text-center"><span className={`px-4 py-1.5 rounded-xl text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-500 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'}`}>{t.type}</span></td>
                         <td className="text-center text-[10px] text-slate-400 uppercase">{t.method || 'Efectivo'}</td>
                         <td className="py-6 text-right font-black text-lg italic text-slate-950">${Number(t.amount).toLocaleString()}</td>
                         <td className="py-6 text-right font-black text-slate-300">RD$ {Number(t.rate).toFixed(2)}</td>
                         <td className="py-6 text-right font-black text-xl text-blue-600">RD$ {Number(t.total).toLocaleString()}</td>
                         <td className="py-6 text-center flex justify-center gap-2">
                           <button onClick={() => setPrintData({type: 'receipt', data: t})} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Imprimir"><Printer size={20}/></button>
                           <button onClick={() => handleDeleteTransaction(t)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100" title="Eliminar"><Trash2 size={20}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table></div>
              </div>
            </div>
          )}

          {showModal === 'transaction' && (
            <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
               <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-xl shadow-2xl animate-in slide-in-from-bottom duration-300 p-8 sm:p-12 overflow-y-auto max-h-[95vh]">
                  <div className="flex justify-between items-center mb-8 text-slate-950 font-black italic"><span className="text-2xl uppercase tracking-tighter">Nueva Operación</span><button onClick={() => setShowModal(null)} className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X/></button></div>
                  <div className="flex justify-end mb-4"><button onClick={() => setIsAddingNewClient(!isAddingNewClient)} className="text-[10px] text-blue-600 underline uppercase flex items-center gap-1 font-black"><UserPlus size={14}/> {isAddingNewClient ? "Seleccionar de la lista" : "Registrar Socio Rápido"}</button></div>
                  <form className="space-y-6" onSubmit={async (e) => {
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
                    if(type === 'venta' && amt > balance.usd) { alert(`ERROR: Dólares insuficientes en stock.`); return; }
                    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { clientId: clientId || 'Invitado', type, amount: amt, rate, total, method: f.method.value, timestamp: new Date().toISOString(), date: new Date().toLocaleDateString('es-DO') });
                    const newB = type === 'compra' ? { dop: balance.dop - total, usd: balance.usd + amt } : { dop: balance.dop + total, usd: balance.usd - amt };
                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                    setIsAddingNewClient(false); setShowModal(null);
                  }}>
                    {isAddingNewClient ? (
                      <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                         <p className="text-[10px] uppercase font-black text-blue-600 mb-2">Nuevo Socio Cloud</p>
                         <input required name="newName" placeholder="Nombre completo" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black shadow-inner outline-none focus:border-blue-500" />
                         <input required name="newPhone" placeholder="WhatsApp / Celular" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black shadow-inner outline-none focus:border-blue-500" />
                      </div>
                    ) : (
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Socio / Cliente</label><select name="client" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none focus:border-blue-500 outline-none text-slate-950 font-bold shadow-inner"><option value="">Público General / Invitado</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Operación</label><select name="type" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic appearance-none shadow-inner outline-none"><option value="compra">Compra USD</option><option value="venta">Venta USD</option></select></div>
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic">Método</label><select name="method" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic appearance-none shadow-inner outline-none"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic font-black">Cantidad (USD$)</label><input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xl font-black italic text-slate-950 shadow-inner outline-none" /></div>
                      <div className="space-y-1 text-center"><label className="text-[10px] uppercase font-black text-slate-950 ml-2 italic block mb-1">Tasa Real Pactada</label><input required name="rate" type="number" step="0.01" defaultValue="59.50" className="w-full p-5 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] text-blue-700 text-3xl font-black text-center italic outline-none shadow-inner" /></div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all mt-4">Guardar en Cloud</button>
                  </form>
               </div>
            </div>
          )}

          {showModal === 'update_capital' && (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
               <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-sm p-10 shadow-2xl border border-slate-100 font-bold">
                  <h3 className="text-2xl font-black text-slate-950 mb-8 tracking-tighter text-center uppercase italic">Gestión de Stock</h3>
                  <div className="space-y-6">
                     <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-950 italic">Suma/Resta DOP Pesos</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.dop} onChange={e => setTempCapital({...tempCapital, dop: e.target.value})} placeholder="0.00" /></div>
                     <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-950 italic">Suma/Resta USD Stock</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.usd} onChange={e => setTempCapital({...tempCapital, usd: e.target.value})} placeholder="0.00" /></div>
                  </div>
                  <div className="flex gap-4 mt-6">
                     <button onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 bg-slate-100 rounded-2xl">Cerrar</button>
                     <button onClick={async () => {
                        const newB = { dop: balance.dop + (parseFloat(tempCapital.dop) || 0), usd: balance.usd + (parseFloat(tempCapital.usd) || 0) };
                        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                        setTempCapital({ dop: "", usd: "" }); setShowModal(null);
                     }} className="flex-1 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Confirmar</button>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center"><button onClick={handleResetCapital} className="w-full py-4 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"><Trash2 size={16}/> RESTABLECER CAPITAL A CERO</button></div>
               </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 sm:p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm gap-4">
                 <h3 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-slate-950">Directorio de Socios</h3>
                 <button onClick={() => setShowModal('transaction')} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 italic"><UserPlus size={18}/> NUEVO SOCIO</button>
              </div>
              <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border-2 border-slate-100 text-slate-950">
                 <div className="overflow-x-auto"><table className="w-full text-left italic font-black min-w-[600px]">
                    <thead className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest border-b border-slate-800">
                       <tr><th className="p-8">Nombre Completo</th><th className="p-8 text-center">WhatsApp / Teléfono</th><th className="p-8 text-center">Gestión</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {clients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-all font-black group">
                             <td className="p-8 font-black text-xl tracking-tighter uppercase">{c.name}</td>
                             <td className="p-8 text-slate-500 font-bold flex items-center justify-center gap-2 text-sm not-italic font-black tracking-widest"><Phone size={14} className="text-blue-500" /> {c.phone}</td>
                             <td className="p-8 text-center"><button onClick={() => handleDeleteClient(c)} className="p-3 text-rose-300 hover:text-rose-600 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100" title="Eliminar Socio"><Trash2 size={24}/></button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table></div>
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
             <div className="animate-in slide-in-from-bottom-8 duration-700 bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm p-6 sm:p-10 font-bold">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-l-4 border-blue-600 pl-4">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-slate-950">Historial Maestro</h3>
                  <button onClick={generateDailyReport} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md"><Printer size={16}/> Reporte Cierre</button>
                </div>
                 <div className="overflow-x-auto"><table className="w-full text-left italic min-w-[900px]">
                   <thead><tr className="text-slate-950 uppercase text-[10px] border-b-2 border-slate-100 tracking-widest font-black"><th className="pb-6">Fecha</th><th className="pb-6">Cliente</th><th className="pb-6 text-center">Tipo</th><th className="pb-6 text-center">Método</th><th className="pb-6 text-right">USD$</th><th className="pb-6 text-right">Tasa Pactada</th><th className="pb-6 text-right">RD$ Total</th><th className="pb-6 text-center">Acción</th></tr></thead>
                   <tbody className="divide-y divide-slate-50 text-sm text-slate-950 font-black">
                     {transactions.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                         <td className="py-6 text-slate-400 not-italic text-[10px]">{t.date}</td>
                         <td className="py-6">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}</td>
                         <td className="text-center"><span className={`px-4 py-1.5 rounded-xl text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-500 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'}`}>{t.type}</span></td>
                         <td className="text-center text-[9px] uppercase text-slate-400">{t.method || 'Efectivo'}</td>
                         <td className="py-6 text-right text-lg text-slate-950 font-black italic tracking-tighter">${Number(t.amount).toLocaleString()}</td>
                         <td className="py-6 text-right text-slate-400">RD$ {Number(t.rate).toFixed(2)}</td>
                         <td className="py-6 text-right text-xl text-blue-600 tracking-tighter">RD$ {Number(t.total).toLocaleString()}</td>
                         <td className="py-6 text-center flex justify-center gap-2"><button onClick={() => setPrintData({type: 'receipt', data: t})} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Imprimir Recibo"><Printer size={20}/></button><button onClick={() => handleDeleteTransaction(t)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors" title="Eliminar y Revertir"><Trash2 size={20}/></button></td>
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
        <div className="hidden print:flex bg-white text-black font-sans p-0 absolute inset-0 z-[9999] justify-center items-start">
          
          {printData.type === 'receipt' && (
            <div className="w-full max-w-2xl mx-auto bg-white p-12 mt-6 relative border-2 border-slate-100 rounded-3xl" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="flex justify-between items-center border-b-4 border-blue-600 pb-8 mb-8">
                <div className="flex items-center gap-5">
                  <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M8 21H3v-5M8 3H3v5M16 21h5v-5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M12 12V3M12 21v-9M12 12H3M21 12h-9"/></svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none mb-1">JUAN SANTOS</h1>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-3 italic">Business Financial</p>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Plaza Magalis, Frente a Domino's Pizza<br/>La Vega, República Dominicana<br/>
                      <span className="text-slate-900">Tel: 849-214-7511</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-black uppercase text-slate-200 mb-2 tracking-tighter leading-none">RECIBO<br/><span className="text-[10px] text-slate-400">PAGO CONFIRMADO</span></h2>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest">NÚMERO DE TRANSACCIÓN: {printData.data.id?.substring(0,8).toUpperCase()}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Fecha: {printData.data.date}</p>
                </div>
              </div>

              <div className="mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-blue-600 uppercase font-black tracking-[0.3em] mb-1">Socio / Cliente</p>
                  <p className="text-2xl font-black text-slate-900 uppercase">{clients.find(c => c.id === printData.data.clientId)?.name || 'Cliente Casual'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Cajero Encargado</p>
                  <p className="text-sm font-black text-slate-900 uppercase">Administración Central</p>
                </div>
              </div>

              <table className="w-full text-left mb-10 border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900">
                    <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest">Descripción de Cambio</th>
                    <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-center">Modo</th>
                    <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-right">Tasa</th>
                    <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-right">Importe USD$</th>
                  </tr>
                </thead>
                <tbody className="text-base font-black">
                  <tr className="border-b border-slate-100">
                    <td className="py-6 px-2 uppercase text-slate-800">{printData.data.type} DE DIVISAS</td>
                    <td className="py-6 px-2 text-center uppercase text-slate-500 text-xs">{printData.data.method || 'Efectivo'}</td>
                    <td className="py-6 px-2 text-right text-slate-400">RD$ {Number(printData.data.rate).toFixed(2)}</td>
                    <td className="py-6 px-2 text-right text-xl text-slate-900">USD$ {Number(printData.data.amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mb-16">
                <div className="w-2/3 bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Total Transado</span>
                  <span className="text-3xl font-black tracking-tighter">RD$ {Number(printData.data.total).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-12 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                Juan Santos Business Financial - La Vega, República Dominicana
              </div>
            </div>
          )}

          {printData.type === 'report' && (
            <div className="w-full max-w-4xl mx-auto bg-white p-12 mt-4 relative border-2 border-slate-100 rounded-3xl" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              
              <div className="flex justify-between items-end border-b-4 border-blue-600 pb-8 mb-10">
                <div className="flex items-center gap-5">
                  <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl">
                    <Activity size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 mb-1 leading-none">JUAN SANTOS</h1>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Business Financial - Cierre de Caja</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Corte del Día: {printData.date}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Generado: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                 <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl text-center"><p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2">DOP Final en Caja</p><p className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic">RD$ {balance.dop.toLocaleString()}</p></div>
                 <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl text-center"><p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-2">Stock USD Final</p><p className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic">USD$ {balance.usd.toLocaleString()}</p></div>
                 <div className="bg-slate-100 border-2 border-slate-200 p-6 rounded-2xl text-center"><p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-2">Operaciones Hoy</p><p className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic">{printData.data.length}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                 <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl text-center shadow-sm"><p className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.3em] mb-2">Ganancia Generada Hoy</p><p className="text-4xl font-black text-emerald-700 tracking-tighter leading-none italic">RD$ {printData.dailyProfit?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "0.00"}</p></div>
                 <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg text-center"><p className="text-[10px] uppercase font-black tracking-[0.3em] mb-2 text-blue-200">Rendimiento / ROI Diario</p><p className="text-4xl font-black tracking-tighter leading-none italic">{printData.dailyROI?.toFixed(2) || "0.00"}%</p></div>
              </div>

              <table className="w-full text-left text-[11px] border-2 border-slate-100 rounded-3xl overflow-hidden font-black uppercase tracking-widest italic">
                <thead className="bg-slate-900 text-white"><tr className="font-black border-b border-slate-800"><th className="p-4">ID Trans.</th><th className="p-4">Socio</th><th className="p-4 text-center">Tipo</th><th className="p-4 text-center">Método</th><th className="p-4 text-right">USD$</th><th className="p-4 text-right">Total RD$</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {printData.data.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-4 font-black text-slate-400">{t.id.substring(0,8).toUpperCase()}</td>
                      <td className="p-4 uppercase font-black">{clients.find(c => c.id === t.clientId)?.name || 'Invitado'}</td>
                      <td className="p-4 text-center uppercase"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px]">{t.type}</span></td>
                      <td className="p-4 text-center text-slate-400">{t.method || 'Efectivo'}</td>
                      <td className="p-4 text-right font-black">${Number(t.amount).toLocaleString()}</td>
                      <td className="p-4 text-right text-blue-600 tracking-tighter text-sm font-black italic leading-none">RD$ {Number(t.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-16 pt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-t-2 border-slate-100 italic">Reporte Maestro Juan Santos Business Financial</div>
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
  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
     <div className="flex justify-between items-center mb-1"><p className={`text-[10px] uppercase font-black tracking-widest ${color}`}>{label}</p><div className="opacity-20">{icon}</div></div>
     <p className="text-2xl font-black italic tracking-tighter truncate">{value}</p>
     <button onClick={onAction} className="text-[10px] text-blue-600 font-black uppercase mt-4 underline italic hover:text-blue-800 text-left w-fit transition-all">Sincronizar Stock</button>
  </div>
);

export default App;
