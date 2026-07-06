import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import useTimetableStore from '../../store/useTimetableStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import ConflictModal from './ConflictModal';
import SlotEditModal from './SlotEditModal';
import AutoGenerateModal from './AutoGenerateModal';
import {
  CalendarDays,
  Users,
  GraduationCap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Sparkles,
  Download,
  Plus,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [
  { num: 1, label: '09:00 - 09:50', time: '09:00 - 09:50' },
  { num: 2, label: '09:50 - 10:40', time: '09:50 - 10:40' },
  { num: 3, label: '10:40 - 11:30', time: '10:40 - 11:30' },
  { num: 4, label: '11:30 - 12:20', time: '11:30 - 12:20' },
  { num: 'LUNCH', label: '12:20 - 01:10', time: '12:20 - 01:10' },
  { num: 5, label: '01:10 - 02:00', time: '01:10 - 02:00' },
  { num: 6, label: '02:00 - 02:50', time: '02:00 - 02:50' },
  { num: 7, label: '02:50 - 03:40', time: '02:50 - 03:40' },
  { num: 8, label: '03:40 - 04:30', time: '03:40 - 04:30' },
];

const GridCell = memo(({ row, day, p, slot, classRef, viewMode, onDragStart, onDragOver, onDrop, onCellClick }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const classRefId = classRef?._id || classRef || row.id;

  const handleDragStartLocal = (e) => {
    if (!slot || !slot.subject) return;
    onDragStart(e, classRefId, day, p.num, slot);
  };

  const handleDragOverLocal = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeaveLocal = () => {
    setIsDragOver(false);
  };

  const handleDropLocal = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, classRefId, day, p.num, slot);
  };

  return (
    <td className="p-1.5 border-r border-slate-200/60 dark:border-slate-800/60 min-w-[150px] h-24 align-top">
      <div
        draggable={!!(slot && slot.subject)}
        onDragStart={handleDragStartLocal}
        onDragOver={handleDragOverLocal}
        onDragLeave={handleDragLeaveLocal}
        onDrop={handleDropLocal}
        onClick={() => onCellClick(classRef, day, p.num, slot, row.id, viewMode)}
        className={`h-full w-full rounded-2xl p-2.5 transition-all cursor-pointer relative group flex flex-col justify-between border ${isDragOver
          ? 'bg-indigo-500/20 border-indigo-500 scale-105 shadow-xl z-10 ring-2 ring-indigo-500/50'
          : slot && slot.subject
            ? 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-indigo-500/40'
            : 'bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/80 border-dashed border-slate-300 dark:border-slate-800'
          }`}
      >
        {slot && slot.subject ? (
          <>
            <div className="flex items-start justify-between gap-1">
              <span
                className="font-black text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                title={slot.subject?.name}
              >
                {slot.subject?.name || 'No Subject'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                {slot.subject?.code}
              </span>
            </div>

            <div className="space-y-0.5 mt-auto text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate" title={slot.teacher?.name}>
                  {slot.teacher?.name || 'No Teacher'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{slot.room?.roomNumber || 'No Room'}</span>
                {slot.classRef && (
                  <span className="uppercase font-semibold text-[9px] bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    {slot.classRef?.className} {slot.classRef?.section}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1 text-slate-400 group-hover:text-indigo-500">
            <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Add Period
            </span>
          </div>
        )}
      </div>
    </td>
  );
});

const TimetableBuilderPage = () => {
  const {
    activeTimetables,
    viewMode,
    setViewMode,
    zoomLevel,
    setZoomLevel,
    undoStack,
    redoStack,
    undo,
    redo,
    fetchTimetables,
    swapSlots,
    updateSlot,
  } = useTimetableStore();

  const { user } = useAuthStore();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [selectedDept, setSelectedDept] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [selectedClassInfo, setSelectedClassInfo] = useState(null);
  const [autoGenModalOpen, setAutoGenModalOpen] = useState(false);

  // Drag state
  const [dragSource, setDragSource] = useState(null);

  useEffect(() => {
    fetchTimetables();
    const loadFilters = async () => {
      try {
        const [tRes, cRes, dRes] = await Promise.all([
          api.get('/teachers'),
          api.get('/classes'),
          api.get('/departments'),
        ]);
        setTeachers(tRes.data.data || []);
        setClasses(cRes.data.data || []);
        setDepartments(dRes.data.data || []);
      } catch (error) {
        console.error('Error loading builder filters:', error);
      }
    };
    loadFilters();
  }, [fetchTimetables]);

  const handleCellClick = useCallback((classRef, day, periodNumber, existingSlot, rowId, currentViewMode) => {
    if (currentViewMode === 'class' && classRef) {
      setSelectedClassInfo(classRef);
    } else if (currentViewMode === 'teacher' && existingSlot && existingSlot.classRef) {
      setSelectedClassInfo(existingSlot.classRef);
    } else {
      toast('Switch to "Rows: Classes" view to assign new periods to empty slots!', { icon: '💡' });
      return;
    }
    setSelectedSlotData({
      day,
      periodNumber,
      subject: existingSlot?.subject || null,
      teacher: existingSlot?.teacher || null,
      room: existingSlot?.room || null,
    });
    setEditModalOpen(true);
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, classRefId, day, periodNumber, slot) => {
    if (!slot || !slot.subject) return;
    setDragSource({ classRefId, day, periodNumber, slot });
    e.dataTransfer.setData('text/plain', JSON.stringify({ classRefId, day, periodNumber }));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e, targetClassRefId, targetDay, targetPeriodNumber, targetSlot) => {
    e.preventDefault();
    if (!dragSource) return;

    if (
      dragSource.classRefId === targetClassRefId &&
      dragSource.day === targetDay &&
      dragSource.periodNumber === targetPeriodNumber
    ) {
      return; // Dropped on same cell
    }

    if (targetSlot && targetSlot.subject) {
      // Both cells occupied -> SWAP
      await swapSlots({
        source: { classRefId: dragSource.classRefId, day: dragSource.day, periodNumber: dragSource.periodNumber },
        target: { classRefId: targetClassRefId, day: targetDay, periodNumber: targetPeriodNumber },
      });
    } else {
      // Target cell empty -> MOVE (update target with source data, clear source)
      await updateSlot({
        classRefId: targetClassRefId,
        day: targetDay,
        periodNumber: targetPeriodNumber,
        subject: dragSource.slot.subject._id,
        teacher: dragSource.slot.teacher?._id || null,
        room: dragSource.slot.room?._id || null,
      });

      // Clear source cell
      await updateSlot({
        classRefId: dragSource.classRefId,
        day: dragSource.day,
        periodNumber: dragSource.periodNumber,
        subject: null,
        teacher: null,
        room: null,
      });
    }
    setDragSource(null);
  }, [dragSource, swapSlots, updateSlot]);

  const exportToExcel = () => {
    const data = [];
    activeTimetables.forEach((tt) => {
      tt.slots.forEach((s) => {
        if (s.subject) {
          data.push({
            'Class': `${tt.classRef?.className} ${tt.classRef?.section}`,
            'Day': s.day,
            'Period': `Period ${s.periodNumber} (${s.timeSlot || ''})`,
            'Subject Code': s.subject?.code,
            'Subject Name': s.subject?.name,
            'Teacher': s.teacher?.name || 'N/A',
            'Room': s.room?.roomNumber || 'N/A',
          });
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Timetables');
    XLSX.writeFile(workbook, 'Master_Timetables_2026_2027.xlsx');
    toast.success('Timetables exported to Excel successfully!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    doc.setFontSize(18);
    doc.text('Learning Timetable OS - Master Campus Timetables', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Academic Session: 2026-2027 | Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const head = [['Class', 'Day', 'Period', 'Subject', 'Teacher', 'Room']];
    const body = [];

    activeTimetables.forEach((tt) => {
      tt.slots.forEach((s) => {
        if (s.subject) {
          body.push([
            `${tt.classRef?.className} ${tt.classRef?.section}`,
            s.day,
            `P${s.periodNumber}`,
            `${s.subject?.name} (${s.subject?.code})`,
            s.teacher?.name || 'N/A',
            s.room?.roomNumber || 'N/A',
          ]);
        }
      });
    });

    autoTable(doc, {
      startY: 35,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
    });

    doc.save('master_timetables_2026.pdf');
    toast.success('Timetables exported to PDF successfully!');
  };

  // Prepare Grid Rows based on View Mode
  const gridRows = useMemo(() => {
    if (viewMode === 'class') {
      // Rows = Classes
      const filteredClasses = classes.filter((c) => {
        if (selectedDept !== 'all' && c.department?._id !== selectedDept && c.department !== selectedDept) return false;
        if (filterClass !== 'all' && c._id !== filterClass) return false;
        return true;
      });

      return filteredClasses.map((c) => {
        const tt = activeTimetables.find((t) => t.classRef?._id === c._id);
        return {
          id: c._id,
          title: `${c.className} ${c.section}`,
          subtitle: `Sem ${c.semester} • Str: ${c.strength || 60}`,
          classRef: c,
          slots: tt ? tt.slots : [],
        };
      });
    } else {
      // Rows = Teachers (default as requested!)
      const filteredTeachers = teachers.filter((t) => {
        if (selectedDept !== 'all' && t.department?._id !== selectedDept && t.department !== selectedDept) return false;
        if (filterTeacher !== 'all' && t._id !== filterTeacher) return false;
        return true;
      });

      return filteredTeachers.map((t) => {
        // Find all slots where this teacher teaches across all timetables
        const tSlots = [];
        activeTimetables.forEach((tt) => {
          tt.slots.forEach((s) => {
            if (s.teacher && (s.teacher._id === t._id || s.teacher === t._id)) {
              tSlots.push({ ...s, classRef: tt.classRef });
            }
          });
        });

        return {
          id: t._id,
          title: t.name,
          subtitle: `${t.employeeId} • ${t.department?.code || 'General'}`,
          teacherRef: t,
          slots: tSlots,
          isTeacherRow: true,
        };
      });
    }
  }, [viewMode, classes, teachers, activeTimetables, selectedDept, filterClass, filterTeacher]);

  return (
    <div className="space-y-6 pb-12">
      <ConflictModal />
      <SlotEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        slotData={selectedSlotData}
        classInfo={selectedClassInfo}
      />
      <AutoGenerateModal isOpen={autoGenModalOpen} onClose={() => setAutoGenModalOpen(false)} />

      {/* Header & Controls Bar */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                Interactive Grid
              </span>
              <span className="text-xs text-slate-400">Drag & Drop / Swap enabled</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
              <CalendarDays className="text-indigo-600 dark:text-indigo-400" /> Master Timetable Builder
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl border border-slate-300/50 dark:border-slate-700/50">
              <button
                onClick={() => setViewMode('teacher')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'teacher'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Users size={14} /> Rows: Teachers
              </button>
              <button
                onClick={() => setViewMode('class')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'class'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <GraduationCap size={14} /> Rows: Classes
              </button>
            </div>

            {/* Undo / Redo Buttons */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all relative text-slate-700 dark:text-slate-200"
                title="Undo last change"
              >
                <RotateCcw size={16} />
                {undoStack.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {undoStack.length}
                  </span>
                )}
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all relative text-slate-700 dark:text-slate-200"
                title="Redo"
              >
                <RotateCw size={16} />
                {redoStack.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {redoStack.length}
                  </span>
                )}
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setZoomLevel(zoomLevel - 25)}
                disabled={zoomLevel <= 75}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all text-slate-700 dark:text-slate-200"
              >
                <ZoomOut size={16} />
              </button>
              <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-200 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(zoomLevel + 25)}
                disabled={zoomLevel >= 150}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all text-slate-700 dark:text-slate-200"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Auto-Generate Button */}
            {user?.role === 'Admin' && (
              <button
                onClick={() => setAutoGenModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
              >
                <Sparkles size={16} /> Auto-Generate Timetable
              </button>
            )}

            {/* Export Buttons */}
            <button
              onClick={exportToExcel}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
              title="Export Master Excel"
            >
              <Download size={16} />
            </button>
            <button
              onClick={exportToPDF}
              className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
              title="Export Master PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-4">
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

          {viewMode === 'class' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Class:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.className} {c.section}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Teacher:</span>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="all">All Teachers</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" /> Theory
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" /> Lab
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> Seminar
          </div>
        </div>
      </div>

      {/* Sticky Grid Container */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        <div
          className="overflow-auto custom-scrollbar max-h-[75vh]"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${(100 * 100) / zoomLevel}%` }}
        >
          <table className="w-full border-collapse text-left">
            {/* Sticky Header: Days & Periods */}
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700 shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-100 dark:bg-slate-900 p-4 pl-6 w-64 min-w-[16rem] border-r border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {viewMode === 'class' ? 'Class / Batch' : 'Teacher / Dept'}
                </th>

                {DAYS.map((day) => (
                  <th
                    key={day}
                    colSpan={PERIODS.length}
                    className="p-3 text-center border-r border-slate-200 dark:border-slate-800 font-black text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                  >
                    {day}
                  </th>
                ))}
              </tr>
              <tr className="border-t border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="sticky left-0 z-30 bg-slate-100 dark:bg-slate-900 p-2 pl-6 border-r border-slate-200 dark:border-slate-800">
                  Period / Time
                </th>
                {DAYS.map((day) =>
                  PERIODS.map((p) => (
                    <th
                      key={`${day}-${p.num}`}
                      className={`p-2 text-center min-w-[10rem] border-r border-slate-200/60 dark:border-slate-800/60 ${p.num === 'LUNCH' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 min-w-[5rem]' : ''
                        }`}
                    >
                      <div>{p.name}</div>
                      <div className="text-[9px] font-normal text-slate-400">{p.time}</div>
                    </th>
                  ))
                )}
              </tr>
            </thead>

            {/* Grid Body */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {gridRows.length === 0 ? (
                <tr>
                  <td colSpan={1 + DAYS.length * PERIODS.length} className="p-16 text-center text-slate-400 font-medium">
                    No records found matching the current filter.
                  </td>
                </tr>
              ) : (
                gridRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Sticky Left Column */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-4 pl-6 border-r border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{row.title}</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{row.subtitle}</div>
                    </td>

                    {/* Cells for each Day and Period */}
                    {DAYS.map((day) =>
                      PERIODS.map((p) => {
                        if (p.num === 'LUNCH') {
                          return (
                            <td
                              key={`${row.id}-${day}-lunch`}
                              className="bg-amber-500/5 dark:bg-amber-950/10 border-r border-slate-200/50 dark:border-slate-800/50 text-center font-bold text-[10px] text-amber-500/60 p-2 select-none"
                            >
                              LUNCH
                            </td>
                          );
                        }

                        // Find slot in row.slots
                        const slot = row.slots.find((s) => s.day === day && s.periodNumber === p.num);
                        const classRef = row.isTeacherRow ? slot?.classRef : row.classRef;

                        return (
                          <GridCell
                            key={`${row.id}-${day}-${p.num}`}
                            row={row}
                            day={day}
                            p={p}
                            slot={slot}
                            classRef={classRef}
                            viewMode={viewMode}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onCellClick={handleCellClick}
                          />
                        );
                      })
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetableBuilderPage;
