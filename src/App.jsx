import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, query, getDoc 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, signInWithCustomToken,
  signInAnonymously, sendPasswordResetEmail
} from 'firebase/auth';
import { 
  LayoutDashboard, Users, ArrowLeftRight, PlusCircle, Search, 
  TrendingUp, TrendingDown, DollarSign, Menu, X, Calendar, 
  Settings, CheckCircle, UserPlus, Trash2, Wallet, Plus, 
  Phone, Landmark, Banknote, AlertCircle, Save, Download,
  Cloud, Lock, Mail, LogOut, KeyRound, LineChart, Percent
} from 'lucide-react';

/**
 * JUAN SANTOS BUSINESS v4.3 - INTELIGENCIA FINANCIERA
 * - Cálculo de Spread (Margen Real)
 * - Recuperación de Contraseña via Email
 * - Gestión de Inventario DOP/USD en Nube
 */

// --- CONFIGURACIÓN E INICIALIZACIÓN ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Saneamos el appId para Firebase (Segmentos planos)
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'juansantos-business-pro';
const appId = rawAppId.split('_src')[0].split('/')[0];

const DOMINICAN_BANKS = [
  "Banreservas", "Banco Popular", "Banco BHD", "Scotiabank", 
  "Banco Santa Cruz", "Banco del Progreso", "Asociación Popular", 
  "Asociación Cibao", "Banco Promerica", "Banco JMMB"
];

// --- COMPONENTE DE ACCESO (LOGIN + RESET) ---

const LoginPage = ({ isRegistering, setIsRegistering, handleAuth, email, setEmail, password, setPassword, error, loading }) => {
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleReset = async () => {
    if (!email) {
      alert("Por favor, ingresa tu correo electrónico primero.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("¡Enlace enviado! Revisa tu bandeja de entrada.");
    } catch (err) {
      setResetMessage("Error al enviar el correo. Verifica el email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">JS Business</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Seguridad Cloud activa</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase flex items-center gap-2">
              <AlertCircle size={16} /> {String(error)}
            </div>
          )}
          {resetMessage && (
            <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl text-emerald-600 text-[10px] font-black uppercase text-center">
              {resetMessage}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo de Usuario</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all" 
                placeholder="juan@jsbusiness.com" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
              <button type="button" onClick={handleReset} className="text-[9px] font-black text-blue-600 hover:underline">
                {resetLoading ? "..." : "¿OLVIDASTE TU CLAVE?"}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all" 
                placeholder="••••••••" />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50">
            {loading ? "Verificando..." : isRegistering ? "Crear Mi Cuenta Business" : "Iniciar Sesión"}
          </button>
        </form>

        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-8 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline text-center">
          {isRegistering ? "¿Ya tienes cuenta? Entra aquí" : "¿Eres nuevo socio? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-6 p-4.5 rounded-[1.8rem] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
    <div className={`${active ? 'text-white' : 'text-slate-500'}`}>{icon}</div>
    {isOpen && <span className="font-black text-[12px] uppercase tracking-[0.2em]">{String(label)}</span>}
  </button>
);

const StatCard = ({ title, val, icon, color, action, actionLabel, subtext }) => (
  <div className={`p-8 rounded-[2.8rem] border transition-all hover:shadow-xl group flex flex-col justify-between ${color}`}>
    <div className="flex justify-between items-start mb-6">
       <div className="space-y-2 leading-none">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{String(title)}</p>
          <p className="text-3xl font-black tracking-tighter leading-none mt-1">{String(val)}</p>
          {subtext && <p className="text-[9px] font-bold opacity-50 mt-2 uppercase tracking-widest">{String(subtext)}</p>}
       </div>
       <div className="bg-slate-400/10 p-3 rounded-[1.2rem] group-hover:scale-110 transition-transform leading-none">{icon}</div>
    </div>
    {action && (
       <button onClick={action} className="text-[9px] font-black text-blue-600 hover:bg-blue-50 transition-all px-4 py-2 rounded-xl border border-blue-100 uppercase tracking-widest w-fit leading-none mt-2">
         {String(actionLabel)}
       </button>
    )}
  </div>
);

// --- COMPONENTE PRINCIPAL ---

const App = () => {
  const [user, setUser] = useState(null);
  const [businessAuth, setBusinessAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(null); 
  const [errorMsg, setErrorMsg] = useState(null);
  
  // States
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [balance, setBalance] = useState({ dop: 0, usd: 0 });
  const [rates, setRates] = useState({ buy: 58.50, sell: 59.35 });
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [tempCapital, setTempCapital] = useState({ dop: "", usd: "" });
  const [isEditingRates, setIsEditingRates] = useState(false);

  // --- LÓGICA DE SPREAD Y GANANCIA ---
  const financialStats = useMemo(() => {
    // 1. Costo Promedio Ponderado de Compra
    const compras = transactions.filter(t => t.type === 'compra');
    const totalUSDIn = compras.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalDOPOut = compras.reduce((acc, t) => acc + Number(t.total), 0);
    const avgBuyPrice = totalUSDIn > 0 ? totalDOPOut / totalUSDIn : rates.buy;

    // 2. Ganancia Bruta (Ventas vs Costo de Compra Promedio)
    const ventas = transactions.filter(t => t.type === 'venta');
    const totalUSDOut = ventas.reduce((acc, t) => acc + Number(t.amount), 0);
    const grossProfit = ventas.reduce((acc, t) => acc + (Number(t.amount) * (Number(t.rate) - avgBuyPrice)), 0);

    // 3. Spread Promedio (RD$ ganado por cada USD vendido)
    const avgSpread = totalUSDOut > 0 ? grossProfit / totalUSDOut : (rates.sell - rates.buy);

    return {
      grossProfit,
      avgSpread,
      avgBuyPrice,
      totalComprado: totalUSDIn,
      totalVendido: totalUSDOut
    };
  }, [transactions, rates]);

  // --- 1. AUTENTICACIÓN ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {}
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. SINCRONIZACIÓN ---
  useEffect(() => {
    if (!user || !businessAuth) return;

    const qClients = collection(db, 'artifacts', appId, 'public', 'data', 'clients');
    const unsubClients = onSnapshot(qClients, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qTx = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
    const unsubTx = onSnapshot(qTx, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    });

    const docConfig = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global');
    const unsubConfig = onSnapshot(docConfig, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.balance) setBalance(data.balance);
        if (data.rates) setRates(data.rates);
      } else {
        setDoc(docConfig, { balance: { dop: 0, usd: 0 }, rates: { buy: 58.50, sell: 59.35 } });
      }
    });

    return () => {
      unsubClients();
      unsubTx();
      unsubConfig();
    };
  }, [user, businessAuth]);

  // --- FUNCIONES ---

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setBusinessAuth(true);
    } catch (err) {
      setAuthError("Email o contraseña incorrectos.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Seguro que deseas salir de Juan Santos Business?")) {
      setBusinessAuth(false);
      signOut(auth);
    }
  };

  const saveGlobalSettings = async (newBalance, newRates) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global');
    await updateDoc(docRef, { balance: newBalance, rates: newRates });
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    if (window.confirm("¿Eliminar operación? El inventario se ajustará automáticamente.")) {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        let newDop = balance.dop;
        let newUsd = balance.usd;
        if (tx.type === 'compra') {
          newDop += Number(tx.total);
          newUsd -= Number(tx.amount);
        } else {
          newDop -= Number(tx.total);
          newUsd += Number(tx.amount);
        }
        await saveGlobalSettings({ dop: newDop, usd: newUsd }, rates);
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
      }
    }
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Cliente", "Telefono", "Tipo", "USD$", "Tasa", "RD$ Total", "Pago", "Banco"];
    const rows = transactions.map(t => {
      const client = clients.find(c => c.id === t.clientId);
      return [t.date, client?.name || 'Invitado', client?.phone || 'N/A', t.type, t.amount, t.rate, t.total, t.method, t.bank];
    });
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `JuanSantos_Business_Contabilidad.csv`);
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4 animate-pulse">
            <DollarSign className="text-blue-500" size={60} />
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Juan Santos Business Cloud...</p>
         </div>
      </div>
    );
  }

  if (!businessAuth) {
    return (
      <LoginPage 
        isRegistering={isRegistering} 
        setIsRegistering={setIsRegistering}
        handleAuth={handleManualAuth}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={authError}
        loading={authLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-slate-900 text-white transition-all duration-500 flex flex-col fixed h-full z-40 shadow-2xl`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <DollarSign size={20} strokeWidth={4} />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none italic">JS Business</h1>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-10">
          <NavItem icon={<LayoutDashboard size={22}/>} label="Escritorio" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<Users size={22}/>} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
          <NavItem icon={<ArrowLeftRight size={22}/>} label="Operaciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-6 space-y-4 border-t border-slate-800/50">
           <div className={`bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
             <Cloud size={20} className="text-emerald-500" />
             {isSidebarOpen && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Cloud Sincronizado</p>}
           </div>
           <button onClick={handleLogout} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-slate-400 hover:bg-rose-500 hover:text-white transition-all ${!isSidebarOpen && 'justify-center'}`}>
             <LogOut size={20} />
             {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">Cerrar Sesión</span>}
           </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-80' : 'ml-24'} p-6 md:p-12`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="space-y-1">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Juan Santos Business</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Dashboard de Inteligencia Financiera</p>
          </div>
          <button onClick={() => { setShowModal('transaction'); setErrorMsg(null); }} className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 active:scale-95">
             NUEVA OPERACIÓN
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Fondo en Pesos" val={`RD$ ${balance.dop.toLocaleString()}`} icon={<Wallet size={20}/>} color="bg-white text-slate-900 border-slate-200 shadow-sm" action={() => setShowModal('update_capital')} actionLabel="+ FONDEO" />
              <StatCard title="Inventario Dólares" val={`$${balance.usd.toLocaleString()} USD`} icon={<TrendingUp size={20}/>} color="bg-emerald-50 text-emerald-600 border-emerald-100" action={() => setShowModal('update_capital')} actionLabel="+ STOCK" />
              <StatCard 
                title="Ganancia Bruta" 
                val={`RD$ ${financialStats.grossProfit.toLocaleString()}`} 
                icon={<LineChart size={20}/>} 
                color="bg-slate-900 text-white border-slate-800 shadow-xl"
                subtext={`Costo USD: RD$ ${financialStats.avgBuyPrice.toFixed(2)}`}
              />
              <StatCard 
                title="Spread Promedio" 
                val={`RD$ ${financialStats.avgSpread.toFixed(2)}`} 
                icon={<Percent size={20}/>} 
                color="bg-blue-600 text-white border-blue-500 shadow-xl"
                subtext="RD$ por USD vendido"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* TASAS */}
              <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight leading-none italic font-sans"><Settings size={22} className="text-slate-400" /> Tasa de Mercado</h3>
                  <button onClick={() => { 
                    if(isEditingRates) saveGlobalSettings(balance, rates); 
                    setIsEditingRates(!isEditingRates); 
                  }} className="text-[10px] font-black text-blue-600 uppercase underline">
                    {isEditingRates ? "GUARDAR NUBE" : "EDITAR"}
                  </button>
                </div>
                <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Compra Referencia</p>
                    {isEditingRates ? 
                      <input type="number" step="0.1" className="text-5xl font-black w-full border-b-4 border-blue-500 outline-none pb-2 bg-transparent" value={rates.buy} onChange={e => setRates({...rates, buy: parseFloat(e.target.value)})} /> :
                      <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{rates.buy.toFixed(2)}</p>
                    }
                  </div>
                  <div className="h-px bg-slate-100 w-full"></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Venta Referencia</p>
                    {isEditingRates ? 
                      <input type="number" step="0.1" className="text-5xl font-black w-full border-b-4 border-blue-500 outline-none pb-2 bg-transparent" value={rates.sell} onChange={e => setRates({...rates, sell: parseFloat(e.target.value)})} /> :
                      <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{rates.sell.toFixed(2)}</p>
                    }
                  </div>
                </div>
              </div>

              {/* ÚLTIMAS OPERACIONES */}
              <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col font-bold">
                <div className="p-10 border-b flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-[10px] tracking-widest leading-none"><Calendar size={20} className="text-blue-500" /> Movimientos Hoy</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">VER TODO</button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <tr><th className="p-8">Cliente</th><th className="p-8">Operación</th><th className="p-8 text-right">Monto USD</th><th className="p-8"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {transactions.slice(0, 6).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-8 font-black text-slate-900 leading-none">
                            {String(clients.find(c => c.id === t.clientId)?.name || 'Invitado')}
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{String(t.method)}</div>
                          </td>
                          <td className="p-8">
                             <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{String(t.type)}</span>
                          </td>
                          <td className="p-8 text-right font-black text-slate-900 text-xl tracking-tight leading-none italic">${Number(t.amount).toLocaleString()}</td>
                          <td className="p-8 text-right">
                             <button onClick={() => deleteTransaction(t.id)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL STOCK */}
        {showModal === 'update_capital' && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm shadow-2xl border border-white animate-in zoom-in">
               <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter text-center uppercase leading-none italic">Sincronizar Stock</h3>
               <div className="space-y-6 mb-8 font-bold">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Agregar RD$ Pesos</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none font-black text-xl text-center shadow-inner" value={tempCapital.dop} onChange={e => setTempCapital({...tempCapital, dop: e.target.value})} placeholder="RD$ 0.00" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Agregar USD$ Stock</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none font-black text-xl text-center shadow-inner" value={tempCapital.usd} onChange={e => setTempCapital({...tempCapital, usd: e.target.value})} placeholder="$ 0.00" />
                 </div>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                 <button onClick={async () => {
                    const newBalance = {
                      dop: balance.dop + (parseFloat(tempCapital.dop) || 0),
                      usd: balance.usd + (parseFloat(tempCapital.usd) || 0)
                    };
                    await saveGlobalSettings(newBalance, rates);
                    setTempCapital({ dop: "", usd: "" });
                    setShowModal(null);
                 }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Confirmar</button>
               </div>
            </div>
          </div>
        )}

        {/* MODAL OPERACIÓN */}
        {showModal === 'transaction' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-white animate-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto font-bold">
                <div className="p-6 bg-slate-50 border-b flex justify-between items-center sticky top-0 z-10">
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic font-sans">Nueva Transacción</h3>
                   <button onClick={() => setShowModal(null)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors"><X size={24}/></button>
                </div>
                <form className="p-8 space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const amt = parseFloat(form.amount.value);
                  const rate = parseFloat(form.rate.value);
                  const type = form.type.value;
                  const method = form.method.value;
                  const bank = method === 'transferencia' ? form.bank.value : 'Efectivo';
                  const total = amt * rate;

                  if (type === 'compra' && total > balance.dop) { setErrorMsg("Fondo en Pesos insuficiente"); return; }
                  if (type === 'venta' && amt > balance.usd) { setErrorMsg("Stock en Dólares insuficiente"); return; }

                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
                    clientId: form.client.value,
                    type, amount: amt, rate, total, timestamp: new Date().toISOString(),
                    date: new Date().toLocaleString('es-DO'), method, bank
                  });

                  const newBalance = type === 'compra' 
                    ? { dop: balance.dop - total, usd: balance.usd + amt }
                    : { dop: balance.dop + total, usd: balance.usd - amt };
                  
                  await saveGlobalSettings(newBalance, rates);
                  setShowModal(null);
                }}>
                  {errorMsg && <div className="bg-rose-50 p-4 rounded-xl text-rose-600 text-xs font-black uppercase text-center flex items-center justify-center gap-2"><AlertCircle size={14}/> {String(errorMsg)}</div>}
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Cliente</label>
                    <select name="client" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:border-blue-500 outline-none appearance-none transition-all">
                      <option value="">Buscar de la lista...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{String(c.name)}</option>)}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Operación</label>
                         <select name="type" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:border-blue-500 outline-none transition-all">
                            <option value="compra">Compra (Pesos Out)</option>
                            <option value="venta">Venta (Dólares Out)</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto (USD$)</label>
                         <input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:border-blue-500 outline-none transition-all" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tasa Negociada RD$</label>
                         <input required name="rate" type="number" step="0.01" defaultValue={rates.buy} className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl font-black text-xl text-blue-700 shadow-sm focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Liquidación</label>
                         <select name="method" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:border-blue-500 outline-none transition-all">
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                         </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banco (Opcional)</label>
                       <input name="bank" list="dominican-banks" placeholder="Selecciona banco dominicano..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm shadow-sm focus:border-blue-500 outline-none transition-all" />
                       <datalist id="dominican-banks">
                          {DOMINICAN_BANKS.map(b => <option key={b} value={b} />)}
                       </datalist>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-2xl mt-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado Nube</span>
                     <span className="text-xl font-bold text-blue-400 tracking-tighter uppercase">Listo para Sincronizar</span>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 active:scale-95 transition-all">Finalizar y Guardar</button>
                </form>
             </div>
          </div>
        )}

        {/* TAB CLIENTES */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
             <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">Base de Clientes</h3>
                <button onClick={() => setShowModal('client')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <UserPlus size={18}/> NUEVO CLIENTE
                </button>
             </div>
             <table className="w-full text-left font-bold">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <tr><th className="p-8">Nombre Completo</th><th className="p-8">Teléfono / WhatsApp</th><th className="p-8 text-center">Gestión</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="p-8 font-black text-slate-900 text-lg leading-none">{String(c.name)}</td>
                         <td className="p-8 flex items-center gap-2 font-bold text-slate-500 leading-none"><Phone size={14} className="text-blue-500" />{String(c.phone)}</td>
                         <td className="p-8 text-center leading-none"><button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline transition-all">Ver Historial</button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* TAB HISTORIAL */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
             <div className="p-10 border-b flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-6">
                <div className="space-y-1 text-center md:text-left">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Contabilidad Business</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registro histórico Cloud</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={exportToCSV} className="bg-emerald-600 text-white px-6 py-4 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all">
                     <Download size={18}/> Descargar CSV Excel
                   </button>
                   <button onClick={() => { if(window.confirm("¿Borrar todo?")) setTransactions([]) }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-6 py-4 border border-rose-100 rounded-[1.2rem] hover:bg-rose-50 transition-all">BORRAR REGISTRO</button>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left font-bold border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                     <tr><th className="p-8">Fecha</th><th className="p-8">Cliente</th><th className="p-8 text-center">Operación</th><th className="p-8 text-right">USD$</th><th className="p-8 text-right">Tasa</th><th className="p-8 text-right">RD$ Total</th><th className="p-8"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 group transition-colors">
                           <td className="p-8 text-[10px] font-black text-slate-400 uppercase leading-tight">{String(t.date)}</td>
                           <td className="p-8 leading-tight">
                              <div className="font-black text-slate-900 text-lg mb-1">{String(clients.find(c => c.id === t.clientId)?.name || 'Invitado')}</div>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{String(t.type)}</span>
                           </td>
                           <td className="p-8 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-black uppercase text-slate-500 leading-none">{String(t.method)}</span>
                                {t.method === 'transferencia' && <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md leading-none">{String(t.bank)}</span>}
                              </div>
                           </td>
                           <td className="p-8 text-right font-black text-2xl text-slate-900 tracking-tighter leading-none">${Number(t.amount).toLocaleString()}</td>
                           <td className="p-8 text-right font-bold text-slate-300 tracking-widest leading-none">{Number(t.rate).toFixed(2)}</td>
                           <td className="p-8 text-right font-black text-slate-900 text-xl tracking-tight leading-none">RD$ {Number(t.total).toLocaleString()}</td>
                           <td className="p-8 text-center">
                              <button onClick={() => deleteTransaction(t.id)} className="p-3 text-rose-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={24}/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* MODAL REGISTRO CLIENTE */}
        {showModal === 'client' && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white animate-in zoom-in duration-200 p-10 font-bold">
                <h3 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter italic">Nuevo Cliente Business</h3>
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), {
                    name: form.name.value, phone: form.phone.value, createdAt: new Date().toISOString()
                  });
                  setShowModal(null);
                }}>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Nombre Completo</label>
                        <input required name="name" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="Ej: Pedro Santos" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">WhatsApp / Teléfono</label>
                        <input required name="phone" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" placeholder="Ej: 809-000-0000" />
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                      <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Guardar en Nube</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
