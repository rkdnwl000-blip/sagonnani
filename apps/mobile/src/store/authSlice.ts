import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, storage } from '../services/api';

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, token: null, loading: false, error: null };

export const loginUser = createAsyncThunk('auth/loginUser', async (data: any, { rejectWithValue }) => {
  try {
    const res: any = await authApi.loginUser(data);
    await storage.setItem('auth_token', res.token);
    return res;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (data: any, { rejectWithValue }) => {
  try {
    const res: any = await authApi.registerUser(data);
    await storage.setItem('auth_token', res.token);
    return res;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await storage.deleteItem('auth_token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => { state.user = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
