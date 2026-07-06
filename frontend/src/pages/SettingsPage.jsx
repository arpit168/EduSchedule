import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Settings, Check, Shield, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    academicSession: '2026-2027',
    schoolName: 'Learning Academy of Technology & Sciences',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHoursStart: '09:00',
    workingHoursEnd: '16:45',
    maxPeriodsPerDay: 8,
    periodDurationMinutes: 45,
    lunchBreakAfterPeriod: 4,
    lunchDurationMinutes: 45,
    enableConflictPrevention: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/settings');
        if (res.data.data) {
          setFormData({
            academicSession: res.data.data.academicSession || '2026-2027',
            schoolName: res.data.data.schoolName || 'Learning Academy of Technology & Sciences',
            workingDays: res.data.data.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            workingHoursStart: res.data.data.workingHours?.start || '09:00',
            workingHoursEnd: res.data.data.workingHours?.end || '16:45',
            maxPeriodsPerDay: res.data.data.maxPeriodsPerDay || 8,
            periodDurationMinutes: res.data.data.periodDurationMinutes || 45,
            lunchBreakAfterPeriod: res.data.data.lunchBreakAfterPeriod || 4,
            lunchDurationMinutes: res.data.data.lunchDurationMinutes || 45,
            enableConflictPrevention: res.data.data.enableConflictPrevention !== false,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        academicSession: formData.academicSession,
        schoolName: formData.schoolName,
        workingDays: formData.workingDays,
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd,
        },
        maxPeriodsPerDay: Number(formData.maxPeriodsPerDay),
        periodDurationMinutes: Number(formData.periodDurationMinutes),
        lunchBreakAfterPeriod: Number(formData.lunchBreakAfterPeriod),
        lunchDurationMinutes: Number(formData.lunchDurationMinutes),
        enableConflictPrevention: formData.enableConflictPrevention,
      };

      await api.put('/settings', payload);
      toast.success('Campus configuration saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day) => {
    if (formData.workingDays.includes(day)) {
      setFormData({ ...formData, workingDays: formData.workingDays.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, workingDays: [...formData.workingDays, day] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="glass-card p-6 rounded-3xl flex items-center justify-between border-l-4 border-l-indigo-500">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="text-indigo-600 dark:text-indigo-400" /> System & Campus Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure academic session years, working days, period timings, and AI scheduling rules
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          Session {formData.academicSession}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Sparkles size={18} className="text-indigo-500" /> Institution Identity & Academic Session
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">School / College Name</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Academic Session Year</label>
              <input
                type="text"
                required
                value={formData.academicSession}
                onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                placeholder="2026-2027"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Working Days & Hours */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Clock size={18} className="text-emerald-500" /> Working Schedule & Period Timings
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Active Working Days</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const active = formData.workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.workingHoursStart}
                onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={formData.workingHoursEnd}
                onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Daily Periods</label>
              <input
                type="number"
                value={formData.maxPeriodsPerDay}
                onChange={(e) => setFormData({ ...formData, maxPeriodsPerDay: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Period Duration (Mins)</label>
              <input
                type="number"
                value={formData.periodDurationMinutes}
                onChange={(e) => setFormData({ ...formData, periodDurationMinutes: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* AI Scheduling & Rules */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Shield size={18} className="text-rose-500" /> AI Scheduling Rules & Conflict Prevention
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Strict Conflict Prevention Engine</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically block double-bookings and display warning popups during drag-and-drop or manual assignment.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.enableConflictPrevention}
              onChange={(e) => setFormData({ ...formData, enableConflictPrevention: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
          </div>
        </div>

        {user?.role === 'Admin' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={18} />} Save Configuration
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;
