import { uploadImage } from './upload';

/**
 * 处理编辑器的图片上传
 * 支持粘贴和拖拽
 */
export const handleEditorImageUpload = async (file: File): Promise<string> => {
    try {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            throw new Error('请选择图片文件');
        }

        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('图片大小不能超过5MB');
        }

        // 上传图片
        const response = await uploadImage('/auth/admin/image/upload', file);
        if (!response.ok) {
            throw new Error('上传失败');
        }

        const data = await response.json();

        // 确保返回完整的URL
        if (!data.url) {
            throw new Error('服务器返回的图片URL无效');
        }

        return data.url;
    } catch (error) {
        console.error('图片上传失败:', error);
        throw error;
    }
}; 