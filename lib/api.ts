import { AdminListResponse, CreateAdminRequest, CreateAdminResponse, UpdateAdminStatusRequest, UpdateAdminStatusResponse, UpdatePasswordRequest, UpdatePasswordResponse, ErrorResponse } from './types';
import { getAuth } from './auth';

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