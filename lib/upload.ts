import { getAuth } from './auth';

/**
 * 上传图片
 * @param url 上传地址
 * @param file 图片文件
 * @param additionalData 额外的表单数据
 * @returns Promise<Response>
 */
export const uploadImage = async (
    url: string,
    file: File,
    additionalData?: Record<string, string>
): Promise<Response> => {
    const { token } = getAuth();
    if (!token) {
        throw new Error('未登录');
    }

    const formData = new FormData();
    formData.append('file', file);

    // 添加额外的表单数据
    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // 不需要设置 Content-Type，浏览器会自动设置正确的 boundary
        },
        body: formData,
        credentials: 'include',
    });
}; 