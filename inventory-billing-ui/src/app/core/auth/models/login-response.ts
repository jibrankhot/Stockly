
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: BackendAuthUser;
    };
}

export interface BackendAuthUser {
    id: number;
    username: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    role_id: number | null;
    is_active: boolean;
    roles: {
        id: number;
        name: string;
        description: string | null;
    } | null;
}