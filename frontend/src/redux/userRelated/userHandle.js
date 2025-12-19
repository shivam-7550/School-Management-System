import axios from 'axios';
import {
  authRequest,
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
} from './userSlice';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;

export const loginUser = (fields, role) => async (dispatch) => {
  dispatch(authRequest());

  try {
    const result = await axios.post(
      `${REACT_APP_BASE_URL}/${role}Login`,
      fields,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const {
      token,
      teacher,
      student,
      admin,
      message,
      role: responseRole,
    } = result.data;

    const user = teacher || student || admin;
    const finalRole = responseRole || role;
    // Ensure all values are present
    if (user && token && (responseRole || role)) {
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', finalRole);

      dispatch(
        authSuccess({
          teacher,
          student,
          admin,
          role: finalRole,
          token,
        })
      );
    } else {
      dispatch(authFailed(message || 'Invalid login response'));
    }
  } catch (error) {
    console.error('Login Error:', error);
    dispatch(authError(error.message || 'Login request failed'));
  }
};

export const registerUser = (fields, role) => async (dispatch) => {
  dispatch(authRequest());

  try {
    const result = await axios.post(
      `${REACT_APP_BASE_URL}/${role}Reg`,
      fields,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (result.data.schoolName) {
      dispatch(authSuccess(result.data));
    } else if (result.data.school) {
      dispatch(stuffAdded(result.data));
    } else {
      dispatch(authFailed(result.data.message));
    }
  } catch (error) {
    dispatch(authError(error));
  }
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const result = await axios.get(`${REACT_APP_BASE_URL}/${address}/${id}`);
    if (result.data) {
      dispatch(doneSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

export const deleteUser = (id, address) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const result = await axios.delete(`${REACT_APP_BASE_URL}/${address}/${id}`);
    if (result.data.message) {
      dispatch(getFailed(result.data.message));
    } else {
      dispatch(getDeleteSuccess());
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

export const updateUser = (fields, id, address) => async (dispatch) => {
  dispatch(getRequest());

  try {
    const result = await axios.put(
      `${REACT_APP_BASE_URL}/${address}/${id}`,
      fields,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (result.data.schoolName) {
      dispatch(authSuccess(result.data));
    } else {
      dispatch(doneSuccess(result.data));
    }
  } catch (error) {
    dispatch(getError(error));
  }
};

export const addStuff = (fields, address) => async (dispatch) => {
  dispatch(authRequest());

  try {
    const result = await axios.post(
      `${REACT_APP_BASE_URL}/${address}Create`,
      fields,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (result.data.message) {
      dispatch(authFailed(result.data.message));
    } else {
      dispatch(stuffAdded(result.data));
    }
  } catch (error) {
    dispatch(authError(error));
  }
};
