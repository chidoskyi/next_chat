import { User } from "./users";

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    display_name?: string; 
  }

export interface LoginData {
    login: string;
    password: string;
  }

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
  }

export interface RegisterResponse {
    user: User;
    access: string;
    refresh: string;
  }

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
  
export interface PasswordResetRequestData {
    email: string;
  }
  
export interface PasswordResetConfirmData {
    uid: string;
    token: string;
    new_password: string;
    new_password_confirm: string;
  }
  
export interface ChangePasswordData {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }
  
export interface PasswordResetResponse {
    message: string;
  }
  
// export interface ApiError {
//   status?: number;
//   detail?: string;
//   [key: string]: string[] | string | number | undefined;
// }
  
export interface EmailChangeReqestData{
    new_email: string;
    password: string;
  }
  
export interface EmailverifyReqestData{
    code: number;
  }
  
export interface EmailResendChangeReqestData{
    new_email: string;
    password: string;
  }

export interface EmailResetResponseData {
    message: string;
    new_email: string;
    expires_in_minutes: string;
    note: string;
  }

export interface EmailVerifyResponseData {
    message: string;
    old_email: string;
    new_email: string;
    email_verified?: boolean;
  }


export interface SearchUser {
    id: number;
    username: string;
    display_name: string;
    avatar: string | null;
    email_verified: boolean;
    bio?: string;
  }

export interface SearchParams {
    q: string;
    page?: number;
    page_size?: number;
    exact?: boolean;
  }
  
export interface UserSearchResponse {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next: boolean;
    previous: boolean;
    results: SearchUser[];
  }
  