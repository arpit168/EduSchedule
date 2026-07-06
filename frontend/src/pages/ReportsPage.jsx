import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  Users,
  Building2,
  UserCheck,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('workload'); // 'workload', 'rooms', 'free'
  const [workloadReport, setWorkloadReport] = useState([]);
  const [roomReport, setRoomReport] = useState([]);
  const [freeTeachers, setFreeTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Filters
  const [selectedDept, setSelectedDept] = useState('all');
  const [freeDay, setFreeDay] = useState('Monday');
  const [freePeriod, setFreePeriod] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [wRes, rRes, dRes] = await Promise.all([
          api.get(`/reports/workload?department=${selectedDept}`),
          api.get('/reports/rooms'),
          api.get('/departments'),
        ]);
        setWorkloadReport(wRes.data.data || []);
        setRoomReport(rRes.data.data || []);
        setDepartments(dRes.data.data || []);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [selectedDept]);

  useEffect(() => {
    if (activeTab === 'free') {
      const fetchFree = async () => {
        try {
          const res = await api.get(`/reports/free-teachers?day=${freeDay}&periodNumber=${freePeriod}&department=${selectedDept}`);
          setFreeTeachers(res.data.data || []);
        } catch (error) {
          console.error('Error loading free teachers:', error);
        }
      };
      fetchFree();
    }
  }, [activeTab, freeDay, freePeriod, selectedDept]);

  const exportToExcel = () => {
    let dataToExport = [];
    let sheetName = 'Report';

    if (activeTab === 'workload') {
      dataToExport = workloadReport.map((r) => ({
        'Employee ID': r.employeeId,
        'Teacher Name': r.name,
        'Department': r.department,
        'Assigned Periods': r.assignedPeriods,
        'Max Capacity': r.maxWeeklyPeriods,
        'Utilization (%)': `${r.utilizationPercentage}%`,
      }));
      sheetName = 'Teacher Workload';
    } else if (activeTab === 'rooms') {
      dataToExport = roomReport.map((r) => ({
        'Room Number': r.roomNumber,
        'Building': r.building,
        'Type': r.type,
        'Capacity': r.capacity,
        'Occupied Periods': r.occupiedPeriods,
        'Utilization (%)': `${r.utilizationPercentage}%`,
      }));
      sheetName = 'Room Utilization';
    } else {
      dataToExport = freeTeachers.map((t) => ({
        'Employee ID': t.employeeId,
        'Teacher Name': t.name,
        'Department': t.department?.name || 'General',
        'Qualification': t.qualification || 'N/A',
        'Phone': t.phone || 'N/A',
      }));
      sheetName = `Free Teachers (${freeDay} P${freePeriod})`;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sheetName.toLowerCase().replace(/\s+/g, '_')}_2026.xlsx`);
    toast.success('Report exported to Excel successfully!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Antigravity Timetable OS - Analytics Report', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    let head = [];
    let body = [];

    if (activeTab === 'workload') {
      head = [['ID', 'Name', 'Department', 'Assigned', 'Max', 'Utilization']];
      body = workloadReport.map((r) => [r.employeeId, r.name, r.department, r.assignedPeriods, r.maxWeeklyPeriods, `${r.utilizationPercentage}%`]);
    } else if (activeTab === 'rooms') {
      head = [['Room', 'Building', 'Type', 'Capacity', 'Occupied', 'Utilization']];
      body = roomReport.map((r) => [r.roomNumber, r.building, r.type, r.capacity, r.occupiedPeriods, `${r.utilizationPercentage}%`]);
    } else {
      head = [['ID', 'Name', 'Department', 'Qualification', 'Phone']];
      body = freeTeachers.map((t) => [t.employeeId, t.name, t.department?.name || 'N/A', t.qualification || 'N/A', t.phone || 'N/A']);
    }

    autoTable(doc, {
      startY: 35,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`report_${activeTab}_2026.pdf`);
    toast.success('Report exported to PDF successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400" /> Reports & Campus Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time workload distribution, room occupancy, and live substitution finder
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download size={15} /> Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('workload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'workload'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users size={16} /> Teacher Workload
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'rooms'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={16} /> Room Utilization
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'free'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck size={16} /> Free Teachers Finder (Substitutions)
          </button>
        </div>

        {/* Department Filter */}
        {(activeTab === 'workload' || activeTab === 'free') && (
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Teacher Workload */}
      {activeTab === 'workload' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Teacher Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Assigned Periods</th>
                  <th className="p-4">Max Capacity</th>
                  <th className="p-4">Utilization</th>
                  <th className="p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {workloadReport.map((item) => (
                  <tr key={item.teacherId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                      <div>
                        {item.name}
                        <span className="block text-xs text-slate-400 font-normal">{item.employeeId}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{item.department}</td>
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{item.assignedPeriods} / wk</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{item.maxWeeklyPeriods} / wk</td>
                    <td className="p-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.utilizationPercentage > 90 ? 'bg-rose-500' : item.utilizationPercentage > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${item.utilizationPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-10 text-right">{item.utilizationPercentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6">
                      {item.utilizationPercentage > 90 ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold">Overloaded</span>
                      ) : item.utilizationPercentage > 50 ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">Optimal</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">Under-utilized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Room Utilization */}
      {activeTab === 'rooms' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Room Number</th>
                  <th className="p-4">Building & Floor</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Occupied Periods</th>
                  <th className="p-4 pr-6">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {roomReport.map((item) => (
                  <tr key={item.roomId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">{item.roomNumber}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{item.building}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{item.capacity} seats</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{item.occupiedPeriods} / 48 wk</td>
                    <td className="p-4 pr-6 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${item.utilizationPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-10 text-right">{item.utilizationPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Free Teachers Finder */}
      {activeTab === 'free' && (
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-3xl flex flex-wrap items-center gap-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Find Substitutes For:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Day:</span>
              <select
                value={freeDay}
                onChange={(e) => setFreeDay(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Period:</span>
              <select
                value={freePeriod}
                onChange={(e) => setFreePeriod(Number(e.target.value))}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">
              <CheckCircle2 size={14} /> Found {freeTeachers.length} Free Teachers
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeTeachers.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 text-sm glass-card rounded-3xl">
                No teachers are free during {freeDay} Period {freePeriod} in this department.
              </div>
            ) : (
              freeTeachers.map((t) => (
                <div key={t._id} className="glass-card p-5 rounded-3xl flex items-start gap-4 hover:border-indigo-500/50 transition-all">
                  <img
                    src={t.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={t.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{t.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">FREE</span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t.department?.name || 'General Dept'}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">{t.qualification}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => toast.success(`Notification sent to ${t.name} for substitution!`)}
                        className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                      >
                        Assign Substitution
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
