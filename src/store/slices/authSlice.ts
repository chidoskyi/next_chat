// store/slices/authSlice.ts
import {
  ChangePasswordData,
  EmailChangeReqestData,
  EmailResendChangeReqestData,
  EmailverifyReqestData,
  PasswordResetConfirmData,
  RegisterData,
  SearchParams,
  UserSearchResponse,
} from "@/src/types";
import { User } from "@/src/types/users";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/src/store/store";
import { authAPI } from "@/src/services/authService";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  searchResults: UserSearchResponse | null;
  searchLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  searchResults: null,
  searchLoading: false,
};

// Cookie keys
const USER_COOKIE = "user_data";

// Helper functions for user data in cookies
const setUserCookie = (user: User) => {
  Cookies.set(USER_COOKIE, JSON.stringify(user), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: 7, // 7 days
  });
};

const getUserCookie = (): User | null => {
  const userStr = Cookies.get(USER_COOKIE);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

const removeUserCookie = () => {
  Cookies.remove(USER_COOKIE);
};

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);

      // Tokens are already stored in cookies by authAPI.register()
      // Just store user data
      setUserCookie(response.user);

      return response;
    } catch (error) {
      console.error("Register error:", error);
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Registration failed" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    data: { login: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.login(data.login, data.password);

      // Tokens are already stored in cookies by authAPI.login()
      // Just store user data
      setUserCookie(response.user);

      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Login failed" });
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleLogin(code);

      // Tokens are already stored in cookies by authAPI.googleLogin()
      // Just store user data
      setUserCookie(response.user);

      return response;
    } catch (error) {
      console.error("Google login error:", error);
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Google login failed" });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      // authAPI will use the access token from cookies automatically
      const user = await authAPI.getCurrentUser();
      setUserCookie(user);

      return user;
    } catch (error) {
      console.error("Fetch current user error:", error);
      return rejectWithValue("Failed to fetch user data");
    }
  }
);

export const fetchUserProfileByUsername = createAsyncThunk(
  "auth/fetchUserProfileByUsername",
  async (username: string, { rejectWithValue }) => {
    try {
      const user = await authAPI.getUserProfileByUsername(username);
      return user;
    } catch (error) {
      console.error("Fetch user profile by username error:", error);
      return rejectWithValue("Failed to fetch user profile by username");
    }
  }
);

export const fetchCurrentUserProfile = createAsyncThunk(
  "auth/fetchCurrentUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getCurrentUserProfile();
      setUserCookie(user);
      return user;
    } catch (error) {
      console.error("Fetch current user profile error:", error);
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

export const searchUsers = createAsyncThunk(
  "auth/searchUsers",
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      const users = await authAPI.searchUsers(params);
      return users;
    } catch (error) {
      console.error("Search users error:", error);
      return rejectWithValue("Failed to search users");
    }
  }
);



export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      // Get refresh token from cookies
      const tokens = authAPI.getAuthTokens();

      if (!tokens?.refresh) {
        return rejectWithValue("No refresh token");
      }

      const newTokens = await authAPI.refreshToken(tokens.refresh);
      // Tokens are already stored in cookies by authAPI.refreshToken()

      return newTokens;
    } catch (error) {
      console.error("Refresh token error:", error);
      return rejectWithValue("Failed to refresh token");
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  "auth/loadFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      // Check if tokens exist in cookies
      const tokens = authAPI.getAuthTokens();
      const user = getUserCookie();

      if (!tokens || !user) {
        return rejectWithValue("No stored credentials");
      }

      return {
        user,
        tokens,
      };
    } catch (error) {
      console.error("Load from storage error:", error);
      return rejectWithValue("Failed to load user data");
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestPasswordReset({ email: email });
      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Failed to request password reset" });
    }
  }
);

export const confirmPasswordReset = createAsyncThunk(
  "auth/confirmPasswordReset",
  async (data: PasswordResetConfirmData, { rejectWithValue }) => {
    try {
      const response = await authAPI.confirmPasswordReset(data);
      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Failed to reset password" });
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordData, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(data);
      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Failed to change password" });
    }
  }
);

export const requestEmailChange = createAsyncThunk(
  "auth/requestEmailChange",
  async (data: EmailChangeReqestData, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestEmailChange(data);
      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Failed to request email change" });
    }
  }
);

export const verifyEmailChange = createAsyncThunk(
  "auth/verifyEmailChange",
  async (data: EmailverifyReqestData, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmailRequest(data);
      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({ detail: "Failed to verify email change" });
    }
  }
);

export const requestResendEmailChange = createAsyncThunk(
  "auth/requestResendEmailChange",
  async (data: EmailResendChangeReqestData, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestResendEmailChange(data);
      return response;
    } catch (error) {
      const err =
        error && typeof error === "object"
          ? (error as { message?: unknown })
          : null;
      if (err && err.message && typeof err.message === "object") {
        return rejectWithValue(err.message);
      }
      return rejectWithValue({
        detail: "Failed to request resend email change",
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API (will clear cookies internally)
      await authAPI.logout();
      
      // Clear user data cookie
      removeUserCookie();
      
      return;
    } catch (error) {
      console.error("Logout error:", error);
      // Clear cookies even if API call fails
      authAPI.clearAuthTokens();
      removeUserCookie();
      return rejectWithValue("Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear all cookies
      authAPI.clearAuthTokens();
      removeUserCookie();
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      setUserCookie(action.payload);
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = JSON.stringify(action.payload);
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("Login fulfilled with payload:", action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("Login rejected with payload:", action.payload);
        state.isLoading = false;
        state.error = JSON.stringify(action.payload);
        state.isAuthenticated = false;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = JSON.stringify(action.payload);
        state.isAuthenticated = false;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        // Token might be expired, clear auth state
        state.user = null;
        state.isAuthenticated = false;
        authAPI.clearAuthTokens();
        removeUserCookie();
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = JSON.stringify(action.payload);
      })
      // Refresh token
      .addCase(refreshAccessToken.fulfilled, (state) => {
        // Tokens are already updated in cookies by the API
        // Just maintain authentication state
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Refresh failed, logout user
        state.user = null;
        state.isAuthenticated = false;
        authAPI.clearAuthTokens();
        removeUserCookie();
      })
      // Load from storage
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.searchResults = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Clear state even if API call failed
        state.user = null;
        state.isAuthenticated = false;
        state.searchResults = null;
      });
  },
});

export const { logout, clearError, setUser, clearSearchResults } =
  authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectSearchResults = (state: RootState) =>
  state.auth.searchResults;
export const selectSearchLoading = (state: RootState) =>
  state.auth.searchLoading;

export default authSlice.reducer;