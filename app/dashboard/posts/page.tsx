'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { request } from "@/lib/request";
import dynamic from 'next/dynamic';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';

// 动态导入Editor组件
const Editor = dynamic(
    () => import('@/components/editor'),
    {
        ssr: false,
        loading: () => <div className="min-h-[400px] border rounded-md bg-muted"></div>
    }
);

// 临时的分类数据类型
interface Category {
    id: string;
    name: string;
    description: string;
}

interface CategoryListResponse {
    total: number;
    items: Category[];
}

// 文章数据类型
interface Article {
    id: string;
    title: string;
    content: string;
    cover_url: string;
    category_id: string;
    category_name: string;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
}

interface ArticleListResponse {
    total: number;
    items: Article[];
}

export default function PostsPage() {
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editArticle, setEditArticle] = useState<{
        open: boolean;
        article: Article | null;
    }>({
        open: false,
        article: null
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        article: Article | null;
    }>({
        open: false,
        article: null
    });
    const router = useRouter();

    // 获取文章列表
    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await request<ArticleListResponse>('/auth/admin/article/list');
            if (!response.ok) {
                throw new Error('获取文章列表失败');
            }
            const data = await response.json();
            setArticles(data.items);
            setTotal(data.total);
        } catch (error) {
            toast.error('获取失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    // 获取分类列表
    const fetchCategories = async () => {
        try {
            const response = await request<CategoryListResponse>('/auth/admin/category/list');
            if (!response.ok) {
                throw new Error('获取分类列表失败');
            }
            const data = await response.json();
            console.log('获取到的分类列表:', data.items);
            setCategories(data.items);
        } catch (error) {
            console.error('获取分类失败:', error);
            toast.error('获取分类失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        }
    };

    // 初始化数据
    useEffect(() => {
        console.log('初始化数据...');
        Promise.all([
            fetchArticles(),
            fetchCategories()
        ]).catch(error => {
            console.error('初始化数据失败:', error);
        });
    }, []);

    useEffect(() => {
        console.log('分类列表更新:', categories);
    }, [categories]);

    // 处理图片上传预览
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditArticle(prev => ({
                ...prev,
                article: prev.article ? {
                    ...prev.article,
                    cover_url: URL.createObjectURL(file)
                } : null
            }));
        }
    };

    // 更新文章
    const handleUpdateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editArticle.article) return;
        setLoading(true);

        try {
            // 先获取文章详情
            const detailResponse = await request<Article>(`/auth/admin/article/detail/${editArticle.article.id}`);
            if (!detailResponse.ok) {
                throw new Error('获取文章详情失败');
            }
            const articleDetail = await detailResponse.json();

            // 清洗文章内容
            const sanitizedContent = DOMPurify.sanitize(editArticle.article.content, {
                ALLOWED_TAGS: [
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                    'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'img'
                ],
                ALLOWED_ATTR: [
                    'href', 'name', 'target', 'src', 'alt', 'class', 'style', 'width', 'height'
                ],
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['frameborder', 'allowfullscreen']
            });

            // 清洗文章标题
            const sanitizedTitle = DOMPurify.sanitize(editArticle.article.title, {
                ALLOWED_TAGS: [], // 不允许任何 HTML 标签
                ALLOWED_ATTR: [] // 不允许任何属性
            });

            const formData = new FormData();
            formData.append('title', sanitizedTitle);
            formData.append('content', sanitizedContent);
            formData.append('category_id', editArticle.article.category_id);

            const response = await request<Article>(`/auth/admin/article/update/${editArticle.article.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('更新文章失败');
            }

            const data = await response.json();
            setArticles(articles.map(item =>
                item.id === data.id ? data : item
            ));
            setEditArticle({ open: false, article: null });
            toast.success('更新成功');
        } catch (error) {
            toast.error('更新失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    // 删除文章
    const handleDeleteArticle = async () => {
        if (!deleteDialog.article) return;
        setLoading(true);

        try {
            const response = await request(`/auth/admin/articles/${deleteDialog.article.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除文章失败');
            }

            setArticles(articles.filter(item => item.id !== deleteDialog.article?.id));
            setTotal(total - 1);
            setDeleteDialog({ open: false, article: null });
            toast.success('删除成功');
        } catch (error) {
            toast.error('删除失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">文章管理</h1>
                <p className="text-sm text-muted-foreground mt-2">管理和发布文章内容</p>
            </div>

            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">文章列表</CardTitle>
                                <CardDescription>共 {total} 篇文章</CardDescription>
                            </div>
                            <Button onClick={() => router.push('/dashboard/posts/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                写文章
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>封面</TableHead>
                                        <TableHead>标题</TableHead>
                                        <TableHead>分类</TableHead>
                                        <TableHead>状态</TableHead>
                                        <TableHead>创建时间</TableHead>
                                        <TableHead>更新时间</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {articles.map((article) => (
                                        <TableRow key={article.id}>
                                            <TableCell>
                                                {article.cover_url ? (
                                                    <img
                                                        src={article.cover_url}
                                                        alt={article.title}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{article.title}</TableCell>
                                            <TableCell>{article.category_name}</TableCell>
                                            <TableCell>
                                                <span className={article.status === 'published' ? 'text-green-600' : 'text-yellow-600'}>
                                                    {article.status === 'published' ? '已发布' : '草稿'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{article.created_at}</TableCell>
                                            <TableCell>{article.updated_at}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="编辑文章"
                                                        onClick={() => setEditArticle({ open: true, article })}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        title="删除文章"
                                                        onClick={() => setDeleteDialog({ open: true, article })}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 编辑文章对话框 */}
            <Dialog open={editArticle.open} onOpenChange={(open) => setEditArticle({ open, article: open ? editArticle.article : null })}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>编辑文章</DialogTitle>
                        <DialogDescription>修改文章信息</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateArticle} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">文章标题</Label>
                            <Input
                                id="edit-title"
                                value={editArticle.article?.title}
                                onChange={(e) => setEditArticle(prev => ({
                                    ...prev,
                                    article: prev.article ? { ...prev.article, title: e.target.value } : null
                                }))}
                                placeholder="请输入文章标题"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">所属分类</Label>
                            <Select
                                value={editArticle.article?.category_id}
                                onValueChange={(value) => setEditArticle(prev => ({
                                    ...prev,
                                    article: prev.article ? { ...prev.article, category_id: value } : null
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择分类" />
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
                            <Label htmlFor="edit-cover">封面图片</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="edit-cover"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="flex-1"
                                />
                                {editArticle.article?.cover_url && (
                                    <div className="relative w-20 h-20">
                                        <img
                                            src={editArticle.article.cover_url}
                                            alt="封面预览"
                                            className="w-full h-full object-cover rounded"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 -right-2"
                                            onClick={() => setEditArticle(prev => ({
                                                ...prev,
                                                article: prev.article ? { ...prev.article, cover_url: '' } : null
                                            }))}
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-content">文章内容</Label>
                            <Editor
                                content={editArticle.article?.content || ''}
                                onChange={(value) => setEditArticle(prev => ({
                                    ...prev,
                                    article: prev.article ? { ...prev.article, content: value } : null
                                }))}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        更新中...
                                    </>
                                ) : '更新文章'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, article: open ? deleteDialog.article : null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>删除文章</DialogTitle>
                        <DialogDescription>
                            确定要删除这篇文章吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">文章标题</p>
                            <p className="text-sm text-muted-foreground">{deleteDialog.article?.title}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">所属分类</p>
                            <p className="text-sm text-muted-foreground">{deleteDialog.article?.category_name}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialog({ open: false, article: null })}
                        >
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteArticle}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    删除中...
                                </>
                            ) : '确认删除'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 