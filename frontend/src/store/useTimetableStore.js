import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';

const useTimetableStore = create((set, get) => ({
  activeTimetables: [],
  selectedClass: 'all',
  selectedTeacher: 'all',
  viewMode: 'teacher', // 'teacher' (Rows=Teachers) or 'class' (Rows=Classes)
  zoomLevel: 100, // 75, 100, 125, 150
  sessionYear: '2026-2027',
  isLoading: false,
  
  // Conflict Popup Modal State
  conflictModalOpen: false,
  pendingSlotAction: null, // holds slot data waiting for user to either cancel or force bypass
  conflictDetails: [],

  // Undo / Redo Stack
  undoStack: [],
  redoStack: [],

  setSessionYear: (year) => {
    set({ sessionYear: year });
    get().fetchTimetables();
  },
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setSelectedTeacher: (t) => set({ selectedTeacher: t }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setZoomLevel: (level) => set({ zoomLevel: Math.max(75, Math.min(150, level)) }),
  closeConflictModal: () => set({ conflictModalOpen: false, pendingSlotAction: null, conflictDetails: [] }),

  fetchTimetables: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/timetables?sessionYear=${get().sessionYear}`);
      set({ activeTimetables: res.data.data || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch timetables:', error);
      toast.error('Failed to load timetables');
      set({ isLoading: false });
    }
  },

  // Save current state to undo stack before mutation
  saveToUndoStack: () => {
    const current = JSON.parse(JSON.stringify(get().activeTimetables));
    set((state) => ({
      undoStack: [current, ...state.undoStack.slice(0, 19)], // keep last 20 states
      redoStack: [], // clear redo on new action
    }));
  },

  updateSlot: async ({ classRefId, day, periodNumber, subject, teacher, room, force = false }) => {
    try {
      if (!force) {
        // Pre-flight conflict check
        const checkRes = await api.post('/timetables/check-conflict', {
          classRefId,
          day,
          periodNumber,
          teacherId: teacher || null,
          roomId: room || null,
          sessionYear: get().sessionYear,
        });

        if (checkRes.data && checkRes.data.hasConflict && checkRes.data.criticalCount > 0) {
          // Trigger conflict popup modal!
          set({
            conflictModalOpen: true,
            pendingSlotAction: { type: 'UPDATE_SLOT', data: { classRefId, day, periodNumber, subject, teacher, room } },
            conflictDetails: checkRes.data.conflicts || [],
          });
          return { success: false, conflict: true };
        }
      }

      get().saveToUndoStack();

      const res = await api.post('/timetables', {
        classRefId,
        sessionYear: get().sessionYear,
        day,
        periodNumber,
        subject,
        teacher,
        room,
        force,
      });

      toast.success(force ? 'Slot updated (Conflict Bypassed)!' : 'Timetable slot updated!');
      get().closeConflictModal();
      await get().fetchTimetables();
      return { success: true, data: res.data.data };
    } catch (error) {
      if (error.response?.status === 409) {
        set({
          conflictModalOpen: true,
          pendingSlotAction: { type: 'UPDATE_SLOT', data: { classRefId, day, periodNumber, subject, teacher, room } },
          conflictDetails: error.response.data.conflicts || [],
        });
        return { success: false, conflict: true };
      }
      toast.error(error.response?.data?.message || 'Failed to update slot');
      return { success: false };
    }
  },

  swapSlots: async ({ source, target, force = false }) => {
    try {
      if (!force) {
        get().saveToUndoStack();
      }

      await api.post('/timetables/swap', {
        source,
        target,
        sessionYear: get().sessionYear,
        force,
      });

      toast.success('Periods swapped successfully!');
      get().closeConflictModal();
      await get().fetchTimetables();
      return { success: true };
    } catch (error) {
      if (error.response?.status === 409) {
        set({
          conflictModalOpen: true,
          pendingSlotAction: { type: 'SWAP_SLOTS', data: { source, target } },
          conflictDetails: error.response.data.conflicts || [],
        });
        return { success: false, conflict: true };
      }
      toast.error(error.response?.data?.message || 'Failed to swap periods');
      return { success: false };
    }
  },

  forceExecutePendingAction: async () => {
    const action = get().pendingSlotAction;
    if (!action) return;

    if (action.type === 'UPDATE_SLOT') {
      await get().updateSlot({ ...action.data, force: true });
    } else if (action.type === 'SWAP_SLOTS') {
      await get().swapSlots({ ...action.data, force: true });
    }
  },

  autoGenerate: async ({ departmentId, classRefId, overwriteExisting = true }) => {
    set({ isLoading: true });
    get().saveToUndoStack();
    try {
      const res = await api.post('/timetables/auto-generate', {
        sessionYear: get().sessionYear,
        departmentId: departmentId === 'all' ? null : departmentId,
        classRefId: classRefId === 'all' ? null : classRefId,
        overwriteExisting,
      });
      toast.success(`Generated schedules for ${res.data.classesGenerated} classes!`);
      await get().fetchTimetables();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Auto-generation failed');
      set({ isLoading: false });
      return { success: false };
    }
  },

  undo: async () => {
    const stack = get().undoStack;
    if (stack.length === 0) {
      toast.error('Nothing to undo');
      return;
    }
    const previousState = stack[0];
    const current = JSON.parse(JSON.stringify(get().activeTimetables));

    set((state) => ({
      activeTimetables: previousState,
      undoStack: state.undoStack.slice(1),
      redoStack: [current, ...state.redoStack.slice(0, 19)],
    }));

    toast.success('Undo successful (Local state restored)');
  },

  redo: async () => {
    const stack = get().redoStack;
    if (stack.length === 0) {
      toast.error('Nothing to redo');
      return;
    }
    const nextState = stack[0];
    const current = JSON.parse(JSON.stringify(get().activeTimetables));

    set((state) => ({
      activeTimetables: nextState,
      redoStack: state.redoStack.slice(1),
      undoStack: [current, ...state.undoStack.slice(0, 19)],
    }));

    toast.success('Redo successful');
  },
}));

// Setup real-time socket listener
socket.on('timetable_updated', () => {
  useTimetableStore.getState().fetchTimetables();
});

socket.on('timetable_generated', () => {
  useTimetableStore.getState().fetchTimetables();
});

export default useTimetableStore;
