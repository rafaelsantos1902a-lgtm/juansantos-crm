import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  PlusCircle, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Menu,
  X,
  Calendar,
  CreditCard,
  Trash2,
  ChevronRight,
  Settings,
  CheckCircle2,
  UserPlus
} from 'lucide-react';

/**
 * JUAN SANTOS - COMPRA Y VENTA DE DÓLARES (Versión Empresarial)
 * Sistema optimizado para producción con tasas editables y borrado seguro.
 */

const App = () => {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [isEditingRates, setIsEditingRates] = useState(false);

  // Tasas dinámicas (Editables)
  const [rates, setRates] = useState({ buy: 58.50, sell: 59.35 });
  const [tempRates, setTempRates] = useState({ ...rates });

  // Base de datos (Iniciamos vacíos para producción)
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // --- LÓGICA DE NEGOCIO ---
  const stats = useMemo(() => {
    const buyTotal = transactions.filter(t => t.type === 'compra').reduce((acc, t) => acc + t.amount, 0);
    const sellTotal = transactions.filter(t => t.type === 'venta').reduce((acc, t) => acc + t.amount, 0);
    const profit = transactions
      .filter(t => t.type === 'venta')
      .reduce((acc, t) => acc + (t.amount * (t.rate - rates.buy)), 0);

    return { buyTotal, sellTotal, profit };
  }, [transactions, rates]);

  // --- FUNCIONES DE CONTROL ---
  const saveRates = () => {
    setRates({ ...tempRates });
    setIsEditingRates(false);
  };

  const deleteTransaction = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta transacción? Esta acción no se puede deshacer.")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // --- COMPONENTES ---

  const Modal = ({ title, type, onClose }) => {
    const [isNewClient, setIsNewClient] = useState(false);
    const [formData, setFormData] = useState({
      clientId: '',
      newClientName: '',
      newClientIdNum: '',
      type: 'compra',
      amount: '',
      rate: rates.buy
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      let finalClientId = formData.clientId;

      // Si es cliente nuevo, lo agregamos primero
      if (isNewClient) {
        const newClient = {
          id: Date.now().toString(),
          name: formData.newClientName,
          idNumber: formData.newClientIdNum,
          phone: 'Pendiente'
        };
        setClients([...clients, newClient]);
        finalClientId = newClient.id;
      }

      const amt = parseFloat(formData.amount);
      const rateApplied = formData.type === 'compra' ? rates.buy : rates.sell;
      
      const newTx = {
        id: (Date.now() + 1).toString(),
        date: new Date().toLocaleDateString(),
        clientId: finalClientId,
        type: formData.type,
        amount: amt,
        rate: rateApplied,
        total: amt * rateApplied
      };

      setTransactions([newTx, ...transactions]);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/20 animate-in zoom-in duration-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Sección de Cliente */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-slate-400 uppercase">Información del Cliente</label>
                  <button 
                    type="button" 
                    onClick={() => setIsNewClient(!isNewClient)}
                    className="text-[10px] font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                  >
                    {isNewClient ? "SELECCIONAR EXISTENTE" : "+ NUEVO CLIENTE"}
                  </button>
               </div>
               
               {isNewClient ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in">
                    <input required placeholder="Nombre Completo" className="p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold" 
                      onChange={e => setFormData({...formData, newClientName: e.target.value})} />
                    <input required placeholder="Cédula/ID" className="p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold" 
                      onChange={e => setFormData({...formData, newClientIdNum: e.target.value})} />
                 </div>
               ) : (
                 <select required className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold appearance-none"
                   onChange={e => setFormData({...formData, clientId: e.target.value})}>
                   <option value="">Buscar en base de datos...</option>
                   {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.idNumber}</option>)}
                 </select>
               )}
            </div>

            {/* Detalles de Transacción */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipo</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                    onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="compra">Compra (Entrada)</option>
                    <option value="venta">Venta (Salida)</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monto (USD)</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-lg" 
                    onChange={e => setFormData({...formData, amount: e.target.value})} />
               </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl text-white flex justify-between items-center shadow-lg">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Tasa Aplicada</p>
                  <p className="text-2xl font-black">{formData.type === 'compra' ? rates.buy : rates.sell}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Total en RD$</p>
                  <p className="text-xl font-bold text-blue-400">
                    {(parseFloat(formData.amount || 0) * (formData.type === 'compra' ? rates.buy : rates.sell)).toLocaleString()}
                  </p>
               </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">
              Procesar Transacción
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 text-white transition-all duration-500 flex flex-col fixed h-full z-40`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <DollarSign size={22} strokeWidth={3} />
              </div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Juan Santos</h1>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem icon={<LayoutDashboard size={22}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<Users size={22}/>} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
          <NavItem icon={<ArrowLeftRight size={22}/>} label="Operaciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-6 md:p-12`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Panel Maestro</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Juan Santos Compra y Venta</p>
          </div>
          <button onClick={() => setShowModal('transaction')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
             <PlusCircle size={20}/> NUEVA OPERACIÓN
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Compras" val={`$${stats.buyTotal.toLocaleString()}`} icon={<TrendingUp size={24} />} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
              <StatCard title="Total Ventas" val={`$${stats.sellTotal.toLocaleString()}`} icon={<TrendingDown size={24} />} color="bg-blue-50 text-blue-600 border-blue-100" />
              <StatCard title="Beneficio Neto" val={`RD$ ${stats.profit.toLocaleString()}`} icon={<DollarSign size={24} />} color="bg-amber-50 text-amber-600 border-amber-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CONTROL DE TASAS */}
              <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Settings size={22} className="text-slate-400" /> Tasas del Día</h3>
                  {!isEditingRates ? (
                    <button onClick={() => setIsEditingRates(true)} className="text-[10px] font-black text-blue-600 hover:underline">EDITAR</button>
                  ) : (
                    <button onClick={saveRates} className="text-[10px] font-black text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> GUARDAR</button>
                  )}
                </div>
                
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio Compra</p>
                    {isEditingRates ? (
                      <input type="number" step="0.01" className="text-4xl font-black w-full border-b-2 border-blue-500 outline-none" value={tempRates.buy} onChange={e => setTempRates({...tempRates, buy: parseFloat(e.target.value)})} />
                    ) : (
                      <p className="text-5xl font-black text-slate-900 leading-none">{rates.buy.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="h-px bg-slate-100"></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio Venta</p>
                    {isEditingRates ? (
                      <input type="number" step="0.01" className="text-4xl font-black w-full border-b-2 border-blue-500 outline-none" value={tempRates.sell} onChange={e => setTempRates({...tempRates, sell: parseFloat(e.target.value)})} />
                    ) : (
                      <p className="text-5xl font-black text-slate-900 leading-none">{rates.sell.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ÚLTIMAS OPERACIONES */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-black text-slate-800 flex items-center gap-3"><Calendar size={22} className="text-slate-400" /> Actividad Reciente</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs font-black text-blue-600">VER HISTORIAL</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="p-6">Cliente</th>
                        <th className="p-6">Tipo</th>
                        <th className="p-6 text-right">Monto USD</th>
                        <th className="p-6 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {transactions.slice(0, 5).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6 font-bold text-slate-900">{clients.find(c => c.id === t.clientId)?.name || 'Cliente'}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="p-6 text-right font-black text-slate-900">${t.amount.toLocaleString()}</td>
                          <td className="p-6 text-right">
                             <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <div className="p-20 text-center text-slate-300 italic">No hay operaciones hoy.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Directorio de Clientes</h3>
                <button onClick={() => setShowModal('client')} className="p-4 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all">
                   <UserPlus size={24} />
                </button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <tr>
                      <th className="p-8">Nombre</th>
                      <th className="p-8">Identificación</th>
                      <th className="p-8 text-center">Acciones</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="p-8 font-black text-slate-900">{c.name}</td>
                         <td className="p-8 font-mono text-slate-500">{c.idNumber}</td>
                         <td className="p-8 text-center"><button className="p-2 text-blue-600 font-bold hover:underline">Ver Perfil</button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Historial General</h3>
               <button onClick={() => { if(window.confirm("¿Borrar TODO el historial?")) setTransactions([]) }} className="text-xs font-black text-rose-500 hover:underline">LIMPIAR TODO</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="p-8">Fecha</th>
                        <th className="p-8">Cliente</th>
                        <th className="p-8">Tipo</th>
                        <th className="p-8 text-right">USD</th>
                        <th className="p-8 text-right">Tasa</th>
                        <th className="p-8 text-right">Total RD$</th>
                        <th className="p-8 text-center"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="p-8 text-sm font-bold text-slate-400">{t.date}</td>
                           <td className="p-8 font-black text-slate-900">{clients.find(c => c.id === t.clientId)?.name || 'N/A'}</td>
                           <td className="p-8">
                              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${t.type === 'compra' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                 {t.type}
                              </span>
                           </td>
                           <td className="p-8 text-right font-black text-slate-900">${t.amount.toLocaleString()}</td>
                           <td className="p-8 text-right font-bold text-slate-300">{t.rate.toFixed(2)}</td>
                           <td className="p-8 text-right font-black text-slate-900">RD$ {t.total.toLocaleString()}</td>
                           <td className="p-8 text-center">
                              <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                 <Trash2 size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {showModal && (
          <Modal 
            title={showModal === 'client' ? 'REGISTRO CLIENTE' : 'OPERACIÓN CAMBIO'} 
            type={showModal} 
            onClose={() => setShowModal(null)} 
          />
        )}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 ${
      active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-slate-500'}`}>{icon}</div>
    {isOpen && <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>}
  </button>
);

const StatCard = ({ title, val, icon, color }) => (
  <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl group ${color}`}>
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</p>
        <p className="text-3xl font-black tracking-tighter leading-none">{val}</p>
      </div>
      <div className="bg-white/30 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
        {icon}
      </div>
    </div>
  </div>
);

export default App;
