import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

// Fetch all notifications for the current user
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/notifications/');
            return Array.isArray(response.data) ? response.data : response.data.results || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load notifications');
        }
    }
);

// Mark a single notification as read
export const markNotificationRead = createAsyncThunk(
    'notifications/markNotificationRead',
    async (notifId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/notifications/${notifId}/read/`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to mark as read');
        }
    }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
    'notifications/markAllNotificationsRead',
    async (_, { rejectWithValue }) => {
        try {
            await axiosInstance.patch('/notifications/read_all/');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to mark all as read');
        }
    }
);

// Delete a single notification
export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notifId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/notifications/${notifId}/`);
            return notifId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to delete notification');
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    notificationsLoading: false,
    notificationsError: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Called when a new notification arrives via WebSocket
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearNotificationsError: (state) => {
            state.notificationsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => {
                state.notificationsLoading = true;
                state.notificationsError = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notificationsLoading = false;
                state.notifications = action.payload || [];
                state.unreadCount = state.notifications.filter((n) => !n.is_read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.notificationsLoading = false;
                state.notificationsError = action.payload;
            })
            // markNotificationRead
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const updated = action.payload;
                state.notifications = state.notifications.map((n) =>
                    n.id === updated.id ? { ...n, is_read: true } : n
                );
                state.unreadCount = state.notifications.filter((n) => !n.is_read).length;
            })
            // markAllNotificationsRead
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map((n) => ({ ...n, is_read: true }));
                state.unreadCount = 0;
            })
            // deleteNotification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const deletedId = action.payload;
                const deleted = state.notifications.find((n) => n.id === deletedId);
                state.notifications = state.notifications.filter((n) => n.id !== deletedId);
                if (deleted && !deleted.is_read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });
    },
});

export const { addNotification, clearNotificationsError } = notificationSlice.actions;

export default notificationSlice.reducer;
