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
import { Link2, Loader2, Copy, ExternalLink, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { request } from "@/lib/request";
import type { ShortLink, ShortLinkResponse } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export default function LinksPage() {
    const [loading, setLoading] = useState(false);
    const [links, setLinks] = useState<ShortLink[]>([]);
    const [total, setTotal] = useState(0);
    const [newLink, setNewLink] = useState({
        originalUrl: '',
        description: '',
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        link: ShortLink | null;
    }>({
        open: false,
        link: null,
    });

    const fetchLinks = async () => {
        try {
            const response = await request<ShortLinkResponse>('/auth/shortlink', {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                setLinks(data.items);
                setTotal(data.total);
            } else {
                throw new Error('获取短链接列表失败');
            }
        } catch (error) {
            toast.error('获取失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('复制成功', {
                description: '链接已复制到剪贴板',
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
        } catch (error) {
            toast.error('复制失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        }
    };

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await request<ShortLink>('/auth/shortlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    original_url: newLink.originalUrl,
                    description: newLink.description || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error('创建短链接失败');
            }

            const data = await response.json();

            // 更新列表
            setLinks([data, ...links]);
            setTotal(total + 1);

            // 重置表单
            setNewLink({ originalUrl: '', description: '' });

            // 自动复制新的短链到剪贴板
            await copyToClipboard(data.short_url);

            toast.success('创建成功', {
                description: '短链接已创建',
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
        } catch (error) {
            toast.error('创建失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.link) return;

        try {
            const response = await request(`/auth/shortlink/${deleteDialog.link.code}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除短链接失败');
            }

            // 关闭对话框
            setDeleteDialog({ open: false, link: null });

            // 重新获取列表
            await fetchLinks();

            toast.success('删除成功', {
                description: '短链接已删除',
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
        } catch (error) {
            toast.error('删除失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        }
    };

    const handleRegenerateCode = async (link: ShortLink) => {
        try {
            const response = await request<ShortLink>(`/auth/shortlink/${link.code}/regenerate`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('重新生成短链码失败');
            }

            const updatedLink = await response.json();

            // 更新列表中的数据
            setLinks(links.map(item =>
                item.id === updatedLink.id ? updatedLink : item
            ));

            // 自动复制新的短链到剪贴板
            await copyToClipboard(updatedLink.short_url);

            toast.success('重新生成成功', {
                description: '短链码已更新',
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
        } catch (error) {
            toast.error('重新生成失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        }
    };

    return (
        <div>
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Link2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>短链管理</CardTitle>
                                <CardDescription>管理和追踪您的短链接</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>总短链数</span>
                                <span className="font-medium text-foreground">{total}</span>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Link2 className="mr-2 h-4 w-4" />
                                        创建短链
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>创建新短链</DialogTitle>
                                        <DialogDescription>输入原始链接和描述来创建新的短链接</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateLink} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="originalUrl">原始链接</Label>
                                            <Input
                                                id="originalUrl"
                                                value={newLink.originalUrl}
                                                onChange={(e) => setNewLink(prev => ({ ...prev, originalUrl: e.target.value }))}
                                                placeholder="请输入需要缩短的链接"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">描述（可选）</Label>
                                            <Input
                                                id="description"
                                                value={newLink.description}
                                                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="请输入短链描述"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        创建中...
                                                    </>
                                                ) : '创建短链'}
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
                                <TableHead>原始链接</TableHead>
                                <TableHead>短链</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead>点击次数</TableHead>
                                <TableHead>最后访问</TableHead>
                                <TableHead>创建时间</TableHead>
                                <TableHead>创建者</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {links.map((link) => (
                                <TableRow key={link.id} className="group">
                                    <TableCell className="max-w-[300px] truncate">
                                        {link.original_url}
                                    </TableCell>
                                    <TableCell>
                                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                            {link.code}
                                        </code>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {link.description || '-'}
                                    </TableCell>
                                    <TableCell>{link.visits}</TableCell>
                                    <TableCell>{link.last_visit ? new Date(link.last_visit).toLocaleString() : '-'}</TableCell>
                                    <TableCell>{new Date(link.created_at).toLocaleString()}</TableCell>
                                    <TableCell>{link.creator_name}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(link.short_url)}
                                                title="复制短链"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(link.short_url, '_blank')}
                                                title="访问链接"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRegenerateCode(link)}
                                                title="重新生成短链码"
                                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteDialog({ open: true, link })}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                title="删除短链"
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

            {/* 删除确认对话框 */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, link: open ? deleteDialog.link : null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除短链接</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除短链接 "{deleteDialog.link?.code}" 吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 