import React from 'react';
import { Trash2, Edit3, MapPin, Calendar, IndianRupee, Bed, Compass, CloudSun } from 'lucide-react';
export default function TripList({ trips = [], onDelete, onEdit, onView }) {
  console.log("Database se aaya trip object:", trips[0]); // <--- Yahan console log dekhein
  if (!trips.length) {
    return (
      <div className="text-center py-16 text-gray-500 font-medium">
        No trips created yet. Search above and click Create to add one!
      </div>
    );
  }

  // Safe parsing helper function
  const parseItinerary = (trip) => {
    const raw = trip.itinerary_data || trip.itinerary || trip.final_itinerary;
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h2 className="text-xl font-extrabold text-gray-900">Your Saved Trips & Itineraries</h2>
        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
          {trips.length} {trips.length === 1 ? 'Trip' : 'Trips'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trips.map((trip) => {
          const itin = parseItinerary(trip);

          // 1. Dynamic Hotel
          const hotel =
            trip.recommended_hotel ||
            itin?.recommended_hotel ||
            `${trip.destination} Comfort Stays`;

          // 2. Dynamic Activities (AI ke Day 1 se real spots nikalna)
          const dynamicActivities = itin?.days?.[0]?.activities?.slice(0, 2) || [];

          // 3. Dynamic Weather (agar available ho)
          const weather = itin?.weather_summary || null;

          return (
            <div
              key={trip.id}
              onClick={() => {
                console.log("Card clicked for trip:", trip);
                if (onView) onView(trip);
              }}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer relative"
            >

              {/* Header: Destination & Actions */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5 capitalize">
                    <MapPin size={18} className="text-red-500" /> {trip.destination}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} /> {trip.start_date || '2026-12-10'} to {trip.end_date || '2026-12-15'}
                  </p>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(trip)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                      title="Edit Budget"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(trip.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                      title="Delete Trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Budget & Travellers */}
              <div className="mt-4 flex justify-between items-center text-sm py-2 px-3 bg-slate-50 rounded-lg">
                <span className="font-bold text-gray-800 flex items-center">
                  <IndianRupee size={15} /> {Number(trip.budget || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {trip.travellers || 1} {trip.travellers > 1 ? 'Travellers' : 'Traveller'}
                </span>
              </div>

              {/* Weather Summary (Optional Badge) */}
              {weather && (
                <div className="mt-3 flex items-center gap-1 text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                  <CloudSun size={14} className="text-sky-500 shrink-0" />
                  <span className="truncate">{weather}</span>
                </div>
              )}

              {/* HOTELS & STAYS */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <Bed size={14} /> HOTELS & STAYS
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-200">
                    {hotel}
                  </span>
                </div>
              </div>

              {/* HIGHLIGHTS & SPOTS */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Compass size={14} /> HIGHLIGHTS & SPOTS
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {dynamicActivities.length > 0 ? (
                    dynamicActivities.map((act, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-200"
                      >
                        {act.title}
                      </span>
                    ))
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                      Explore {trip.destination} Landmarks & Heritage
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
