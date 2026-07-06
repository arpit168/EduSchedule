import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-br from-slate-50 via-slate-100/50 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
