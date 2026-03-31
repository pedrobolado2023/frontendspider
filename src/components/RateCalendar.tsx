import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Rate {
  date: string;
  price: number;
  hotelName: string;
}

interface CalendarProps {
  rates: Rate[];
}

const RateCalendar = ({ rates }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayRates = (day: Date) => {
    return rates.filter(r => isSameDay(new Date(r.date), day));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-[32px] border border-slate-700/50 p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h3>
          <p className="text-slate-400 text-sm">Visão mensal das tarifas competitivas</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ChevronLeft />
          </button>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest pb-4">{d}</div>
        ))}
        {days.map((day: Date, idx: number) => {
          const dayRates = getDayRates(day);
          const minRate = dayRates.length > 0 ? Math.min(...dayRates.map(r => r.price)) : null;

          return (
            <div 
              key={idx} 
              className={`min-h-[100px] p-3 rounded-2xl border ${
                isSameDay(day, new Date()) ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-900/30 border-slate-700/30'
              } hover:border-slate-500 transition-all cursor-pointer`}
            >
              <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-blue-400' : 'text-slate-500'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-2 space-y-1">
                {dayRates.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="truncate max-w-[40px] text-slate-400 font-medium">{r.hotelName}</span>
                    <span className={`font-bold ${r.price === minRate ? 'text-emerald-400' : 'text-white'}`}>
                      R$ {r.price.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RateCalendar;
