'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImageIcon, Loader2, Trash2, X } from "lucide-react";
import { request } from "@/lib/request";
import { Button } from "@/components/ui/button";

interface Image {
    image_id: number;
    url: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
    updated_at: string;
}

export default function ImagesPage() {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 获取图片列表
    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await request<{ items: Image[] }>('/auth/admin/image/list');
            if (!response.ok) {
                throw new Error('获取图片列表失败');
            }
            const data = await response.json();
            setImages(data.items);
        } catch (error) {
            toast.error('获取失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // 删除图片
    const handleDelete = async (id: number) => {
        try {
            const response = await request(`/auth/admin/image/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除图片失败');
            }

            toast.success('删除成功');
            setImages(images.filter(img => img.image_id !== id));
        } catch (error) {
            toast.error('删除失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">图床管理</h1>
                <p className="text-sm text-muted-foreground mt-2">管理已上传的图片</p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>图片列表</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <p>暂无图片</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div
                                    key={`${image.image_id}-${image.url}`}
                                    className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.original_name}
                                        className="object-cover w-full h-full transition-all hover:scale-105"
                                        onClick={() => setSelectedImage(image.url)}
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(image.image_id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 图片预览 */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                        <img
                            src={selectedImage}
                            alt="预览图片"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 bg-white hover:bg-gray-100"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 