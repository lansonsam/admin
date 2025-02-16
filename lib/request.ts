import { getAuth, removeAuth } from './auth';

interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

export async function request<T = any>(url: string, options: RequestOptions = {}): Promise<Response & { json: () => Promise<T> }> {
    const { requireAuth = true, ...fetchOptions } = options;

    if (requireAuth) {
        const { token } = getAuth();
        if (!token) {
            removeAuth();
            window.location.href = '/';
            throw new Error('未登录');
        }

        fetchOptions.headers = {
            ...fetchOptions.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    try {
        const response = await fetch(url, fetchOptions);

        if (response.status === 401) {
            removeAuth();
            window.location.href = '/';
            throw new Error('登录已过期');
        }

        return response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
} 