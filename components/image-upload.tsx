'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/upload';
import { toast } from 'sonner';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange?: (url: string, file?: File) => void;
    uploadUrl?: string;
    onUploadSuccess?: (url: string) => void;
}

export function ImageUpload({ value, onChange, uploadUrl = '/auth/admin/image/upload', onUploadSuccess }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // 处理文件上传
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
            const response = await uploadImage(uploadUrl, file);
            const data = await response.json();

            if (!response.ok) {
                throw new Error('上传失败');
            }

            onChange(data.url, file);
            onUploadSuccess?.(data.url);
            toast.success('上传成功');
        } catch (error) {
            toast.error('上传失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        } finally {
            setIsUploading(false);
        }
    };

    // 处理拖拽
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleUpload(file);
        }
    }, []);

    // 处理粘贴
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        handleUpload(file);
                        break;
                    }
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    return (
        <div
            className={`space-y-4 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div
                className={`
                    border-2 border-dashed rounded-lg p-8 transition-all
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'}
                    ${!value ? 'hover:border-primary hover:bg-primary/5' : ''}
                `}
            >
                {!value ? (
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
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
                        <div className="text-sm text-gray-500">
                            <p>支持jpg、png、gif格式，大小不超过5MB</p>
                            <p>可以拖拽图片到这里，或者直接粘贴图片</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                            src={value}
                            alt="预览图"
                            fill
                            className="object-contain"
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
                                    onClick={() => {
                                        onChange?.('');
                                    }}
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