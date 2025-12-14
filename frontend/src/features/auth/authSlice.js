import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const userToken = localStorage.getItem("token") || null;
const storedUser = localStorage.getItem("user");
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const initialState = {
  token: userToken,
  user: parsedUser,
  loading: false,
  error: null,
};

// Login
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    return await authService.login(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.mensaje || error.response?.data?.message || "Error al iniciar sesión"
    );
  }
});

// Register
export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  try {
    return await authService.register(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.mensaje || error.response?.data?.message || "Error al registrar"
    );
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
});

// Obtener usuario actual
export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, thunkAPI) => {
  try {
    return await authService.getMe();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.mensaje || error.response?.data?.message || "No se pudo obtener el usuario"
    );
  }
});

// Update subjects favoritos
export const updateSubjects = createAsyncThunk(
  "auth/updateSubjects",
  async (subjects, thunkAPI) => {
    try {
      return await authService.updateSubjects(subjects);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.mensaje || "Error al guardar preferencias");
    }
  }
);

export const updateFavoritos = createAsyncThunk(
  "auth/updateFavoritos",
  async (libros, thunkAPI) => {
    try {
      return await authService.updateFavoritos(libros);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.mensaje || "Error al guardar favoritos");
    }
  }
);

export const updateAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (avatarUrl, thunkAPI) => {
    try {
      return await authService.updateAvatar(avatarUrl);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.mensaje || "Error al guardar avatar");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.token) state.token = action.payload.token;
        if (action.payload) state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      })
      // FETCH ME
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // UPDATE SUBJECTS
      .addCase(updateSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE FAVORITOS
      .addCase(updateFavoritos.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      // UPDATE AVATAR
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
