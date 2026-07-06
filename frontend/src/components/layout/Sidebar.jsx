import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  CalendarDays,
  Layers,
  ClipboardList,
  BarChart3,
  Calendar,
  Settings,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'HOD', 'Teacher'] },
    { name: 'Timetable Builder', path: '/timetable', icon: CalendarDays, roles: ['Admin', 'HOD'] },
    { name: 'My Timetable', path: '/my-timetable', icon: Clock, roles: ['Teacher', 'HOD'] },
    { name: 'Class Schedules', path: '/class-timetable', icon: Calendar, roles: ['Admin', 'HOD', 'Teacher'] },
    { name: 'Teachers', path: '/teachers', icon: Users, roles: ['Admin', 'HOD'] },
    { name: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['Admin', 'HOD'] },
    { name: 'Classes', path: '/classes', icon: GraduationCap, roles: ['Admin', 'HOD'] },
    { name: 'Rooms', path: '/rooms', icon: Building2, roles: ['Admin', 'HOD'] },
    { name: 'Departments', path: '/departments', icon: Layers, roles: ['Admin'] },
    { name: 'Assignments', path: '/assignments', icon: ClipboardList, roles: ['Admin', 'HOD'] },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Admin', 'HOD'] },
    { name: 'Academic Calendar', path: '/calendar', icon: CalendarDays, roles: ['Admin', 'HOD', 'Teacher'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role || 'Teacher'));

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Name */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xl shadow-md shadow-indigo-500/20 shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base truncate">
                Antigravity
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Timetable OS
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-transform duration-200 ${
                  !isActive && 'group-hover:scale-110 text-slate-500 dark:text-slate-400'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}

              {/* Tooltip on collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Summary & Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/30 shrink-0"
            />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">{user?.role}</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
