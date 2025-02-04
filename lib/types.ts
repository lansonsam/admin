export interface Admin {
    admin_id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    avatar_url: string;
    created_at: string;
}

export interface AdminListResponse {
    total: number;
    items: Admin[];
}

export interface CreateAdminRequest {
    username: string;
    password: string;
    email: string;
    role: 'superadmin' | 'admin' | 'author';
}

export interface CreateAdminResponse {
    message: string;
}

export interface UpdateAdminStatusRequest {
    status: boolean;
}

export interface UpdateAdminStatusResponse {
    message: string;
}

export interface UpdatePasswordRequest {
    password: string;
}

export interface UpdatePasswordResponse {
    message: string;
}

export interface ErrorResponse {
    detail: string;
} 