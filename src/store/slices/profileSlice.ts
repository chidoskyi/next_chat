// store/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/src/store/store";
import { authAPI } from "@/src/services/authService";
import { User, UserProfileUpdatePayload } from "@/src/types/users";
import Cookies from "js-cookie";

interface ProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  isLoading: false,
  error: null,
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

// Async thunks
export const fetchCurrentUserProfile = createAsyncThunk(
  "profile/fetchCurrentUserProfile",
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

export const fetchUserProfileByUsername = createAsyncThunk(
  "profile/fetchUserProfileByUsername",
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

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data: UserProfileUpdatePayload, { rejectWithValue }) => {
    try {
      const user = await authAPI.updateProfile(data);
      setUserCookie(user);
      return user;
    } catch (error) {
      console.error("Update profile error:", error);
      return rejectWithValue("Failed to update profile");
    }
  }
);

export const handleAvatarUpload = createAsyncThunk(
  "profile/handleAvatarUpload",
  async (avatar: File, { rejectWithValue }) => {
    try {
      await authAPI.handleAvatarUpload(avatar);
      const user = await authAPI.getCurrentUserProfile();
      setUserCookie(user);
      return user;
    } catch (error) {
      console.error("Avatar upload error:", error);
      return rejectWithValue("Failed to upload avatar");
    }
  }
);

export const handleAvatarDelete = createAsyncThunk(
  "profile/handleAvatarDelete",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.handleAvatarDelete();
      const user = await authAPI.getCurrentUserProfile();
      setUserCookie(user);
      return user;
    } catch (error) {
      console.error("Avatar delete error:", error);
      return rejectWithValue("Failed to delete avatar");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    setProfileUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      setUserCookie(action.payload);
    },
    clearProfile: (state) => {
      state.user = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current user profile
      .addCase(fetchCurrentUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch user profile by username
      .addCase(fetchUserProfileByUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileByUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfileByUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update user profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload avatar
      .addCase(handleAvatarUpload.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleAvatarUpload.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(handleAvatarUpload.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete avatar
      .addCase(handleAvatarDelete.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleAvatarDelete.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(handleAvatarDelete.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError, setProfileUser, clearProfile } = profileSlice.actions;

export const selectCurrentProfile = (state: RootState) => state.profile.user;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectProfileError = (state: RootState) => state.profile.error;

export default profileSlice.reducer;