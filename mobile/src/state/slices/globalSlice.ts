import { createSlice } from '@reduxjs/toolkit';

interface GlobalState {
  isLoading: boolean;
  error: string | null;
  userRole: 'user' | 'creator' | 'admin' | null;
}

const initialState: GlobalState = {
  isLoading: false,
  error: null,
  userRole: null,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setUserRole, clearError } = globalSlice.actions;
export default globalSlice.reducer;