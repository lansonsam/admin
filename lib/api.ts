import { AdminListResponse, CreateAdminRequest, CreateAdminResponse, UpdateAdminStatusRequest, UpdateAdminStatusResponse, UpdatePasswordRequest, UpdatePasswordResponse, ErrorResponse } from './types';
import { getAuth } from './auth';
import { request } from './request';
import type { CommentListResponse } from './types';

async function handleApiError(response: Response): Promise<never> {
    try {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.detail || '操作失败');
    } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error('操作失败');
    }
}

export async function getAdminList(): Promise<AdminListResponse> {
    const { token } = getAuth();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch('/auth/admin/list', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createAdmin(data: CreateAdminRequest): Promise<CreateAdminResponse> {
    const { token } = getAuth();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch('/auth/admin/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateAdminStatus(adminId: string, data: UpdateAdminStatusRequest): Promise<UpdateAdminStatusResponse> {
    const { token } = getAuth();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`/auth/admin/${adminId}/status`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateAdminPassword(adminId: string, data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
    const { token } = getAuth();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`/auth/admin/${adminId}/password`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

// 获取评论列表
export const getCommentList = async () => {
    const response = await request<CommentListResponse>('/auth/admin/comment/list');
    if (!response.ok) {
        throw new Error('获取评论列表失败');
    }
    return response.json();
};

// 更新评论可见性
export const updateCommentVisibility = async (id: number, isVisible: boolean) => {
    const response = await request(`/auth/admin/comment/${id}/visibility`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: isVisible }),
    });

    if (!response.ok) {
        throw new Error('更新评论可见性失败');
    }
    return response.json();
};

// 删除评论
export const deleteComment = async (id: number) => {
    const response = await request(`/auth/admin/comment/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('删除评论失败');
    }
    return response.json();
}; 