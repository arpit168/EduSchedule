import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 'LUNCH', 5, 6, 7, 8];

const TeacherViewPage = () => {
  const { user } = useAuthStore();
  const [teacherSlots, setTeacherSlots] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyTimetable = async () => {
      setIsLoading(true);
      try {
        // First find teacher record by user account or email
        const tRes = await api.get('/teachers');
        const allT = tRes.data.data || [];
        const myT = allT.find((t) => (t.userAccount && t.userAccount._id === user?._id) || t.email === user?.email);

        if (myT) {
          setTeacherInfo(myT);
          const ttRes = await api.get(`/timetables/teacher/${myT._id}`);
          setTeacherSlots(ttRes.data.data || []);
        } else if (user?.role === 'Admin' && allT.length > 0) {
          // If admin is viewing, default to first teacher for preview
          setTeacherInfo(allT[0]);
          const ttRes = await api.get(`/timetables/teacher/${allT[0]._id}`);
          setTeacherSlots(ttRes.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching teacher timetable:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTimetable();
  }, [user]);

  const exportToExcel = () => {
    const data = teacherSlots.map((s) => ({
      'Day': s.day,
      'Period': `Period ${s.periodNumber}`,
      'Time Slot': s.timeSlot || '09:00 - 09:45',
      'Class': `${s.classInfo?.className} ${s.classInfo?.section}`,
      'Subject Code': s.subject?.code,
      'Subject Name': s.subject?.name,
      'Room': s.room?.roomNumber || 'TBA',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Schedule');
    XLSX.writeFile(workbook, `My_Timetable_${teacherInfo?.name?.replace(/\s+/g, '_') || 'Teacher'}.xlsx`);
    toast.success('Exported to Excel!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text(`Learning Timetable OS - Personal Schedule`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Teacher: ${teacherInfo?.name} (${teacherInfo?.employeeId}) | Dept: ${teacherInfo?.department?.name || 'General'}`, 14, 28);

    const head = [['Day', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Lunch', 'Period 5', 'Period 6', 'Period 7', 'Period 8']];
    const body = DAYS.map((day) => {
      const row = [day];
      PERIODS.forEach((p) => {
        if (p === 'LUNCH') {
          row.push('LUNCH');
        } else {
          const slot = teacherSlots.find((s) => s.day === day && s.periodNumber === p);
          if (slot) {
            row.push(`${slot.subject?.code}\n${slot.classInfo?.className} ${slot.classInfo?.section}\n${slot.room?.roomNumber}`);
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
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`My_Timetable_${teacherInfo?.employeeId || 'Schedule'}.pdf`);
    toast.success('Exported to PDF!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-indigo-500">
        <div className="flex items-center gap-4">
          <img
            src={teacherInfo?.profilePhoto || user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={teacherInfo?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {teacherInfo?.employeeId || 'EMP1001'}
              </span>
              <span className="text-xs text-slate-400 font-medium">{teacherInfo?.department?.name || 'Computer Science'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {teacherInfo?.name || user?.name} — My Schedule
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assigned Workload: <span className="font-bold text-indigo-600 dark:text-indigo-400">{teacherSlots.length} periods</span> / week (Max: {teacherInfo?.maxWeeklyPeriods || 20})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider">
                <th className="p-4 pl-6 w-36 border-r border-slate-200 dark:border-slate-800">Day / Period</th>
                {PERIODS.map((p, idx) => (
                  <th
                    key={idx}
                    className={`p-3 text-center min-w-[9rem] border-r border-slate-200/60 dark:border-slate-800/60 ${p === 'LUNCH' ? 'bg-amber-500/10 text-amber-600 min-w-[5rem]' : ''
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
                  <td className="p-4 pl-6 font-black text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 border-r border-slate-200 dark:border-slate-800">
                    {day}
                  </td>

                  {PERIODS.map((p) => {
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

                    const slot = teacherSlots.find((s) => s.day === day && s.periodNumber === p);

                    return (
                      <td key={`${day}-${p}`} className="p-2 border-r border-slate-200/60 dark:border-slate-800/60 min-w-[9rem] h-24 align-top">
                        {slot ? (
                          <div className="h-full p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-950 dark:text-indigo-100 flex flex-col justify-between shadow-sm">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-extrabold text-xs leading-tight">{slot.subject?.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/40 dark:bg-black/40 shrink-0">
                                {slot.subject?.code}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold opacity-90">
                              <span className="truncate">{slot.classInfo?.className} {slot.classInfo?.section}</span>
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
    </div>
  );
};

export default TeacherViewPage;
