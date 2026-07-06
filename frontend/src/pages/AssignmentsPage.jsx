import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { UserCheck, Plus, Edit2, Trash2, Filter, Download, X, BookOpen, GraduationCap, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const AssignmentsPage = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState(null);
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    classRef: '',
    workloadPeriods: 4,
  });

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const [aRes, tRes, sRes, cRes, dRes] = await Promise.all([
        api.get(`/assignments?department=${selectedDept}`),
        api.get('/teachers'),
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/departments'),
      ]);
      setAssignments(aRes.data.data || []);
      setTeachers(tRes.data.data || []);
      setSubjects(sRes.data.data || []);
      setClasses(cRes.data.data || []);
      setDepartments(dRes.data.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleOpenModal = (a = null) => {
    if (a) {
      setEditingAssign(a);
      setFormData({
        teacher: a.teacher?._id || a.teacher || '',
        subject: a.subject?._id || a.subject || '',
        classRef: a.classRef?._id || a.classRef || '',
        workloadPeriods: a.workloadPeriods || 4,
      });
    } else {
      setEditingAssign(null);
      setFormData({
        teacher: teachers[0]?._id || '',
        subject: subjects[0]?._id || '',
        classRef: classes[0]?._id || '',
        workloadPeriods: 4,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssign) {
        await api.put(`/assignments/${editingAssign._id}`, formData);
        toast.success('Assignment updated!');
      } else {
        await api.post('/assignments', formData);
        toast.success('Assignment created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this workload mapping?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment removed');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const exportToExcel = () => {
    const data = assignments.map((a) => ({
      'Teacher': a.teacher?.name || 'N/A',
      'Employee ID': a.teacher?.employeeId || 'N/A',
      'Subject Code': a.subject?.code || 'N/A',
      'Subject Name': a.subject?.name || 'N/A',
      'Class': `${a.classRef?.className || ''} ${a.classRef?.section || ''}`,
      'Workload Periods': a.workloadPeriods,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');
    XLSX.writeFile(workbook, 'Faculty_Course_Assignments_2026.xlsx');
    toast.success('Exported to Excel!');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-indigo-600 dark:text-indigo-400" /> Faculty Course Allocations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map teachers to specific subjects and student batches to define teaching workloads
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
              <Plus size={16} /> Allocate Course
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Department:</span>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-medium glass-card rounded-3xl">
          No course allocations found. Click "Allocate Course" to assign teachers to subjects and classes.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((a) => (
            <div key={a._id} className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:border-indigo-500/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {a.workloadPeriods} periods / wk
                  </span>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                    <BookOpen size={16} className="text-violet-500" /> {a.subject?.name} ({a.subject?.code})
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1 flex items-center gap-1.5">
                    <User size={14} /> {a.teacher?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-emerald-500" /> Class: {a.classRef?.className} - {a.classRef?.section}
                  </p>
                </div>

                {user?.role === 'Admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
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
            <div className="p-6 bg-gradient-to-r from-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editingAssign ? 'Edit Workload Mapping' : 'Allocate Course to Faculty'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Teacher</label>
                <select
                  required
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                >
                  <option value="">-- Faculty Member --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Subject</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => {
                    const sel = subjects.find((s) => s._id === e.target.value);
                    setFormData({ ...formData, subject: e.target.value, workloadPeriods: sel ? sel.weeklyRequiredPeriods : 4 });
                  }}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                >
                  <option value="">-- Course Subject --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Student Batch (Class)</label>
                <select
                  required
                  value={formData.classRef}
                  onChange={(e) => setFormData({ ...formData, classRef: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold"
                >
                  <option value="">-- Student Class --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.className} {c.section} (Sem {c.semester})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Teaching Workload (Periods)</label>
                <input
                  type="number"
                  value={formData.workloadPeriods}
                  onChange={(e) => setFormData({ ...formData, workloadPeriods: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold text-indigo-400"
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
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
