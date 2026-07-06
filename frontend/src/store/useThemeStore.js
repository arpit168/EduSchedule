import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('timetable_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  initTheme: () => {
    const current = get().theme;
    const root = document.documentElement;
    if (current === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },

  setTheme: (newTheme) => {
    localStorage.setItem('timetable_theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    set({ theme: newTheme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

// Apply initial theme
if (typeof window !== 'undefined') {
  const root = document.documentElement;
  const initial = getInitialTheme();
  if (initial === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export default useThemeStore;
