// lib/api.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { User } from "@/src/types/users";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface ApiError {
  status: number;
  message: {
    detail: string;
  };
}

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const USER_DATA_COOKIE = "user_data";

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/", // Critical for Middleware visibility
};

export class ApiClient {
  protected client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get(ACCESS_TOKEN_COOKIE);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Handle FormData for Avatars/Media
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
          if (!refreshToken) {
            this.handleLogout();
            return Promise.reject(error);
          }

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshToken(refreshToken)
              .then((newTokens) => {
                this.isRefreshing = false;
                this.setAuthTokens(newTokens);
                this.onTokenRefreshed(newTokens.access);
              })
              .catch((err) => {
                this.isRefreshing = false;
                this.handleLogout();
                return Promise.reject(err);
              });
          }

          // Queue requests while refreshing
          return new Promise((resolve) => {
            this.addRefreshSubscriber((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.client(originalRequest));
            });
          });
        }
        return Promise.reject(error);
      }
    );
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private handleLogout() {
    this.clearAuthTokens();
    this.clearUserData(); // Clear user data on logout
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  }

  // Update setAuthTokens to accept optional userData
  setAuthTokens(tokens: AuthTokens, userData?: User): void {
    // UPDATED: Set to 1 full day (24 hours)
    Cookies.set(ACCESS_TOKEN_COOKIE, tokens.access, {
      ...COOKIE_OPTIONS,
      expires: 1, 
    });

    Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh, {
      ...COOKIE_OPTIONS,
      expires: 7, // Refresh token lasts 7 days
    });

    // Only set user data cookie if provided
    if (userData) {
      this.setUserData(userData);
    }
  }

  // Separate method for setting user data
  setUserData(userData: User): void {
    Cookies.set(USER_DATA_COOKIE, JSON.stringify(userData), { 
      ...COOKIE_OPTIONS, 
      expires: 7 
    });
  }

  // Get user data from cookie
  getUserData(): User | null {
    const userDataStr = Cookies.get(USER_DATA_COOKIE);
    if (userDataStr) {
      try {
        return JSON.parse(userDataStr) as User;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  }

  // Clear user data
  clearUserData(): void {
    Cookies.remove(USER_DATA_COOKIE);
  }

  getAuthTokens(): AuthTokens | null {
    const access = Cookies.get(ACCESS_TOKEN_COOKIE);
    const refresh = Cookies.get(REFRESH_TOKEN_COOKIE);
    return access && refresh ? { access, refresh } : null;
  }

  clearAuthTokens(): void {
    Cookies.remove(ACCESS_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
  }

  // Clear all auth-related cookies
  clearAllAuthData(): void {
    this.clearAuthTokens();
    this.clearUserData();
  }

  protected handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw {
        status: axiosError.response?.status || 500,
        message: axiosError.response?.data || { detail: "Network error occurred" },
      } as ApiError;
    }
    throw { status: 500, message: { detail: "An unexpected error occurred" } } as ApiError;
  }
}

export const api = new ApiClient(API_BASE_URL);