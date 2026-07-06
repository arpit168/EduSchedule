import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Building2, Plus, Edit2, Trash2, Search, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const RoomsPage = () => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    capacity: 60,
    type: 'Classroom',
    building: 'Main Block',
    floor: '1st Floor',
  });

  const fetchRooms = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const res = await api.get(`/rooms?search=${encodeURIComponent(searchQuery)}`);
      setRooms(res.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRooms]);

  const handleOpenModal = (r = null) => {
    if (r) {
      setEditingRoom(r);
      setFormData({
        roomNumber: r.roomNumber,
        capacity: r.capacity || 60,
        type: r.type || 'Classroom',
        building: r.building || 'Main Block',
        floor: r.floor || '1st Floor',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        roomNumber: `Room ${Math.floor(100 + Math.random() * 300)}`,
        capacity: 60,
        type: 'Classroom',
        building: 'Main Block',
        floor: '1st Floor',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, formData);
        toast.success('Room updated successfully!');
      } else {
        await api.post('/rooms', formData);
        toast.success('Room added successfully!');
      }
      setModalOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Are you sure you want to delete ${number}?`)) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted');
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const exportToExcel = () => {
    const data = rooms.map((r) => ({
      'Room Number': r.roomNumber,
      'Building': r.building,
      'Floor': r.floor,
      'Type': r.type,
      'Capacity': r.capacity,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rooms');
    XLSX.writeFile(workbook, 'Campus_Rooms_2026.xlsx');
    toast.success('Exported to Excel!');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-amber-600 dark:text-amber-400" /> Campus Rooms & Lecture Halls
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage classrooms, computer laboratories, seminar auditoriums, and seating capacities
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all"
            >
              <Plus size={16} /> Add Room
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-medium glass-card rounded-3xl">
          No rooms found. Click "Add Room" to register campus spaces.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((r) => (
            <div key={r._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-amber-500/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    r.type === 'Lab' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {r.type}
                  </span>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mt-2">{r.roomNumber}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{r.building} • {r.floor}</p>
                </div>

                {user?.role === 'Admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(r)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id, r.roomNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Seating Capacity:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{r.capacity} Seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-enter">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-amber-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editingRoom ? 'Edit Room Details' : 'Add New Campus Room'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="Room 101"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Lab">Lab (Computer/Science)</option>
                    <option value="Auditorium">Auditorium / Seminar Hall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Building</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    placeholder="Main Block"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Floor</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="1st Floor"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold text-amber-400"
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
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-600/30"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
