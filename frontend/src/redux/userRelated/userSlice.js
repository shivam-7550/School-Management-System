import { createSlice } from '@reduxjs/toolkit';

const storedUser = JSON.parse(localStorage.getItem('user'));
const storedRole = localStorage.getItem('role');

const initialState = {
  status: 'idle',
  userDetails: [],
  tempDetails: [],
  loading: false,

  currentUser: storedUser || null,
  currentRole: storedRole || null,

  user: storedUser || null, // ✅ NEW: this is used in authSuccess

  teacher: null,
  student: null,
  admin: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!storedUser,

  error: null,
  response: null,
  darkMode: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authRequest: (state) => {
      state.status = 'loading';
      state.loading = true;
      state.error = null;
      state.response = null;
    },

    underControl: (state) => {
      state.status = 'idle';
      state.response = null;
    },

    stuffAdded: (state, action) => {
      state.status = 'added';
      state.response = null;
      state.error = null;
      state.tempDetails = action.payload;
    },

    authSuccess: (state, action) => {
      const { teacher, student, admin, role, token } = action.payload;
      const user = teacher || student || admin;

      state.teacher = teacher || null;
      state.student = student || null;
      state.admin = admin || null;

      state.token = token || null;
      state.user = user;
      state.currentUser = user;
      state.currentRole = role || null;
      state.isAuthenticated = true;
      state.status = 'success';
      state.error = null;

      // ✅ persist to localStorage here
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    },

    authFailed: (state, action) => {
      state.status = 'failed';
      state.response = action.payload;
      state.isAuthenticated = false;
    },

    authError: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
    },

    authLogout: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token');

      state.currentUser = null;
      state.currentRole = null;
      state.user = null;

      state.teacher = null;
      state.student = null;
      state.admin = null;
      state.token = null;

      state.status = 'idle';
      state.error = null;
      state.isAuthenticated = false;
    },

    doneSuccess: (state, action) => {
      state.userDetails = action.payload;
      state.loading = false;
      state.error = null;
      state.response = null;
    },

    getDeleteSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.response = null;
    },

    getRequest: (state) => {
      state.loading = true;
    },

    getFailed: (state, action) => {
      state.response = action.payload;
      state.loading = false;
      state.error = null;
    },

    getError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const {
  authRequest,
  underControl,
  stuffAdded,
  authSuccess,
  authFailed,
  authError,
  authLogout,
  doneSuccess,
  getDeleteSuccess,
  getRequest,
  getFailed,
  getError,
  toggleDarkMode,
} = userSlice.actions;

export const userReducer = userSlice.reducer;
