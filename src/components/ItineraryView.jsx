import React from 'react';
import { Calendar, Sun, Hotel, IndianRupee, Clock, X } from 'lucide-react';

export default function ItineraryView({ trip, plan: directPlan, onClose }) {
  // Safe helper to extract and parse plan from trip or direct plan prop
  const getParsedPlan = () => {
    const target = directPlan || trip;
    if (!target) return null;

    // Check if it's already the itinerary plan object
    if (target.days && Array.isArray(target.days)) return target;

    // Check inside nested keys
    const raw = target.itinerary_data || target.itinerary || target.final_itinerary;
    if (!raw) return null;

    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return raw;
  };

  const plan = getParsedPlan();

  if (!plan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center relative shadow-2xl">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={20} />
          </button>
          <p className="text-slate-600 text-sm mt-2">
            No detailed itinerary data found for this trip.
          </p>
        </div>
      </div>
    );
  }

  const destinationName = plan.destination || trip?.destination || "Destination";
  const daysList = plan.days || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 relative">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        )}

        {/* Modal Header */}
        <div className="border-b pb-4 pr-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
            AI Itinerary for {destinationName}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {plan.summary || `Curated ${daysList.length}-day journey with authentic local experiences.`}
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl flex items-center gap-3">
            <Sun className="text-amber-600 shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase">Weather Forecast</p>
              <p className="text-xs font-medium text-slate-700">
                {plan.weather_summary || "Pleasant sightseeing weather"}
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200/60 p-3.5 rounded-xl flex items-center gap-3">
            <Hotel className="text-blue-600 shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase">Suggested Stay</p>
              <p className="text-xs font-medium text-slate-700">
                {plan.recommended_hotel || `${destinationName} Comfort Stays`}
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/60 p-3.5 rounded-xl flex items-center gap-3">
            <IndianRupee className="text-emerald-600 shrink-0" size={24} />
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase">Est. AI Budget Spent</p>
              <p className="text-sm font-bold text-emerald-800">
                ₹{Number(plan.total_budget_spent || trip?.budget || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Day by Day Cards */}
        <div className="space-y-5 mt-6">
          <h3 className="text-base font-extrabold text-slate-800">Day-wise Schedule</h3>

          {daysList.map((day, idx) => (
            <div key={day.day_number || idx + 1} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5">
              <div className="flex justify-between items-center border-b border-slate-200/70 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-full">
                    Day {day.day_number || idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-800">
                    {day.theme || "Sightseeing & Exploration"}
                  </h4>
                </div>
                {day.day_total_cost !== undefined && (
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    Day Cost: ₹{day.day_total_cost}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {day.activities && day.activities.length > 0 ? (
                  day.activities.map((act, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 h-fit shrink-0">
                        <Clock size={12} /> {act.time_slot}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-sm text-slate-800">{act.title}</h5>
                          {act.approx_cost_inr !== undefined && (
                            <span className="text-xs font-medium text-slate-500">₹{act.approx_cost_inr}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{act.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific activities listed.</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}