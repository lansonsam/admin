'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Editor from '@/components/editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { request } from "@/lib/request";
import { ImageUpload } from '@/components/image-upload';
import { CoverUpload } from '@/components/cover-upload';
import DOMPurify from 'dompurify';

interface Category {
    id: string;
    name: string;
}

export default function CreatePost() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [coverImage, setCoverImage] = useState<{ url: string; file?: File }>({ url: '' });
    const [categories, setCategories] = useState<Category[]>([]);

    // 初始化编辑器内容
    useEffect(() => {
        const savedContent = localStorage.getItem('editor-content');
        if (savedContent) {
            setContent(savedContent);
        }
    }, []);

    // 获取分类列表
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await request<{ items: Category[] }>('/auth/admin/category/list');
                if (!response.ok) {
                    throw new Error('获取分类列表失败');
                }
                const data = await response.json();
                setCategories(data.items);
            } catch (error) {
                toast.error('获取分类失败', {
                    description: error instanceof Error ? error.message : '未知错误',
                });
            }
        };

        fetchCategories();
    }, []);

    // 创建文章
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('请输入文章内容');
            return;
        }

        if (!title.trim()) {
            toast.error('请输入文章标题');
            return;
        }

        if (!categoryId) {
            toast.error('请选择文章分类');
            return;
        }

        try {
            setIsLoading(true);

            // 清洗文章内容
            const sanitizedContent = DOMPurify.sanitize(content, {
                ALLOWED_TAGS: [
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                    'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'img'
                ],
                ALLOWED_ATTR: [
                    'href', 'name', 'target', 'src', 'alt', 'class', 'style', 'width', 'height'
                ],
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                ADD_TAGS: ['iframe'],  // 如果需要支持嵌入视频等功能
                ADD_ATTR: ['frameborder', 'allowfullscreen']  // iframe 相关属性
            });

            // 清洗文章标题
            const sanitizedTitle = DOMPurify.sanitize(title, {
                ALLOWED_TAGS: [], // 不允许任何 HTML 标签
                ALLOWED_ATTR: [] // 不允许任何属性
            });

            const formData = new FormData();
            formData.append('title', sanitizedTitle);
            formData.append('content', sanitizedContent);
            formData.append('category_id', categoryId);
            formData.append('status', 'published');
            if (coverImage.file) {
                formData.append('cover', coverImage.file);
            }

            const response = await request('/auth/admin/article/create', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('创建文章失败');
            }

            toast.success('创建成功');
            router.push('/dashboard/posts');
            router.refresh();
        } catch (error) {
            toast.error('创建失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">写文章</h2>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || !title.trim() || !categoryId || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            发布中...
                        </>
                    ) : '发布文章'}
                </Button>
            </div>

            <div className="grid grid-cols-[2fr,1fr] gap-6">
                <div>
                    <Input
                        id="title"
                        placeholder="请输入文章标题"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-4"
                    />
                    <Editor content={content} onChange={setContent} />
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg border bg-card text-card-foreground">
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-4">文章设置</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>分类</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="请选择文章分类" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>封面图</Label>
                                    <CoverUpload
                                        value={coverImage.url}
                                        onChange={(url, file) => setCoverImage({ url, file })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 