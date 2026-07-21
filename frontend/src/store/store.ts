import { configureStore } from '@reduxjs/toolkit';
import mockEventsReducer from '../features/mockData/store/eventsSlice';
import mockRegistrationsReducer from '../features/mockData/store/registrationsSlice';
import mockNotificationsReducer from '../features/mockData/store/notificationsSlice';
import mockFeedbackReducer from '../features/mockData/store/feedbackSlice';
import mockCertificatesReducer from '../features/mockData/store/certificatesSlice';
import mockAnalyticsReducer from '../features/mockData/store/analyticsSlice';
import uiReducer from '../features/mockData/store/uiSlice';

export const store = configureStore({
  reducer: {
    mockEvents: mockEventsReducer,
    mockRegistrations: mockRegistrationsReducer,
    mockNotifications: mockNotificationsReducer,
    mockFeedback: mockFeedbackReducer,
    mockCertificates: mockCertificatesReducer,
    mockAnalytics: mockAnalyticsReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
