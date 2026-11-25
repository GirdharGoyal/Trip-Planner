import React, { useEffect, useState } from 'react';
import SearchHero from './components/SearchHero';
import TripList from './components/TripList';
import ItineraryView from './components/ItineraryView';
import { fetchTrips, createTrip, updateTrip, deleteTrip } from './api';
import { X, MapPin, Calendar, IndianRupee, Users, Save } from 'lucide-react';

export default function App() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  const loadTrips = async () => {
    try {
      const res = await fetchTrips();
      setTrips(res.data || []);
    } catch (err) {
      console.error("Failed to load trips:", err);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleCreateTrip = async (tripData) => {
    try {
      await createTrip(tripData);
      await loadTrips();
    } catch (err) {
      console.error("Error creating trip:", err);
    }
  };

  const handleDeleteTrip = async (id) => {
    try {
      await deleteTrip(id);
      await loadTrips();
    } catch (err) {
      console.error("Error deleting trip:", err);
    }
  };

  // Jab user edit icon click karega to modal open hoga
  const handleEditTrip = (trip) => {
    setEditingTrip({ ...trip });
  };

  // Edit submit hone par saari information update hogi
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTrip) return;

    try {
      await updateTrip(editingTrip.id, {
        destination: editingTrip.destination.trim(),
        start_date: editingTrip.start_date,
        end_date: editingTrip.end_date,
        budget: Number(editingTrip.budget),
        travellers: Number(editingTrip.travellers)
      });
      setEditingTrip(null);
      await loadTrips();
    } catch (err) {
      console.error("Error updating trip:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <SearchHero onSaveTrip={handleCreateTrip} />
        <TripList 
          trips={trips} 
          onDelete={handleDeleteTrip} 
          onEdit={handleEditTrip} 
          onView={(trip) => setSelectedTrip(trip)}
        />
      </div>

      {/* Itinerary View Modal */}
      {selectedTrip && (
        <ItineraryView 
          trip={selectedTrip} 
          onClose={() => setSelectedTrip(null)} 
        />
      )}

      {/* All-in-One Edit Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setEditingTrip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-slate-800 mb-1">Edit Trip Details</h3>
            <p className="text-xs text-slate-500 mb-5">Change destination, dates, budget or travelers</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Destination */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <MapPin size={13} className="text-blue-600" /> Destination
                </label>
                <input
                  type="text"
                  required
                  value={editingTrip.destination}
                  onChange={(e) => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                    <Calendar size={13} className="text-blue-600" /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingTrip.start_date}
                    onChange={(e) => setEditingTrip({ ...editingTrip, start_date: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                    <Calendar size={13} className="text-blue-600" /> End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingTrip.end_date}
                    onChange={(e) => setEditingTrip({ ...editingTrip, end_date: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Budget & Travellers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                    <IndianRupee size={13} className="text-emerald-600" /> Budget (INR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={editingTrip.budget}
                    onChange={(e) => setEditingTrip({ ...editingTrip, budget: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                    <Users size={13} className="text-blue-600" /> Travellers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={editingTrip.travellers}
                    onChange={(e) => setEditingTrip({ ...editingTrip, travellers: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTrip(null)}
                  className="w-1/2 py-2.5 border border-slate-200 font-bold rounded-xl text-slate-600 hover:bg-slate-50 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-xs text-gray-400 border-t mt-12">
        MakeMyTrip AI Planner
      </footer>
    </div>
  );
}