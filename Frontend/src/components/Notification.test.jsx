// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import NotificationDropdown from './Notification';
import { useDispatch, useSelector } from 'react-redux';

const mockDispatch = vi.fn();

let mockState;

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../Pages/slices/notificationSlice', () => ({
  fetchNotifications: vi.fn(() => ({ type: 'notifications/fetchNotifications' })),
  markNotificationRead: vi.fn((id) => ({ type: 'notifications/markNotificationRead', payload: id })),
  markAllNotificationsRead: vi.fn(() => ({ type: 'notifications/markAllNotificationsRead' })),
  deleteNotification: vi.fn((id) => ({ type: 'notifications/deleteNotification', payload: id })),
  addNotification: vi.fn((payload) => ({ type: 'notifications/addNotification', payload })),
}));

beforeEach(() => {
  vi.clearAllMocks();

  localStorage.removeItem('access_token');

  mockState = {
    auth: {
      user: { user_type: 'client' },
    },
    notifications: {
      notifications: [],
      unreadCount: 0,
      notificationsLoading: false,
    },
  };

  useDispatch.mockReturnValue(mockDispatch);
  mockDispatch.mockImplementation(() => Promise.resolve());
  useSelector.mockImplementation((selector) => selector(mockState));
});

// Test case to check if the NotificationDropdown component renders with no notifications and shows "No notifications" message
it('displays new notification item after mocked notification event update', () => {
  const { rerender } = render(<NotificationDropdown />);

  fireEvent.click(screen.getByTitle(/notifications/i));
  expect(screen.getByText(/no notifications/i)).toBeInTheDocument();

  mockState = {
    ...mockState,
    notifications: {
      ...mockState.notifications,
      notifications: [
        {
          id: 1,
          notif_type: 'message',
          title: 'New Message Received',
          message: 'You have a new message from your lawyer.',
          created_at: new Date().toISOString(),
          is_read: false,
          link: '/clientmessage',
        },
      ],
      unreadCount: 1,
    },
  };

  rerender(<NotificationDropdown />);

  expect(screen.getByText('New Message Received')).toBeInTheDocument();
  expect(screen.getByText(/new message from your lawyer/i)).toBeInTheDocument();
});
