import React, { useState } from 'react';
import { MapPin, Calendar, IndianRupee, Users, Loader2 } from 'lucide-react';

export default function SearchHero({ onSaveTrip }) {
  const [destination, setDestination] = useState('Goa');
  const [startDate, setStartDate] = useState('2026-12-10');
  const [endDate, setEndDate] = useState('2026-12-15');
  const [budget, setBudget] = useState(45000);
  const [travellers, setTravellers] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    try {
      await onSaveTrip({
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        budget: Number(budget),
        travellers: Number(travellers),
      });
    } catch (err) {
      console.error("Trip creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] text-white pt-12 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-black text-rose-500 tracking-wider">my<span className="text-white">trip</span></span>
          <span className="bg-blue-600/30 text-blue-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-500/30">
            AI PLANNER
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-center mb-8">
          Plan Your Next Getaway with AI
        </h1>

        <form onSubmit={handleSubmit} className="bg-white text-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* Destination */}
          <div className="border border-slate-200 rounded-xl p-2.5">
            <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
              <MapPin size={12} className="text-blue-600" /> Destination
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Goa, Jaipur"
              className="w-full text-sm font-bold text-slate-800 outline-none mt-1"
            />
          </div>

          {/* Dates */}
          <div className="border border-slate-200 rounded-xl p-2.5 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Calendar size={12} className="text-blue-600" /> Start & End Date
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 outline-none w-1/2"
              />
              <span className="text-slate-300">-</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-semibold text-slate-700 outline-none w-1/2"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="border border-slate-200 rounded-xl p-2.5">
            <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
              <IndianRupee size={12} className="text-emerald-600" /> Budget (INR)
            </label>
            <input
              type="number"
              required
              min="1000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full text-sm font-bold text-slate-800 outline-none mt-1"
            />
          </div>

          {/* Travellers & Button */}
          <div className="flex gap-2">
            <div className="border border-slate-200 rounded-xl p-2.5 w-1/2">
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                <Users size={12} className="text-blue-600" /> Travellers
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={travellers}
                onChange={(e) => setTravellers(e.target.value)}
                className="w-full text-sm font-bold text-slate-800 outline-none mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center text-sm transition-all shadow-md"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'CREATE'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}