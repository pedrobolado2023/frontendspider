import { useEffect, useState, useMemo } from 'react';
import RateCalendar from './components/RateCalendar';
import RateChart from './components/RateChart';
import { LayoutDashboard, Database, Activity, Search, RefreshCcw } from 'lucide-react';
// import './App.css';

interface Extraction {
  id: string;
  siteId: string;
  data: string; // JSON string
  forDate: string | null;
  createdAt: string;
  site: {
    name: string;
    url: string;
  };
}

interface Rate {
  date: string;
  price: number;
  hotelName: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/extractions`);
      if (!response.ok) throw new Error('Falha ao buscar extrações');
      const data = await response.json();
      setExtractions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rates: Rate[] = useMemo(() => extractions.flatMap(ex => {
    try {
      const items = JSON.parse(ex.data);
      if (!Array.isArray(items)) return [];
      
      // If it's the calendar format (array of prices)
      if (typeof items[0] === 'number' || (items[0] && typeof items[0] === 'object' && !items[0].preco)) {
          // This project seems to use a specific format. Let's adapt based on the components.
          // Based on RateCalendar.tsx: Rate { date: string; price: number; hotelName: string; }
          // We'll try to guess the format from the data.
          return items.map((item: any, idx: number) => {
              const date = ex.forDate ? new Date(ex.forDate) : new Date(ex.createdAt);
              if (idx > 0) date.setDate(date.getDate() + idx);
              
              return {
                  date: date.toISOString(),
                  price: typeof item === 'number' ? item : (item.price || item.valor || 0),
                  hotelName: ex.site.name
              };
          });
      }

      // Standard extraction items
      return items.map((item: any) => ({
        date: ex.forDate || item.date || ex.createdAt,
        price: item.price || item.valor || 0,
        hotelName: ex.site.name
      }));
    } catch (e) {
      return [];
    }
  }), [extractions]);

  const hotelNames = useMemo(() => Array.from(new Set(rates.map(r => r.hotelName))), [rates]);
  const chartData = useMemo(() => Array.from(new Set(rates.map(r => r.date.split('T')[0])))
    .sort()
    .map(date => {
      const entry: any = { date };
      hotelNames.forEach(name => {
        const rate = rates.find(r => r.date.startsWith(date) && r.hotelName === name);
        if (rate) entry[name] = rate.price;
      });
      return entry;
    }), [rates, hotelNames]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Spider Hotelaria</h1>
            <p className="text-slate-400 font-medium text-sm">Monitoramento em Tempo Real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700">
            <Database size={18} className="text-blue-400" />
            <span className="font-bold">{extractions.length} solicitações</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold flex items-center gap-3">
          <Activity size={20} />
          {error}. Certifique-se que o backend está rodando em http://localhost:3000
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Carregando dados...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Preço Médio" value={`R$ ${rates.length > 0 ? (rates.reduce((a, b) => a + b.price, 0) / rates.length).toFixed(0) : '0'}`} color="blue" />
            <StatCard label="Hotéis Ativos" value={hotelNames.length.toString()} color="purple" />
            <StatCard label="Última Sincronização" value={extractions.length > 0 ? new Date(extractions[0].createdAt).toLocaleDateString() : 'Sem dados'} color="emerald" />
          </div>

          {/* Chart Section */}
          <section>
            <RateChart data={chartData} hotelNames={hotelNames} />
          </section>

          {/* Calendar Section */}
          <section>
            <RateCalendar rates={rates} />
          </section>

          {/* Requests Table */}
          <section className="bg-slate-800/30 rounded-[32px] border border-slate-700/50 overflow-hidden">
            <div className="p-8 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-xl font-bold">Solicitações Recentes</h3>
              <Search size={20} className="text-slate-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">ID</th>
                    <th className="px-8 py-4">Hotel</th>
                    <th className="px-8 py-4">Data/Hora</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {extractions.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-4 font-mono text-[10px] text-slate-500">{ex.id}</td>
                      <td className="px-8 py-4 font-bold">{ex.site.name}</td>
                      <td className="px-8 py-4 text-slate-400">{new Date(ex.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          Sucesso
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-600/10 border-blue-600/20',
    purple: 'text-purple-400 bg-purple-600/10 border-purple-600/20',
    emerald: 'text-emerald-400 bg-emerald-600/10 border-emerald-600/20'
  };
  return (
    <div className={`p-8 rounded-[32px] border ${colors[color]} backdrop-blur-md`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-60">{label}</p>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}

export default App;
