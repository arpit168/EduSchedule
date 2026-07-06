import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import useNotificationStore from '../../store/useNotificationStore';
import useTimetableStore from '../../store/useTimetableStore';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Calendar,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, markAsRead } = useNotificationStore();
  const { sessionYear, setSessionYear } = useTimetableStore();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Debounced search across teachers, classes, subjects, rooms
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [tRes, cRes, sRes, rRes] = await Promise.all([
          api.get(`/teachers?search=${encodeURIComponent(searchQuery)}`),
          api.get(`/classes?search=${encodeURIComponent(searchQuery)}`),
          api.get(`/subjects?search=${encodeURIComponent(searchQuery)}`),
          api.get(`/rooms?search=${encodeURIComponent(searchQuery)}`),
        ]);

        setSearchResults({
          teachers: tRes.data.data || [],
          classes: cRes.data.data || [],
          subjects: sRes.data.data || [],
          rooms: rRes.data.data || [],
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (path) => {
    setSearchQuery('');
    setSearchResults(null);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-colors">
      {/* Search Bar */}
      <div className="relative w-96">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search teachers, classes, rooms, subjects... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (!val.trim()) setSearchResults(null);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults && (
          <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
            {isSearching ? (
              <p className="text-center py-4 text-xs text-slate-400 font-medium">Searching across campus...</p>
            ) : (
              <>
                {searchResults.teachers.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-1">Teachers</p>
                    {searchResults.teachers.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => handleResultClick('/teachers')}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span>{t.name}</span>
                        <span className="text-xs text-slate-400">{t.employeeId}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.classes.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Classes</p>
                    {searchResults.classes.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleResultClick('/classes')}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span>{c.className} {c.section}</span>
                        <span className="text-xs text-slate-400">Sem {c.semester}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.subjects.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-violet-500 mb-1">Subjects</p>
                    {searchResults.subjects.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => handleResultClick('/subjects')}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-slate-400">{s.code}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.rooms.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1">Rooms</p>
                    {searchResults.rooms.map((r) => (
                      <div
                        key={r._id}
                        onClick={() => handleResultClick('/rooms')}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span>{r.roomNumber}</span>
                        <span className="text-xs text-slate-400">{r.building}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.teachers.length === 0 &&
                  searchResults.classes.length === 0 &&
                  searchResults.subjects.length === 0 &&
                  searchResults.rooms.length === 0 && (
                    <p className="text-center py-6 text-sm text-slate-400">No matching records found.</p>
                  )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Academic Session Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Calendar size={14} className="text-indigo-500" />
          <span>Session:</span>
          <select
            value={sessionYear}
            onChange={(e) => setSessionYear(e.target.value)}
            className="bg-transparent border-none font-bold focus:outline-none cursor-pointer"
          >
            <option value="2026-2027" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2026-2027</option>
            <option value="2025-2026" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2025-2026</option>
            <option value="2024-2025" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2024-2025</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Dark/Light Theme"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                  <span className="px-2 py-0.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-4 transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <span className="mt-2 block text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors border border-slate-200/50 dark:border-slate-700/50"
          >
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-7 h-7 rounded-lg object-cover"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <User size={15} /> My Profile
              </Link>

              {user?.role === 'Admin' && (
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings size={15} /> School Settings
                </Link>
              )}

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors mt-1"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
