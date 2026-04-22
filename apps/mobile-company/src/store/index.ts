import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import requestBadgeReducer from './requestBadgeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requestBadge: requestBadgeReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
