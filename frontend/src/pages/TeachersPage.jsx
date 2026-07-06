import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Users, Plus, Edit2, Trash2, Search, Download, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const TeachersPage = () => {
  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    experience: 0,
    maxDailyPeriods: 4,
    maxWeeklyPeriods: 20,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  });

  const fetchTeachers = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const [tRes, dRes] = await Promise.all([
        api.get(`/teachers?department=${selectedDept}&search=${encodeURIComponent(searchQuery)}`),
        api.get('/departments'),
      ]);
      setTeachers(tRes.data.data || []);
      setDepartments(dRes.data.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTeachers]);

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingTeacher(t);
      setFormData({
        name: t.name,
        employeeId: t.employeeId,
        email: t.email,
        phone: t.phone || '',
        department: t.department?._id || t.department || '',
        qualification: t.qualification || '',
        experience: t.experience || 0,
        maxDailyPeriods: t.maxDailyPeriods || 4,
        maxWeeklyPeriods: t.maxWeeklyPeriods || 20,
        workingDays: t.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        email: '',
        phone: '',
        department: departments[0]?._id || '',
        qualification: '',
        experience: 0,
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 20,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher._id}`, formData);
        toast.success('Teacher updated successfully!');
      } else {
        await api.post('/teachers', formData);
        toast.success('Teacher added successfully!');
      }
      setModalOpen(false);
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save teacher');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted');
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const exportToExcel = () => {
    const data = teachers.map((t) => ({
      'Employee ID': t.employeeId,
      'Name': t.name,
      'Email': t.email,
      'Phone': t.phone,
      'Department': t.department?.name || 'N/A',
      'Qualification': t.qualification,
      'Experience (Yrs)': t.experience,
      'Max Daily': t.maxDailyPeriods,
      'Max Weekly': t.maxWeeklyPeriods,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
    XLSX.writeFile(workbook, 'Faculty_Directory_2026.xlsx');
    toast.success('Exported faculty directory to Excel!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" /> Faculty & Teachers Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage teaching staff, workload capacities, qualifications, and working schedules
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus size={16} /> Add Teacher
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, ID, qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
          </input>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Grid/Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teachers.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-medium glass-card rounded-3xl">
          No teachers found. Click "Add Teacher" to add new faculty members.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div key={t._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-indigo-500/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={t.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={t.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {t.employeeId}
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white mt-1">{t.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.department?.name || 'General Dept'}</p>
                  </div>
                </div>

                {user?.role === 'Admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id, t.name)}
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
                  <span>Email:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[12rem]">{t.email}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Qualification:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{t.qualification || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Experience:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{t.experience || 0} years</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Max Capacity:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{t.maxWeeklyPeriods} periods / week</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-enter">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editingTeacher ? 'Edit Teacher Details' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Prof. Anita Verma"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP1005"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="anita@Learning.edu"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="Ph.D in CSE"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Max Daily Periods</label>
                  <input
                    type="number"
                    value={formData.maxDailyPeriods}
                    onChange={(e) => setFormData({ ...formData, maxDailyPeriods: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Max Weekly Periods</label>
                  <input
                    type="number"
                    value={formData.maxWeeklyPeriods}
                    onChange={(e) => setFormData({ ...formData, maxWeeklyPeriods: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold text-indigo-400"
                  />
                </div>
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
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
