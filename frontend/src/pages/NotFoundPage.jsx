import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans animate-enter">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-indigo-500/20 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto ring-8 ring-indigo-500/5 animate-bounce">
          <Compass size={32} />
        </div>

        <div>
          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-3">Page Not Found</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The academic portal page you are looking for has either been relocated, renamed, or does not exist in the 2026-2027 curriculum.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link
            to="/"
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Home size={14} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
