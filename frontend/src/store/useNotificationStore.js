import React from 'react';
import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      set({
        notifications: res.data.data || [],
        unreadCount: res.data.unreadCount || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      toast.error('Failed to mark notification read');
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
      toast.success('Marked all notifications as read');
    } catch (error) {
      toast.error('Failed to mark notifications read');
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
    toast.custom((t) =>
      React.createElement(
        'div',
        {
          className: `${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-slate-900/90 backdrop-blur-md text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border border-slate-700`,
        },
        React.createElement(
          'div',
          { className: 'flex-1 w-0 p-1' },
          React.createElement('p', { className: 'text-sm font-semibold text-indigo-400' }, notification.title),
          React.createElement('p', { className: 'mt-1 text-xs text-slate-300' }, notification.message)
        ),
        React.createElement(
          'div',
          { className: 'flex border-l border-slate-700 pl-3 ml-3 items-center' },
          React.createElement(
            'button',
            {
              onClick: () => toast.dismiss(t.id),
              className: 'text-xs font-medium text-slate-400 hover:text-white',
            },
            'Close'
          )
        )
      )
    );
  },
}));

// Setup socket listener
socket.on('new_notification', (notification) => {
  useNotificationStore.getState().addNotification(notification);
});

export default useNotificationStore;
