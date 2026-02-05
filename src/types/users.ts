export type Gender = 'male' | 'female' | 'other' | '';

export interface Profile {
    id: string;
    bio: string;
    avatar: string | null; 
    phone: string;
    location: string;
    is_private: boolean;
    gender: Gender;
    website: string;
    birthday: string; 
}


export interface User {
    id: string;
    username: string;
    email: string;
    display_name: string;
    email_verified: boolean;
    created_at: string;
    is_online: boolean;
    last_seen: string | null;
    profile: Profile; 
}

export interface UserProfileUpdatePayload {
    username?: string;
    display_name?: string;
    profile?: Partial<Profile>; 
}