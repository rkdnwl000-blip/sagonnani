import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';

export const registerCompany = createAsyncThunk('auth/registerCompany', async (data: any, { rejectWithValue }) => {
  try {
    const res: any = await authApi.register(data);
    return res;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const loginCompany = createAsyncThunk('auth/loginCompany', async (data: any, { rejectWithValue }) => {
  try {
    const res: any = await authApi.login(data);
    await SecureStore.setItemAsync('company_auth_token', res.token);
    return res;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('company_auth_token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { company: null as any, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerCompany.pending, (s) => { s.loading = true; })
      .addCase(registerCompany.fulfilled, (s) => { s.loading = false; })
      .addCase(registerCompany.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(loginCompany.pending, (s) => { s.loading = true; })
      .addCase(loginCompany.fulfilled, (s, a) => { s.loading = false; s.company = a.payload.company; })
      .addCase(loginCompany.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(logout.fulfilled, (s) => { s.company = null; });
  },
});

export default authSlice.reducer;
