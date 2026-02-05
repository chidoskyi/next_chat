import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    message: messageReducer,
  },
});

if (typeof window !== 'undefined') {
  (window as any).__REDUX_STORE__ = store
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;