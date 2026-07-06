import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { CalendarDays, Plus, Edit2, Trash2, Search, Download, X, Clock, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Holiday',
    description: '',
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/calendar');
      setEvents(res.data.data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load academic calendar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (ev = null) => {
    if (ev) {
      setEditingEvent(ev);
      setFormData({
        title: ev.title,
        date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
        type: ev.type || 'Holiday',
        description: ev.description || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Holiday',
        description: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/calendar/${editingEvent._id}`, formData);
        toast.success('Event updated!');
      } else {
        await api.post('/calendar', formData);
        toast.success('Event added!');
      }
      setModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await api.delete(`/calendar/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const exportToExcel = () => {
    const data = events.map((e) => ({
      'Date': e.date ? new Date(e.date).toLocaleDateString() : '',
      'Event Title': e.title,
      'Type': e.type,
      'Description': e.description,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Academic Calendar');
    XLSX.writeFile(workbook, 'Academic_Calendar_2026_2027.xlsx');
    toast.success('Exported to Excel!');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-pink-600 dark:text-pink-400" /> Academic Calendar & Holidays
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage school holidays, examination weeks, workshops, and annual campus events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download size={15} /> Export Excel
          </button>
          {user?.role === 'Admin' && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/20 transition-all"
            >
              <Plus size={16} /> Add Event
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-medium glass-card rounded-3xl">
          No calendar events scheduled. Click "Add Event" to register holidays or exams.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-pink-500/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    ev.type === 'Exam' ? 'bg-rose-500/10 text-rose-500' :
                    ev.type === 'Holiday' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-pink-500/10 text-pink-500'
                  }`}>
                    {ev.type}
                  </span>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white mt-2">{ev.title}</h3>
                  <p className="text-xs text-pink-600 dark:text-pink-400 font-bold mt-1 flex items-center gap-1">
                    <Clock size={13} /> {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                  </p>
                  {ev.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{ev.description}</p>
                  )}
                </div>

                {user?.role === 'Admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(ev)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(ev._id, ev.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-enter">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-pink-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editingEvent ? 'Edit Calendar Event' : 'Add New Academic Event'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Republic Day / Mid-Term Exams"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                  >
                    <option value="Holiday">Holiday</option>
                    <option value="Exam">Examination</option>
                    <option value="Event">Campus Techfest / Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="All academic lectures and labs suspended for the day"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-600/30"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
