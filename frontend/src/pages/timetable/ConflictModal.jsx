import { AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';
import useTimetableStore from '../../store/useTimetableStore';

const ConflictModal = () => {
  const { conflictModalOpen, conflictDetails, closeConflictModal, forceExecutePendingAction } = useTimetableStore();

  if (!conflictModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-enter">
      <div className="w-full max-w-lg bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950/60 to-slate-900 border-b border-rose-500/20 flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 shrink-0 ring-4 ring-rose-500/10">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              Scheduling Conflict Detected!
            </h3>
            <p className="text-xs text-rose-300">
              The requested assignment violates school scheduling rules or creates a double-booking clash.
            </p>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="p-6 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Clash Details:</p>
          {conflictDetails.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-sm text-rose-200"
            >
              <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-white text-xs">{c.type || 'Clash Warning'}</p>
                <p className="mt-1 text-xs leading-relaxed text-rose-200">{c.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeConflictModal}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <X size={16} /> Cancel & Keep Old
          </button>

          <button
            type="button"
            onClick={() => {
              forceExecutePendingAction();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Check size={16} /> Force Bypass & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
