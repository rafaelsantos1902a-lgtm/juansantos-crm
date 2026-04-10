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
  CreditCard,
  ChevronRight,
  Info
} from 'lucide-react';

/**
 * JUAN SANTOS - COMPRA Y VENTA DE DÓLARES
 * Una aplicación premium diseñada para la eficiencia y claridad financiera.
 */

const App = () => {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(null);

  // Tasas fijas por ahora (en el futuro se conectarán a una API o serán editables)
  const [rates] = useState({ buy: 58.50, sell: 59.35 });

  // Base de datos de prueba (se reemplazará con Supabase)
  const [clients, setClients] = useState([
    { id: '1', name: 'Juan Pérez', idNumber: '402-1234567-8', phone: '809-555-0123' },
    { id: '2', name: 'María Rodríguez', idNumber: '001-9876543-2', phone: '829-555-0456' }
  ]);

  const [transactions, setTransactions] = useState([
    { id: '101', date: '2024-03-25', clientId: '1', type: 'compra', amount: 500, rate: 58.50, total: 29250 },
    { id: '102', date: '2024-03-26', clientId: '2', type: 'venta', amount: 200, rate: 59.35, total: 11870 }
  ]);

  // --- CÁLCULOS INTELIGENTES ---
  const stats = useMemo(() => {
    const buyTotal = transactions.filter(t => t.type === 'compra').reduce((acc, t) => acc + t.amount, 0);
    const sellTotal = transactions.filter(t => t.type === 'venta').reduce((acc, t) => acc + t.amount, 0);
    // Ganancia estimada basada en el diferencial (spread)
    const estimatedProfit = transactions
      .filter(t => t.type === 'venta')
      .reduce((acc, t) => acc + (t.amount * (t.rate - rates.buy)), 0);

    return { buyTotal, sellTotal, estimatedProfit };
  }, [transactions, rates]);

  // --- COMPONENTES ---

  const Modal = ({ title, type, onClose }) => {
    const [formData, setFormData] = useState(
      type === 'client' 
        ? { name: '', idNumber: '', phone: '' } 
        : { clientId: '', type: 'compra', amount: '', rate: rates.buy }
    );

    const handleFormSubmit = (e) => {
      e.preventDefault();
      if (type === 'client') {
        setClients([...clients, { ...formData, id: Date.now().toString() }]);
      } else {
        const amt = parseFloat(formData.amount);
        const rateApplied = formData.type === 'compra' ? rates.buy : rates.sell;
        setTransactions([{
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          clientId: formData.clientId,
          type: formData.type,
          amount: amt,
          rate: rateApplied,
          total: amt * rateApplied
        }, ...transactions]);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{title}</h3>
            <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
          </div>
          <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
            {type === 'client' ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Cliente</label>
                  <input required type="text" placeholder="Ej. Pedro Alcántara" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" 
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cédula</label>
                    <input required type="text" placeholder="000-0000000-0" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" 
                      onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input required type="text" placeholder="809..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold" 
                      onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Cliente</label>
                  <select required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold appearance-none"
                    onChange={e => setFormData({...formData, clientId: e.target.value})}>
                    <option value="">¿Quién es el cliente?</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold appearance-none"
                      onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="compra">Compra (Entrada)</option>
                      <option value="venta">Venta (Salida)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dólares (USD)</label>
                    <input required type="number" step="0.01" placeholder="0.00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-xl" 
                      onChange={e => setFormData({...formData, amount: e.target.value})} />
                  </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-xl">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tasa Aplicada</p>
                    <p className="text-3xl font-black">{formData.type === 'compra' ? rates.buy : rates.sell}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Estimado</p>
                    <p className="text-xl font-bold text-blue-400">RD$ {(parseFloat(formData.amount || 0) * (formData.type === 'compra' ? rates.buy : rates.sell)).toLocaleString()}</p>
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all">
              Confirmar y Guardar
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-slate-900 text-white transition-all duration-500 flex flex-col fixed h-full z-40`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <DollarSign size={28} strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter leading-none uppercase">Juan Santos</h1>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Divisas Pro v1.2</span>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-slate-800 rounded-xl hover:bg-blue-600 transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-4 mt-10">
          <NavItem icon={<LayoutDashboard size={24}/>} label="Escritorio" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<Users size={24}/>} label="Mis Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} isOpen={isSidebarOpen} />
          <NavItem icon={<ArrowLeftRight size={24}/>} label="Transacciones" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} isOpen={isSidebarOpen} />
        </nav>

        {isSidebarOpen && (
          <div className="p-8 mt-auto">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-[10px] font-black text-blue-200 uppercase mb-1">Estatus del Sistema</p>
                 <p className="text-sm font-bold">Base de Datos Lista</p>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
                 <Info size={80} />
               </div>
            </div>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-80' : 'ml-24'} p-6 md:p-12 lg:p-16`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="space-y-2">
             <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Panel de Control</h2>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em]">Gestión Financiera de Divisas</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowModal('transaction')} className="bg-slate-900 text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group">
                <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" /> Nueva Operación
             </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard title="Entrada (Compras)" val={`$${stats.buyTotal.toLocaleString()}`} icon={<TrendingUp size={28} />} color="from-emerald-500 to-teal-600 text-white" />
              <StatCard title="Salida (Ventas)" val={`$${stats.sellTotal.toLocaleString()}`} icon={<TrendingDown size={28} />} color="from-blue-500 to-indigo-600 text-white" />
              <StatCard title="Beneficio Estimado" val={`RD$ ${stats.estimatedProfit.toLocaleString()}`} icon={<DollarSign size={28} />} color="from-amber-400 to-orange-500 text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* PIZARRA DE TASAS */}
              <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] shadow-xl border border-white flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4">
                    <CreditCard size={28} className="text-blue-600" /> Tasa Actual
                  </h3>
                  <div className="space-y-8">
                    <RateBox label="Compra RD$" value={rates.buy} color="text-emerald-600" />
                    <div className="h-px bg-slate-100"></div>
                    <RateBox label="Venta RD$" value={rates.sell} color="text-blue-600" />
                  </div>
                </div>
                <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[10px] text-center font-bold text-slate-400">
                  Actualizado hoy: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* ÚLTIMOS REGISTROS */}
              <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4"><Calendar size={28} className="text-slate-400" /> Recientes</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs font-black text-blue-600 hover:tracking-widest transition-all">VER HISTORIAL COMPLETO</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="p-8">Cliente</th>
                        <th className="p-8">Tipo</th>
                        <th className="p-8 text-right">Monto USD</th>
                        <th className="p-8 text-right">Total RD$</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {transactions.slice(0, 5).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-8 font-black text-slate-900">{clients.find(c => c.id === t.clientId)?.name || 'Cliente'}</td>
                          <td className="p-8">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${t.type === 'compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="p-8 text-right font-black text-slate-900">${t.amount.toLocaleString()}</td>
                          <td className="p-8 text-right font-bold text-slate-400">{t.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="animate-in slide-in-from-right-8 duration-700 space-y-8">
            <div className="flex justify-between items-center">
               <h3 className="text-4xl font-black tracking-tighter">Tus Clientes</h3>
               <button onClick={() => setShowModal('client')} className="p-4 bg-white rounded-3xl shadow-xl hover:bg-slate-900 hover:text-white transition-all">
                  <PlusCircle size={32} />
               </button>
            </div>
            <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                     <tr>
                        <th className="p-8">Nombre Completo</th>
                        <th className="p-8">Cédula / Pasaporte</th>
                        <th className="p-8">WhatsApp</th>
                        <th className="p-8 text-center">Perfil</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {clients.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                           <td className="p-8 font-black text-slate-900 text-lg">{c.name}</td>
                           <td className="p-8 font-mono text-slate-400">{c.idNumber}</td>
                           <td className="p-8 font-bold text-slate-600">{c.phone}</td>
                           <td className="p-8 text-center"><button className="p-3 bg-slate-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={20}/></button></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="animate-in slide-in-from-right-8 duration-700 bg-white rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-end md:items-center gap-6 bg-slate-50/30">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Registro Maestro</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Control total de operaciones mensuales</p>
              </div>
              <div className="flex gap-4">
                 <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-900 transition-all">Exportar Excel</button>
                 <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Filtros Avanzados</button>
              </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                     <tr>
                        <th className="p-10">Fecha</th>
                        <th className="p-10">Cliente</th>
                        <th className="p-10">Operación</th>
                        <th className="p-10 text-right">Monto USD</th>
                        <th className="p-10 text-right">Tasa</th>
                        <th className="p-10 text-right">Total RD$</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="p-10 text-sm font-bold text-slate-400">{t.date}</td>
                           <td className="p-10 font-black text-slate-900 text-xl">{clients.find(c => c.id === t.clientId)?.name || 'N/A'}</td>
                           <td className="p-10">
                              <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${t.type === 'compra' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                 {t.type}
                              </span>
                           </td>
                           <td className="p-10 text-right font-black text-2xl text-slate-900 group-hover:scale-110 transition-transform tracking-tighter">${t.amount.toLocaleString()}</td>
                           <td className="p-10 text-right font-bold text-slate-300">{t.rate.toFixed(2)}</td>
                           <td className="p-10 text-right font-black text-slate-900 text-xl">RD$ {t.total.toLocaleString()}</td>
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

// COMPONENTES AUXILIARES
const NavItem = ({ icon, label, active, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-500 group ${
      active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/50 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`${active ? 'scale-110' : 'group-hover:rotate-12'} transition-transform`}>{icon}</div>
    {isOpen && <span className="font-black text-xs uppercase tracking-[0.2em]">{label}</span>}
  </button>
);

const StatCard = ({ title, val, icon, color }) => (
  <div className={`p-10 rounded-[3rem] shadow-2xl bg-gradient-to-br ${color} transition-all hover:-translate-y-2 hover:shadow-blue-900/10 cursor-default group`}>
    <div className="flex justify-between items-start mb-6">
      <div className="bg-white/20 p-4 rounded-3xl group-hover:rotate-12 transition-transform">
        {icon}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</div>
    </div>
    <div className="text-4xl font-black tracking-tighter">{val}</div>
  </div>
);

const RateBox = ({ label, value, color }) => (
  <div className="group">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
    <div className="flex justify-between items-baseline">
      <span className={`text-6xl font-black tracking-tighter ${color} leading-none`}>{value.toFixed(2)}</span>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">REAL-TIME</span>
    </div>
  </div>
);

export default App;
