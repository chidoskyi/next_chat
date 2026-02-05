// lib/authAPI.ts
import { ApiClient } from "./api";
import { AxiosRequestConfig } from "axios";
import {
  RegisterData,
  RegisterResponse,
  LoginResponse,
  PasswordResetRequestData,
  PasswordResetResponse,
  PasswordResetConfirmData,
  ChangePasswordData,
  EmailChangeReqestData,
  EmailVerifyResponseData,
  EmailResetResponseData,
  EmailverifyReqestData,
  SearchParams,
  UserSearchResponse,
} from "../types";
import { User, UserProfileUpdatePayload, Profile } from "../types/users";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class AuthAPI extends ApiClient {
  constructor() {
    super(API_URL);
  }

  // Register new user
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await this.client.post<RegisterResponse>(
        "/auth/register/",
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Login with username or email
// Login with username or email
async login(login: string, password: string): Promise<LoginResponse> {
  try {
    const response = await this.client.post<LoginResponse>("/auth/login/", {
      login,
      password,
    });
    console.log("Login response:", response.data);

    // Store tokens in cookies after successful login
    // The tokens are directly in response.data, not response.data.tokens
    if (response.data.access && response.data.refresh) {
      this.setAuthTokens({
        access: response.data.access,
        refresh: response.data.refresh,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    this.handleError(error);
  }
}

  // Get current user
  async getCurrentUser(accessToken?: string): Promise<User> {
    try {
      const config: AxiosRequestConfig = {};
      if (accessToken) {
        config.headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      const response = await this.client.get<User>("/auth/users/me/", config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Google OAuth login
  async googleLogin(code: string): Promise<RegisterResponse> {
    try {
      const response = await this.client.post<RegisterResponse>(
        "/auth/google/",
        { code }
      );

      // Store tokens in cookies after successful OAuth login
      if (response.data.access && response.data.refresh) {
        this.setAuthTokens({
          access: response.data.access,
          refresh: response.data.refresh,
        });
      }

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Password Reset - Request reset link
  async requestPasswordReset(
    data: PasswordResetRequestData
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.client.post<PasswordResetResponse>(
        "/auth/password-reset/",
        { email: data.email }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Password Reset - Confirm with token
  async confirmPasswordReset(
    data: PasswordResetConfirmData
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.client.post<PasswordResetResponse>(
        "/auth/password-reset/confirm/",
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Change Password (while logged in)
  async changePassword(
    data: ChangePasswordData
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.client.post<PasswordResetResponse>(
        "/auth/change-password/",
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Change Email Request
  async requestEmailChange(
    data: EmailChangeReqestData
  ): Promise<EmailResetResponseData> {
    try {
      const response = await this.client.post<EmailResetResponseData>(
        "/auth/email/change/request",
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Verify Email Request
  async verifyEmailRequest(
    data: EmailverifyReqestData
  ): Promise<EmailVerifyResponseData> {
    try {
      const response = await this.client.post<EmailVerifyResponseData>(
        "/auth/email/change/verify",
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Resend Email Change
  async requestResendEmailChange(
    data: EmailChangeReqestData
  ): Promise<EmailResetResponseData> {
    try {
      const response = await this.client.post<EmailResetResponseData>(
        "/auth/email/change/resend",
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Logout
  async logout(refreshToken?: string): Promise<void> {
    try {
      // Get refresh token from cookies if not provided
      const refresh = refreshToken || this.getAuthTokens()?.refresh;
      
      if (refresh) {
        await this.client.post("/auth/logout/", { refresh });
      }
      
      // Clear tokens from cookies
      this.clearAuthTokens();
    } catch (error) {
      console.error("Logout error:", error);
      // Always clear tokens even if API call fails
      this.clearAuthTokens();
    }
  }

  // Get current logged-in user's profile
  async getCurrentUserProfile(): Promise<User> {
    const response = await this.client.get<User>(`/auth/users/profile/`);
    return response.data;
  }

  async updateProfile(updates: UserProfileUpdatePayload) {
    const response = await this.client.patch('/auth/users/profile/', updates);
    return response.data;
  }


  // Handle Avatar Upload
  async handleAvatarUpload(avatar: File): Promise<void> {
    const response = await this.client.post(`/auth/users/avatar/`, avatar);
    return response.data;
  } 
  
  // Handle Avatar Delete
  async handleAvatarDelete(): Promise<void> {
    const response = await this.client.delete(`/auth/users/avatar/`);
    return response.data;
  }

  // Get user's profile by username
  async getUserProfileByUsername(username: string): Promise<User> {
    const response = await this.client.get<User>(`/auth/users/${username}/`);
    return response.data;
  }

  // Search Users
  async searchUsers(params: SearchParams): Promise<UserSearchResponse> {
      const response = await this.client.get<UserSearchResponse>(
        "/auth/users/search/",
        {
          params: {
            q: params.q,
            page: params.page || 1,
            page_size: params.page_size || 20,
            exact: params.exact || false,
          },
        }
      );
      return response.data;

  }
}

// Export singleton instance
export const authAPI = new AuthAPI();