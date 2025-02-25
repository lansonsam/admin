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

export interface ShortLink {
    id: string;
    code: string;
    original_url: string;
    short_url: string;
    created_at: string;
    visits: number;
    creator_name: string;
    description: string;
    last_visit: string;
}

export interface ShortLinkResponse {
    total: number;
    items: ShortLink[];
}

export interface Category {
    id: string;
    name: string;
    description: string;
    article_count: number;
}

export interface CategoryListResponse {
    total: number;
    items: Category[];
}

export interface CreateCategoryRequest {
    name: string;
    description: string;
}

export interface UpdateCategoryRequest {
    name: string;
    description: string;
}

export interface Comment {
    comment_id: number;
    content: string;
    nickname: string;
    email: string | null;
    article_id: number;
    is_visible: boolean;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export interface CommentListResponse {
    items: Comment[];
    total: number;
} 