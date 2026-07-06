import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GraduationCap, Calendar, Download, Users, Building2, BookOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 'LUNCH', 5, 6, 7, 8];

const ClassTimetablePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetableData, setTimetableData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        const list = res.data.data || [];
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassId(list[0]._id);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const fetchTT = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/timetables/class/${selectedClassId}`);
          setTimetableData(res.data.data);
        } catch (error) {
          console.error('Error fetching class timetable:', error);
          setTimetableData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTT();
    }
  }, [selectedClassId]);

  const selectedClassObj = classes.find((c) => c._id === selectedClassId);

  const exportToExcel = () => {
    if (!timetableData) return;
    const data = timetableData.slots.map((s) => ({
      'Day': s.day,
      'Period': `Period ${s.periodNumber}`,
      'Time Slot': s.timeSlot || '09:00 - 09:45',
      'Subject Code': s.subject?.code || 'N/A',
      'Subject Name': s.subject?.name || 'FREE',
      'Teacher': s.teacher?.name || 'N/A',
      'Room': s.room?.roomNumber || 'TBA',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Schedule');
    XLSX.writeFile(workbook, `Class_${selectedClassObj?.className}_${selectedClassObj?.section}_Schedule.xlsx`);
    toast.success('Exported to Excel!');
  };

  const exportToPDF = () => {
    if (!timetableData) return;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text(`Antigravity Timetable OS - Class Weekly Schedule`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Class: ${selectedClassObj?.className} ${selectedClassObj?.section} | Sem: ${selectedClassObj?.semester} | Batch: ${selectedClassObj?.batch}`, 14, 28);

    const head = [['Day', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Lunch', 'Period 5', 'Period 6', 'Period 7', 'Period 8']];
    const body = DAYS.map((day) => {
      const row = [day];
      PERIODS.forEach((p) => {
        if (p === 'LUNCH') {
          row.push('LUNCH');
        } else {
          const slot = timetableData.slots.find((s) => s.day === day && s.periodNumber === p);
          if (slot && slot.subject) {
            row.push(`${slot.subject?.code}\n${slot.teacher?.name?.split(' ')[0] || ''}\n${slot.room?.roomNumber || ''}`);
          } else {
            row.push('FREE');
          }
        }
      });
      return row;
    });

    autoTable(doc, {
      startY: 35,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`Class_${selectedClassObj?.className}_Schedule.pdf`);
    toast.success('Exported to PDF!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Selector & Header */}
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <GraduationCap size={28} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Class Schedule View</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {selectedClassObj ? `${selectedClassObj.className} - Section ${selectedClassObj.section}` : 'Select Class'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Semester {selectedClassObj?.semester || 3} • Batch {selectedClassObj?.batch || '2025-2028'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} {c.section} (Sem {c.semester})
              </option>
            ))}
          </select>

          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download size={15} /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download size={15} /> PDF
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !timetableData ? (
        <div className="p-16 text-center text-slate-400 font-medium glass-card rounded-3xl">
          No schedule has been published for this class yet.
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider">
                  <th className="p-4 pl-6 w-36 border-r border-slate-200 dark:border-slate-800">Day / Period</th>
                  {PERIODS.map((p, idx) => (
                    <th
                      key={idx}
                      className={`p-3 text-center min-w-[9rem] border-r border-slate-200/60 dark:border-slate-800/60 ${
                        p === 'LUNCH' ? 'bg-amber-500/10 text-amber-600 min-w-[5rem]' : ''
                      }`}
                    >
                      {p === 'LUNCH' ? 'LUNCH' : `Period ${p}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {DAYS.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 pl-6 font-black text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 border-r border-slate-200 dark:border-slate-800">
                      {day}
                    </td>

                    {PERIODS.map((p, idx) => {
                      if (p === 'LUNCH') {
                        return (
                          <td
                            key={`${day}-lunch`}
                            className="bg-amber-500/5 dark:bg-amber-950/10 border-r border-slate-200/50 dark:border-slate-800/50 text-center font-bold text-[10px] text-amber-500/60 p-2 select-none"
                          >
                            LUNCH
                          </td>
                        );
                      }

                      const slot = timetableData.slots.find((s) => s.day === day && s.periodNumber === p);

                      return (
                        <td key={`${day}-${p}`} className="p-2 border-r border-slate-200/60 dark:border-slate-800/60 min-w-[9rem] h-24 align-top">
                          {slot && slot.subject ? (
                            <div className="h-full p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 flex flex-col justify-between shadow-sm">
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-extrabold text-xs leading-tight">{slot.subject?.name}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/40 dark:bg-black/40 shrink-0">
                                  {slot.subject?.code}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold opacity-90">
                                <span className="truncate">{slot.teacher?.name || 'TBA'}</span>
                                <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0 font-bold">
                                  {slot.room?.roomNumber}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 text-[10px] font-bold">
                              FREE
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTimetablePage;
