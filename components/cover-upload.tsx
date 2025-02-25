'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/upload';
import { toast } from 'sonner';
import Image from 'next/image';
import { ImageIcon, X } from 'lucide-react';

interface CoverUploadProps {
    value?: string;
    onChange: (url: string, file?: File) => void;
}

export function CoverUpload({ value, onChange }: CoverUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File) => {
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件');
            return;
        }

        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过5MB');
            return;
        }

        try {
            setIsUploading(true);
            const response = await uploadImage('/auth/admin/image/upload', file);
            const data = await response.json();

            if (!response.ok) {
                throw new Error('上传失败');
            }

            onChange(data.url, file);
            toast.success('上传成功');
        } catch (error) {
            toast.error('上传失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={`
                    border-2 border-dashed rounded-lg p-4 transition-all
                    ${value ? 'border-border' : 'hover:border-primary hover:bg-primary/5'}
                `}
            >
                {!value ? (
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        <div>
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
                                {isUploading ? '上传中...' : '选择图片'}
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>支持jpg、png、gif格式，大小不超过5MB</p>
                            <p>可以拖拽图片到这里，或者直接粘贴图片</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                            src={value}
                            alt="封面图"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-center h-full space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
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
                                    更换图片
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onChange('', undefined)}
                                >
                                    删除图片
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 