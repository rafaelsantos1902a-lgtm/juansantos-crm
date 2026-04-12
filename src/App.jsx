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
 * JUAN SANTOS BUSINESS v7.0 - SISTEMA CONTABLE ESTRICTO
 * - Reversión de Stock: Al borrar transacciones se restaura el balance.
 * - Registro de método: Efectivo o Transferencia.
 * - Columnas detalladas: Monto USD, Tasa Real y Total DOP.
 * - ROI e Interés Ganado en tiempo real.
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
const appId = 'js-business-cloud-v7-final'; 

// --- COMPONENTE LOGIN ---
const LoginPage = ({ isRegistering, setIsRegistering, handleAuth, email, setEmail, password, setPassword, error, loading }) => {
  const [resetSent, setResetSent] = useState(false);
  const handleReset = async () => {
    if (!email) { alert("Ingresa tu correo para recuperar clave."); return; }
    try { await sendPasswordResetEmail(auth, email); setResetSent(true); } 
    catch (err) { alert("Error: Correo no registrado."); }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in border border-slate-100">
        <div className="flex flex-col items-center mb-8 text-center text-slate-900">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-blue-600/30"><Lock size={32} /></div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">JS Business</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">Sistema Contable Pro</p>
        </div>
        {resetSent ? (
          <div className="text-center p-6 bg-blue-50 rounded-2xl animate-in fade-in">
            <p className="text-blue-700 font-bold text-sm italic">¡Enlace enviado! Revisa tu email.</p>
            <button onClick={() => setResetSent(false)} className="mt-4 text-xs font-black uppercase underline text-slate-400">Volver</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5">
            {error && <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase flex items-center gap-2 border border-rose-100 animate-pulse"><AlertCircle size={16} /> {error}</div>}
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Email / Usuario</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="usuario@js.com" /></div>
            <div className="space-y-1"><div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Clave</label><button type="button" onClick={handleReset} className="text-[9px] font-black text-blue-600 hover:underline italic">¿Olvidaste la clave?</button></div><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="••••••••" /></div>
            <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">{loading ? "Conectando..." : isRegistering ? "Crear Mi Cuenta" : "Entrar al Sistema"}</button>
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [balance, setBalance] = useState({ dop: 0, usd: 0 });
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [tempCapital, setTempCapital] = useState({ dop: "", usd: "" });
  const [authData, setAuthData] = useState({ email: '', password: '', isRegistering: false, error: '', loading: false });

  // --- LÓGICA FINANCIERA (ROI Y GANANCIA) ---
  const metrics = useMemo(() => {
    const buys = transactions.filter(t => t.type === 'compra');
    const sells = transactions.filter(t => t.type === 'venta');
    const investedCapital = buys.reduce((acc, t) => acc + Number(t.total), 0);
    const totalUSDIn = buys.reduce((acc, t) => acc + Number(t.amount), 0);
    const avgBuyCost = totalUSDIn > 0 ? investedCapital / totalUSDIn : 58.50;
    const profit = sells.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - avgBuyCost)), 0);
    const roi = investedCapital > 0 ? (profit / investedCapital) * 100 : 0;
    return { profit, avgBuyCost, investedCapital, roi };
  }, [transactions]);

  // --- SINCRONIZACIÓN CLOUD ---
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

  // --- ACCIONES ESTRICTAS (BORRAR Y REVERTIR) ---
  const handleDeleteTransaction = async (tx) => {
    if (window.confirm(`¿BORRAR Y REVERTIR? \n\nEsta acción devolverá el stock y ajustará el balance de caja automáticamente.`)) {
      const { type, amount, total } = tx;
      
      // Lógica de reversión: si era compra, al borrar devuelvo USD y recupero DOP
      // Si era venta, al borrar recupero USD y devuelvo DOP
      const revertBalance = type === 'compra'
        ? { dop: balance.dop + total, usd: balance.usd - amount }
        : { dop: balance.dop - total, usd: balance.usd + amount };

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

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans"><Activity className="text-blue-500 animate-spin" size={40} /></div>;
  if (!businessAuth) return <LoginPage isRegistering={authData.isRegistering} setIsRegistering={(v) => setAuthData({...authData, isRegistering: v})} handleAuth={handleAuth} email={authData.email} setEmail={(v) => setAuthData({...authData, email: v})} password={authData.password} setPassword={(v) => setAuthData({...authData, password: v})} error={authData.error} loading={authData.loading} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-x-hidden">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-slate-900 text-white flex flex-col fixed h-full z-40 transition-all duration-500 border-r border-slate-800`}>
        <div className="p-8 flex items-center justify-between font-black italic">
          {isSidebarOpen && <div className="flex items-center gap-3 animate-in fade-in"><div className="bg-blue-600 p-2 rounded-xl"><DollarSign size={20} /></div><h1>JS BUSINESS</h1></div>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-800 rounded-xl transition-all">{isSidebarOpen ? <X /> : <Menu />}</button>
        </div>
        <nav className="flex-1 px-4 mt-10 space-y-3 font-bold text-[10px] uppercase tracking-widest">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'opacity-40 hover:opacity-100'}`}><LayoutDashboard size={20}/> {isSidebarOpen && "Panel Principal"}</button>
           <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${activeTab === 'clients' ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'opacity-40 hover:opacity-100'}`}><Users size={20}/> {isSidebarOpen && "Mis Socios"}</button>
           <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${activeTab === 'transactions' ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'opacity-40 hover:opacity-100'}`}><ArrowLeftRight size={20}/> {isSidebarOpen && "Operaciones"}</button>
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={() => { setBusinessAuth(false); signOut(auth); }} className="w-full flex items-center gap-4 p-4 text-slate-400 font-bold text-xs uppercase hover:text-white transition-all"><LogOut size={20}/> {isSidebarOpen && "CERRAR SESIÓN"}</button></div>
      </aside>

      <main className={`flex-1 ${isSidebarOpen ? 'ml-80' : 'ml-24'} p-6 lg:p-12 transition-all duration-500`}>
        {/* BANNER DINÁMICO */}
        <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group border border-slate-800">
           <div className="relative z-10 text-center lg:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ledger Financial Active</span></div>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Juan Santos Business</h2>
              
              {/* ROI (%) DASHBOARD */}
              <div className="mt-8 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-6 backdrop-blur-md">
                 <div className="space-y-1">
                   <p className="text-[10px] uppercase font-black opacity-40 tracking-widest">Interés Ganado (ROI)</p>
                   <p className="text-5xl font-black text-blue-400 tracking-tighter italic">{metrics.roi.toFixed(1)}%</p>
                 </div>
                 <div className="h-12 w-px bg-white/10"></div>
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase opacity-60"><span>Meta Operativa</span><span>{Math.min(metrics.roi, 100).toFixed(0)}%</span></div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{width: `${Math.min(metrics.roi, 100)}%`}}></div></div>
                 </div>
              </div>
           </div>
           <button onClick={() => setShowModal('transaction')} className="bg-blue-600 text-white px-10 py-5 rounded-[1.8rem] font-black text-xs tracking-widest uppercase shadow-2xl hover:scale-105 transition-all relative z-10 hover:bg-blue-700">Nueva Operación</button>
           <Activity size={300} className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-bold">
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
                  <p className="text-[10px] uppercase text-slate-950 font-black mb-1 tracking-widest">Caja DOP Pesos</p>
                  <p className="text-2xl font-black italic tracking-tighter">RD$ {balance.dop.toLocaleString()}</p>
                  <button onClick={() => setShowModal('update_capital')} className="text-[9px] text-blue-600 font-black uppercase mt-4 underline italic">Sincronizar (+/-)</button>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-100 transition-all">
                  <p className="text-[10px] uppercase text-slate-950 font-black mb-1 tracking-widest">Stock USD Dólares</p>
                  <p className="text-2xl font-black italic tracking-tighter">${balance.usd.toLocaleString()}</p>
                  <button onClick={() => setShowModal('update_capital')} className="text-[9px] text-emerald-600 font-black uppercase mt-4 underline italic">Sincronizar (+/-)</button>
               </div>
               <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all">
                  <p className="text-[10px] uppercase opacity-80 font-black mb-1 tracking-widest">Utilidad Acumulada</p>
                  <p className="text-2xl font-black tracking-tighter italic leading-none">RD$ {metrics.profit.toLocaleString()}</p>
               </div>
               <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center hover:-translate-y-1 transition-all">
                  <p className="text-[10px] uppercase opacity-80 font-black mb-1 tracking-widest text-center italic">Costo Promedio USD</p>
                  <p className="text-2xl font-black tracking-tighter italic text-center leading-none">RD$ {metrics.avgBuyCost.toFixed(2)}</p>
               </div>
            </div>
            
            {/* HISTORIAL RECIENTE CON CONTRASTE ALTO */}
            <div className="bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-sm p-10 font-bold overflow-hidden">
               <h3 className="text-[11px] uppercase text-slate-950 font-black tracking-[0.2em] mb-10 border-l-4 border-blue-600 pl-4">Registro Maestro de Operaciones</h3>
               <div className="overflow-x-auto"><table className="w-full text-left italic">
                 <thead>
                   <tr className="text-slate-950 uppercase text-[10px] border-b-2 border-slate-100 tracking-widest font-black">
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
                       <td className="text-center"><span className={`px-4 py-1.5 rounded-xl text-[9px] uppercase ${t.type === 'compra' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-blue-600 text-white shadow-md shadow-blue-200'}`}>{t.type}</span></td>
                       <td className="text-center text-[10px] text-slate-500 uppercase">{t.method || 'Efectivo'}</td>
                       <td className="py-6 text-right font-black text-lg text-slate-950 italic">${Number(t.amount).toLocaleString()}</td>
                       <td className="py-6 text-right font-black text-slate-400">RD$ {Number(t.rate).toFixed(2)}</td>
                       <td className="py-6 text-right font-black text-xl text-blue-600 tracking-tighter">RD$ {Number(t.total).toLocaleString()}</td>
                       <td className="py-6 text-right"><button onClick={() => handleDeleteTransaction(t)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button></td>
                     </tr>
                   ))}
                 </tbody>
               </table></div>
               {transactions.length === 0 && <div className="p-20 text-center text-slate-200 uppercase font-black tracking-widest text-xl italic">Sin movimientos registrados</div>}
            </div>
          </div>
        )}

        {/* MODAL TRANSACCION CON REGISTRO DE CLIENTE */}
        {showModal === 'transaction' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 font-black">
             <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-white animate-in zoom-in p-12 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10 italic text-2xl uppercase tracking-tighter text-slate-950 font-black"><span>Ejecutar Transacción</span><button onClick={() => setShowModal(null)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full transition-all"><X/></button></div>
                
                <div className="flex justify-end mb-4">
                  <button onClick={() => setIsAddingNewClient(!isAddingNewClient)} className="text-[10px] text-blue-600 underline uppercase flex items-center gap-1 font-black"><UserPlus size={14}/> {isAddingNewClient ? "Seleccionar de la lista" : "Registrar Socio Rápido"}</button>
                </div>

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
                  const method = f.method.value;
                  const total = amt * rate;

                  // --- VALIDACIÓN DE CAJA ---
                  if(type === 'compra' && total > balance.dop) { alert(`ERROR: Fondos insuficientes en Pesos. Tienes RD$ ${balance.dop.toLocaleString()} pero necesitas RD$ ${total.toLocaleString()}`); return; }
                  if(type === 'venta' && amt > balance.usd) { alert(`ERROR: No hay stock suficiente en Dólares. Tienes $ ${balance.usd.toLocaleString()} pero necesitas $ ${amt.toLocaleString()}`); return; }

                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), { clientId, type, amount: amt, rate, total, method, timestamp: new Date().toISOString(), date: new Date().toLocaleDateString('es-DO') });
                  const newB = type === 'compra' ? { dop: balance.dop - total, usd: balance.usd + amt } : { dop: balance.dop + total, usd: balance.usd - amt };
                  await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                  setIsAddingNewClient(false);
                  setShowModal(null);
                }}>
                  {isAddingNewClient ? (
                    <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                       <p className="text-[10px] uppercase font-black text-blue-600 mb-2">Nuevo Socio / Cliente</p>
                       <input required name="newName" placeholder="Nombre completo" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black italic shadow-inner" />
                       <input required name="newPhone" placeholder="WhatsApp / Teléfono" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-950 font-black italic shadow-inner" />
                    </div>
                  ) : (
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-950 ml-1 tracking-widest font-black italic">Seleccionar Socio</label><select name="client" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] italic appearance-none focus:border-blue-500 outline-none text-slate-950 font-bold shadow-inner"><option value="">¿Quién realiza la operación?</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  )}

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-950 ml-1 tracking-widest italic">Tipo de Cambio</label><select name="type" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic shadow-inner appearance-none"><option value="compra">Compra (Entrada USD)</option><option value="venta">Venta (Salida USD)</option></select></div>
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-950 ml-1 tracking-widest italic">Método de Pago</label><select name="method" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-950 italic shadow-inner appearance-none"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option></select></div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-950 ml-1 tracking-widest italic font-black">Cantidad USD$</label><input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-xl font-black italic text-slate-950 shadow-inner" /></div>
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-950 ml-1 tracking-widest italic font-black text-center block">Tasa Real Pactada</label><input required name="rate" type="number" step="0.01" defaultValue="59.35" className="w-full p-5 bg-blue-50 border-2 border-blue-200 rounded-[1.5rem] text-blue-700 text-2xl font-black text-center italic shadow-inner outline-none" /></div>
                  </div>
                  
                  <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all mt-6 shadow-blue-600/30">Ejecutar y Guardar</button>
                </form>
             </div>
          </div>
        )}

        {/* MODAL FONDEO / SINCRONIZACIÓN */}
        {showModal === 'update_capital' && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl border border-slate-100 font-bold">
                <h3 className="text-2xl font-black text-slate-950 mb-8 tracking-tighter text-center uppercase leading-none italic">Sincronizar Stock</h3>
                <p className="text-[10px] text-slate-400 text-center mb-6 uppercase tracking-widest italic font-black">Ajusta el capital físico en caja</p>
                <div className="space-y-6">
                   <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-950 italic">Suma/Resta RD$ Pesos</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.dop} onChange={e => setTempCapital({...tempCapital, dop: e.target.value})} placeholder="0.00" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-950 italic">Suma/Resta USD$ Stock</label><input type="number" step="0.01" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-2xl text-center text-slate-950 shadow-inner italic" value={tempCapital.usd} onChange={e => setTempCapital({...tempCapital, usd: e.target.value})} placeholder="0.00" /></div>
                </div>
                <div className="flex gap-4 mt-10">
                   <button onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 italic">Cerrar</button>
                   <button onClick={async () => {
                      const newB = { 
                        dop: balance.dop + (parseFloat(tempCapital.dop) || 0), 
                        usd: balance.usd + (parseFloat(tempCapital.usd) || 0) 
                      };
                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global'), { balance: newB });
                      setTempCapital({ dop: "", usd: "" });
                      setShowModal(null);
                   }} className="flex-1 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl italic">Confirmar Ajuste</button>
                </div>
             </div>
          </div>
        )}

        {/* TABLA CLIENTES */}
        {activeTab === 'clients' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
               <h3 className="text-4xl font-black tracking-tighter uppercase italic text-slate-950">Directorio Cloud</h3>
               <button onClick={() => setShowModal('transaction')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-2 italic"><UserPlus size={18}/> NUEVO SOCIO</button>
            </div>
            <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border-2 border-slate-100 text-slate-950">
               <table className="w-full text-left italic font-black">
                  <thead className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest border-b border-slate-800">
                     <tr><th className="p-8">Nombre del Socio</th><th className="p-8">WhatsApp / Teléfono</th><th className="p-8 text-center">Estatus Cloud</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {clients.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-all font-black">
                           <td className="p-8 font-black text-xl tracking-tighter uppercase">{c.name}</td>
                           <td className="p-8 text-slate-500 font-bold flex items-center gap-2 text-sm not-italic font-black tracking-widest"><Phone size={14} className="text-blue-500" /> {c.phone}</td>
                           <td className="p-8 text-center"><span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl text-[9px] uppercase font-black shadow-sm">CONECTADO</span></td>
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
