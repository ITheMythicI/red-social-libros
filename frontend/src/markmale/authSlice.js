import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const usuario = JSON.parse(localStorage.getItem("usuario"));

const initialState = {
  usuario: usuario ? usuario : null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    logout: (state) => {
      authService.logout();
      state.usuario = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.usuario = action.payload; // Guardamos token y datos
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.usuario = null;
      });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
