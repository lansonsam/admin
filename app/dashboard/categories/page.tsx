'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2, FolderPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { request } from "@/lib/request";
import type { Category, CategoryListResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/types";

export default function CategoriesPage() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: ''
    });
    const [editCategory, setEditCategory] = useState<{
        open: boolean;
        category: Category | null;
    }>({
        open: false,
        category: null
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        category: Category | null;
    }>({
        open: false,
        category: null
    });

    // 获取分类列表
    const fetchCategories = async () => {
        try {
            const response = await request<CategoryListResponse>('/auth/admin/category/list');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.items);
                setTotal(data.total);
            } else {
                throw new Error('获取分类列表失败');
            }
        } catch (error) {
            toast.error('获取失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 创建分类
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await request<Category>('/auth/admin/category/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) {
                throw new Error('创建分类失败');
            }

            const data = await response.json();
            setCategories([data, ...categories]);
            setTotal(total + 1);
            setNewCategory({ name: '', description: '' });
            toast.success('创建成功', {
                description: '分类已创建',
            });
        } catch (error) {
            toast.error('创建失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    // 更新分类
    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCategory.category) return;
        setLoading(true);

        try {
            const response = await request<Category>(`/auth/admin/category/update/${editCategory.category.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editCategory.category.name,
                    description: editCategory.category.description,
                }),
            });

            if (!response.ok) {
                throw new Error('更新分类失败');
            }

            const data = await response.json();
            setCategories(categories.map(item =>
                item.id === data.id ? data : item
            ));
            setEditCategory({ open: false, category: null });
            toast.success('更新成功', {
                description: '分类已更新',
            });
        } catch (error) {
            toast.error('更新失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    // 删除分类
    const handleDeleteCategory = async () => {
        if (!deleteDialog.category) return;
        setLoading(true);

        try {
            const response = await request(`/auth/admin/category/delete/${deleteDialog.category.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除分类失败');
            }

            setCategories(categories.filter(item => item.id !== deleteDialog.category?.id));
            setTotal(total - 1);
            setDeleteDialog({ open: false, category: null });
            toast.success('删除成功', {
                description: '分类已删除',
            });
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
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FolderPlus className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>分类管理</CardTitle>
                                <CardDescription>管理文章分类</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>总分类数</span>
                                <span className="font-medium text-foreground">{total}</span>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <FolderPlus className="mr-2 h-4 w-4" />
                                        创建分类
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>创建新分类</DialogTitle>
                                        <DialogDescription>添加一个新的文章分类</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateCategory} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">分类名称</Label>
                                            <Input
                                                id="name"
                                                value={newCategory.name}
                                                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="请输入分类名称"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">分类描述</Label>
                                            <Textarea
                                                id="description"
                                                value={newCategory.description}
                                                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="请输入分类描述"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        创建中...
                                                    </>
                                                ) : '创建分类'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>分类名称</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead>文章数量</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id} className="group">
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>{category.article_count}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="编辑分类"
                                                onClick={() => setEditCategory({ open: true, category })}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                title="删除分类"
                                                onClick={() => setDeleteDialog({ open: true, category })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 编辑分类对话框 */}
            <Dialog open={editCategory.open} onOpenChange={(open) => setEditCategory({ open, category: open ? editCategory.category : null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>编辑分类</DialogTitle>
                        <DialogDescription>修改分类信息</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">分类名称</Label>
                            <Input
                                id="edit-name"
                                value={editCategory.category?.name}
                                onChange={(e) => setEditCategory(prev => ({
                                    ...prev,
                                    category: prev.category ? { ...prev.category, name: e.target.value } : null
                                }))}
                                placeholder="请输入分类名称"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">分类描述</Label>
                            <Textarea
                                id="edit-description"
                                value={editCategory.category?.description}
                                onChange={(e) => setEditCategory(prev => ({
                                    ...prev,
                                    category: prev.category ? { ...prev.category, description: e.target.value } : null
                                }))}
                                placeholder="请输入分类描述"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        更新中...
                                    </>
                                ) : '更新分类'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: open ? deleteDialog.category : null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>删除分类</DialogTitle>
                        <DialogDescription>
                            确定要删除这个分类吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">分类名称</p>
                            <p className="text-sm text-muted-foreground">{deleteDialog.category?.name}</p>
                        </div>
                        {deleteDialog.category?.description && (
                            <div>
                                <p className="text-sm font-medium">分类描述</p>
                                <p className="text-sm text-muted-foreground">{deleteDialog.category.description}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium">文章数量</p>
                            <p className="text-sm text-muted-foreground">{deleteDialog.category?.article_count} 篇</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, category: null })}
                        >
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteCategory}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    删除中...
                                </>
                            ) : '删除'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 