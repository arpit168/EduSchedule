import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  CalendarCheck,
  UserCheck,
  UserX,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  PlusCircle,
  CalendarDays,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#3b82f6'];

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [workloadData, setWorkloadData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, workRes, subRes, roomRes] = await Promise.all([
          api.get('/reports/stats'),
          api.get('/reports/workload'),
          api.get('/reports/subjects'),
          api.get('/reports/rooms'),
        ]);

        setStats(statsRes.data.stats);
        setWorkloadData(workRes.data.data ? workRes.data.data.slice(0, 8) : []);
        setSubjectData(subRes.data.byType || []);
        setRoomData(roomRes.data.data ? roomRes.data.data.slice(0, 6) : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Sample weekly usage data for AreaChart
  const weeklyUsageData = [
    { day: 'Mon', scheduled: 38, free: 10 },
    { day: 'Tue', scheduled: 42, free: 6 },
    { day: 'Wed', scheduled: 40, free: 8 },
    { day: 'Thu', scheduled: 44, free: 4 },
    { day: 'Fri', scheduled: 36, free: 12 },
    { day: 'Sat', scheduled: 24, free: 24 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 text-white shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles size={14} className="text-amber-300" /> Enterprise Academic Portal
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-2 text-sm text-indigo-200 max-w-xl leading-relaxed">
              Here is your campus scheduling overview for the <span className="font-bold text-white">2026-2027</span> academic session. You have <span className="font-bold text-amber-300">{stats?.freeTeachers || 0} free teachers</span> available right now for instant substitutions.
            </p>
          </div>

          {user?.role !== 'Teacher' && (
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/timetable"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-950 font-bold text-sm shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all"
              >
                <CalendarDays size={18} className="text-indigo-600" /> Timetable Builder
              </Link>
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-600 transition-all"
              >
                View Analytics
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top Stat Cards Grid (8 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Teachers</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalTeachers || 0}</span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center">
              +4% <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Classes</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalClasses || 0}</span>
            <span className="text-xs font-semibold text-slate-400">Across 3 depts</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Subjects</span>
            <div className="p-2.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalSubjects || 0}</span>
            <span className="text-xs font-semibold text-violet-500">Theory & Lab</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Rooms</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Building2 size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalRooms || 0}</span>
            <span className="text-xs font-semibold text-emerald-500">100% Active</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02] border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Classes</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.todaysClasses || 31}</span>
            <span className="text-xs font-semibold text-slate-400">Scheduled Today</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02] border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Free Teachers</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats?.freeTeachers || 3}</span>
            <span className="text-xs font-semibold text-slate-400">Available right now</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02] border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Occupied Teachers</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
              <UserX size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats?.occupiedTeachers || 2}</span>
            <span className="text-xs font-semibold text-slate-400">In lecture hall</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl transition-all hover:scale-[1.02] border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Upcoming Lectures</span>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl">
              <Clock size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.upcomingClasses?.length || 8}</span>
            <span className="text-xs font-semibold text-slate-400">Next 4 hours</span>
          </div>
        </div>
      </div>

      {/* Charts Grid Section (4 Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Teacher Workload Chart */}
        <div className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" /> Teacher Workload Distribution
              </h3>
              <p className="text-xs text-slate-400">Assigned periods vs Maximum capacity</p>
            </div>
            <Link to="/reports" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val.split(' ')[val.split(' ').length - 1]} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="assignedPeriods" name="Assigned Periods" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="maxWeeklyPeriods" name="Max Capacity" fill="#334155" radius={[8, 8, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Subject Distribution Chart */}
        <div className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-violet-500" /> Subject Distribution by Type
              </h3>
              <p className="text-xs text-slate-400">Theory, Lab, Seminar, and Project ratio</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Weekly Timetable Usage (Area Chart) */}
        <div className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays size={18} className="text-emerald-500" /> Weekly Timetable Usage
              </h3>
              <p className="text-xs text-slate-400">Scheduled vs Free period trends (Mon - Sat)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSched" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }} />
                <Area type="monotone" dataKey="scheduled" name="Scheduled Classes" stroke="#10b981" fillOpacity={1} fill="url(#colorSched)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Upcoming Classes & Live Timeline */}
        <div className="glass-card p-6 rounded-3xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-cyan-500" /> Upcoming Lectures Today
              </h3>
              <p className="text-xs text-slate-400">Live campus timeline & room allocation</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-72">
            {stats?.upcomingClasses && stats.upcomingClasses.length > 0 ? (
              stats.upcomingClasses.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                      <span>P{item.periodNumber}</span>
                      <span className="text-[9px] text-slate-400">{item.timeSlot?.split('-')[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.subject?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.teacher?.name} • <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.classRef?.className} {item.classRef?.section}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shrink-0">
                    {item.room?.roomNumber}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                No more upcoming lectures today! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
