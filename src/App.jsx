import React, { useState, useMemo } from 'react';
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
  Settings,
  CheckCircle2,
  UserPlus,
  Trash2,
  Wallet,
  Plus,
  Phone
} from 'lucide-react';

/**
 * JUAN SANTOS - COMPRA Y VENTA DE DÓLARES
 * Optimización: Registro basado en número de teléfono en lugar de cédula.
 */

const App = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(null); 
  
  const [startingCapital, setStartingCapital] = useState(0);
  const [tempCapital, setTempCapital] = useState("");

  const [rates, setRates] = useState({ buy: 58.50, sell: 59.35 });
  const [isEditingRates, setIsEditingRates] = useState(false);

  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // --- CÁLCULOS ---
  const stats = useMemo(() => {
    const buyTotal = transactions.filter(t => t.type === 'compra').reduce((acc, t) => acc + t.amount, 0);
    const sellTotal = transactions.filter(t => t.type === 'venta').reduce((acc, t) => acc + t.amount, 0);
    
    const profit = transactions
      .filter(t => t.type === 'venta')
      .reduce((acc, t) => acc + (t.amount * (t.rate - rates.buy)), 0);

    const currentBalance = startingCapital + profit;

    return { buyTotal, sellTotal, profit, currentBalance };
  }, [transactions, rates, startingCapital]);

  // --- ACCIONES ---
  const deleteTransaction = (id) => {
    if (window.confirm("¿Seguro que desea eliminar esta operación?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleAddCapital = (e) => {
    e.preventDefault();
    const amount = parseFloat(tempCapital || 0);
    if (amount > 0) {
      setStartingCapital(prev => prev + amount);
      setTempCapital("");
      setShowModal(null);
    }
  };

  // --- COMPONENTE MODAL ---
  const Modal = ({ title, type, onClose }) => {
    const [isNewClient, setIsNewClient] = useState(false);
    const [formData, setFormData] = useState({
      clientId: '',
      newClientName: '',
      newClientPhone: '',
      type: 'compra',
      amount: '',
      rate: rates.buy
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      let finalClientId = formData.clientId;

      if (isNewClient) {
        const newClient = {
          id: Date.now().toString(),
          name: formData.newClientName,
          phone: formData.newClientPhone
        };
        setClients([...clients, newClient]);
        finalClientId = newClient.id;
      }

      const amt = parseFloat(formData.amount);
      const rateApplied = parseFloat(formData.rate);
      
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

    if (type === 'add_capital') {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white animate-in zoom-in duration-200">
             <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                  <Wallet size={32} />
                </div>
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight text-center">Inyectar Capital</h3>
             <p className="text-xs text-slate-500 mb-8 text-center font-bold uppercase tracking-widest">Añadir fondos a la caja (RD$)</p>
             <form onSubmit={handleAddCapital}>
               <input 
                 autoFocus
                 required
                 type="number" 
                 step="0.01"
                 placeholder="Monto a sumar..." 
                 className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl outline-none focus:border-blue-500 text-3xl font-black text-center mb-6" 
                 value={tempCapital}
                 onChange={e => setTempCapital(e.target.value)}
               />
               <div className="flex gap-4">
                 <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Cancelar</button>
                 <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Confirmar</button>
               </div>
             </form>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white animate-in zoom-in duration-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información del Cliente</label>
                  <button type="button" onClick={() => setIsNewClient(!isNewClient)} className="text-[10px] font-black text-blue-600 hover:underline">
                    {isNewClient ? "LISTA DE CLIENTES" : "+ CLIENTE NUEVO"}
                  </button>
               </div>
               {isNewClient ? (
                 <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Nombre" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" 
                      onChange={e => setFormData({...formData, newClientName: e.target.value})} />
                    <input required placeholder="Número Tel." className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" 
                      onChange={e => setFormData({...formData, newClientPhone: e.target.value})} />
                 </div>
               ) : (
                 <select required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold appearance-none"
                   onChange={e => setFormData({...formData, clientId: e.target.value})}>
                   <option value="">Seleccionar cliente...</option>
                   {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                 </select>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold"
                    onChange={e => {
                      const newType = e.target.value;
                      setFormData({...formData, type: newType, rate: newType === 'compra' ? rates.buy : rates.sell});
                    }}>
                    <option value="compra">Compra (Entrada)</option>
                    <option value="venta">Venta (Salida)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dólares (USD)</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-2xl" 
                    onChange={e => setFormData({...formData, amount: e.target.value})} />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tasa Negociada (RD$)</label>
               <input required type="number" step="0.01" value={formData.rate} className="w-full p-4 bg-blue-50 border-4 border-blue-100 rounded-2xl outline-none focus:border-blue-500 font-black text-3xl text-blue-700" 
                 onChange={e => setFormData({...formData, rate: e.target.value})} />
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-2xl">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Operación</span>
               <span className="text-3xl font-black text-blue-400 tracking-tighter">RD$ {(parseFloat(formData.amount || 0) * parseFloat(formData.rate || 0)).toLocaleString()}</span>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
              Finalizar Registro
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
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
                <DollarSign size={20} strokeWidth={4} />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase">Juan Santos</h1>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem icon={<LayoutDashboard size={22}/>} label="Escritorio" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<Users size={22}/>} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
          <NavItem icon={<ArrowLeftRight size={22}/>} label="Operaciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-6 md:p-12`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Mi Escritorio</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Gestión de Divisas Juan Santos</p>
          </div>
          <button onClick={() => setShowModal('transaction')} className="bg-slate-900 text-white px-8 py-5 rounded-3xl font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95">
             NUEVA OPERACIÓN
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard 
                title="Capital de Trabajo" 
                val={`RD$ ${startingCapital.toLocaleString()}`} 
                icon={<Wallet size={20}/>} 
                color="bg-white text-slate-900 border-slate-200" 
                action={() => setShowModal('add_capital')}
                actionLabel="+ AÑADIR"
              />
              <StatCard title="Entrada (USD)" val={`$${stats.buyTotal.toLocaleString()}`} icon={<TrendingUp size={20}/>} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
              <StatCard title="Salida (USD)" val={`$${stats.sellTotal.toLocaleString()}`} icon={<TrendingDown size={20}/>} color="bg-blue-50 text-blue-600 border-blue-100" />
              <StatCard title="Efectivo en Caja" val={`RD$ ${stats.currentBalance.toLocaleString()}`} icon={<CheckCircle2 size={20}/>} color="bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-900/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CONTROL DE TASAS */}
              <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight"><Settings size={20} className="text-slate-400" /> Tasas Guía</h3>
                    <button onClick={() => setIsEditingRates(!isEditingRates)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                      {isEditingRates ? "GUARDAR" : "EDITAR"}
                    </button>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Compra Referencia</p>
                      {isEditingRates ? 
                        <input type="number" step="0.1" className="text-5xl font-black w-full border-b-4 border-blue-500 outline-none pb-2 bg-transparent" value={rates.buy} onChange={e => setRates({...rates, buy: parseFloat(e.target.value)})} /> :
                        <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{rates.buy.toFixed(2)}</p>
                      }
                    </div>
                    <div className="h-px bg-slate-100 w-full"></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Venta Referencia</p>
                      {isEditingRates ? 
                        <input type="number" step="0.1" className="text-5xl font-black w-full border-b-4 border-blue-500 outline-none pb-2 bg-transparent" value={rates.sell} onChange={e => setRates({...rates, sell: parseFloat(e.target.value)})} /> :
                        <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{rates.sell.toFixed(2)}</p>
                      }
                    </div>
                  </div>
                </div>
                <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-[10px] font-bold text-blue-400 text-center uppercase tracking-widest">
                  Valores del mercado dominicano
                </div>
              </div>

              {/* ÚLTIMOS REGISTROS */}
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-black text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-slate-400" /> Movimientos Recientes</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">VER HISTORIAL</button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <tr>
                        <th className="p-6">Cliente</th>
                        <th className="p-6">Tipo</th>
                        <th className="p-6 text-right">Monto USD</th>
                        <th className="p-6 text-right">Tasa Aplicada</th>
                        <th className="p-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {transactions.slice(0, 6).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6 font-bold text-slate-900 leading-tight">
                            {clients.find(c => c.id === t.clientId)?.name || 'Cliente'}
                            <div className="text-[10px] font-medium text-slate-400">{clients.find(c => c.id === t.clientId)?.phone || 'No registrado'}</div>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="p-6 text-right font-black text-slate-900 text-lg">${t.amount.toLocaleString()}</td>
                          <td className="p-6 text-right font-bold text-slate-400">{t.rate.toFixed(2)}</td>
                          <td className="p-6 text-right">
                             <button onClick={() => deleteTransaction(t.id)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-300">
                      <PlusCircle size={40} className="mb-4 opacity-20" />
                      <p className="italic font-medium">No hay operaciones registradas aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA CAPITAL INICIAL */}
        {showModal === 'add_capital' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white animate-in zoom-in duration-200">
               <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                    <Wallet size={32} />
                  </div>
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight text-center">Inyectar Capital</h3>
               <p className="text-xs text-slate-500 mb-8 text-center font-bold uppercase tracking-widest">Añadir fondos a la caja (RD$)</p>
               <form onSubmit={handleAddCapital}>
                 <input 
                   autoFocus
                   required
                   type="number" 
                   step="0.01"
                   placeholder="Monto a sumar..." 
                   className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl outline-none focus:border-blue-500 text-3xl font-black text-center mb-6" 
                   value={tempCapital}
                   onChange={e => setTempCapital(e.target.value)}
                 />
                 <div className="flex gap-4">
                   <button type="button" onClick={() => setShowModal(null)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Confirmar</button>
                 </div>
               </form>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
             <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Directorio de Clientes</h3>
                <button onClick={() => setShowModal('client')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <UserPlus size={16}/> NUEVO CLIENTE
                </button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <tr>
                      <th className="p-8">Nombre Completo</th>
                      <th className="p-8">Número de Teléfono</th>
                      <th className="p-8 text-center">Gestión</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {clients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="p-8 font-black text-slate-900 text-lg">{c.name}</td>
                         <td className="p-8 flex items-center gap-2 font-bold text-slate-500">
                            <Phone size={14} className="text-slate-300" />
                            {c.phone}
                         </td>
                         <td className="p-8 text-center"><button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Ver Historial</button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {clients.length === 0 && (
               <div className="p-20 text-center text-slate-300 italic">Lista de clientes vacía.</div>
             )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
             <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Historial Maestro</h3>
                <button onClick={() => { if(window.confirm("¿Desea borrar todo el registro?")) setTransactions([]) }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">LIMPIAR TODO EL REGISTRO</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                     <tr>
                        <th className="p-8">Fecha</th>
                        <th className="p-8">Cliente</th>
                        <th className="p-8">Operación</th>
                        <th className="p-8 text-right">Monto (USD)</th>
                        <th className="p-8 text-right">Tasa RD$</th>
                        <th className="p-8 text-right">Total RD$</th>
                        <th className="p-8"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 group transition-colors">
                           <td className="p-8 text-[10px] font-black text-slate-400 uppercase">{t.date}</td>
                           <td className="p-8 leading-tight">
                              <div className="font-black text-slate-900 text-lg">{clients.find(c => c.id === t.clientId)?.name || 'N/A'}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">{clients.find(c => c.id === t.clientId)?.phone || 'S/N'}</div>
                           </td>
                           <td className="p-8">
                              <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${t.type === 'compra' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                 {t.type}
                              </span>
                           </td>
                           <td className="p-8 text-right font-black text-2xl text-slate-900 tracking-tighter leading-none">${t.amount.toLocaleString()}</td>
                           <td className="p-8 text-right font-bold text-slate-300 tracking-widest">{t.rate.toFixed(2)}</td>
                           <td className="p-8 text-right font-black text-slate-900 text-xl tracking-tight">RD$ {t.total.toLocaleString()}</td>
                           <td className="p-8 text-center">
                              <button onClick={() => deleteTransaction(t.id)} className="p-3 text-rose-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {transactions.length === 0 && (
                 <div className="p-20 text-center text-slate-300 italic">No hay historial de operaciones.</div>
               )}
             </div>
          </div>
        )}

        {showModal && showModal !== 'add_capital' && (
          <Modal title={showModal === 'client' ? 'REGISTRO CLIENTE' : 'REGISTRO DE OPERACIÓN'} type={showModal} onClose={() => setShowModal(null)} />
        )}
      </main>
    </div>
  );
};

// COMPONENTES AUXILIARES
const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-4.5 rounded-[1.5rem] transition-all duration-300 ${
      active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-slate-500'} transition-transform`}>{icon}</div>
    {isOpen && <span className="font-black text-[11px] uppercase tracking-[0.2em]">{label}</span>}
  </button>
);

const StatCard = ({ title, val, icon, color, action, actionLabel }) => (
  <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-xl group ${color}`}>
    <div className="flex justify-between items-start mb-5">
       <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{title}</p>
          <p className="text-3xl font-black tracking-tighter leading-none">{val}</p>
       </div>
       <div className="bg-slate-400/10 p-3 rounded-[1.2rem] group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    {action && (
       <button onClick={action} className="text-[10px] font-black text-blue-600 hover:underline tracking-widest flex items-center gap-1">
         <Plus size={14}/> {actionLabel}
       </button>
    )}
  </div>
);

export default App;
