'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/upload';
import { toast } from 'sonner';
import Image from 'next/image';
import { UserIcon, Loader2 } from 'lucide-react';

interface AvatarUploadProps {
    value?: string;
    onChange: (url: string, file?: File) => void;
}

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File) => {
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件');
            return;
        }

        // 验证文件大小（2MB）
        if (file.size > 2 * 1024 * 1024) {
            toast.error('图片大小不能超过2MB');
            return;
        }

        try {
            setIsUploading(true);
            const response = await uploadImage('/auth/admin/avatar', file);
            const data = await response.json();

            if (!response.ok) {
                throw new Error('上传失败');
            }

            onChange(data.url, file);
            toast.success('头像上传成功');
        } catch (error) {
            toast.error('上传失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className={`
                    relative w-32 h-32 rounded-full overflow-hidden
                    ${!value ? 'bg-muted' : ''}
                    ${isUploading ? 'opacity-50' : ''}
                `}
            >
                {value ? (
                    <Image
                        src={value}
                        alt="头像"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                handleUpload(file);
                            }
                        };
                        input.click();
                    }}
                >
                    {isUploading ? '上传中...' : '更换头像'}
                </Button>
                {value && (
                    <Button
                        variant="destructive"
                        disabled={isUploading}
                        onClick={() => onChange('', undefined)}
                    >
                        删除头像
                    </Button>
                )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
                支持jpg、png、gif格式，大小不超过2MB
            </p>
        </div>
    );
} 