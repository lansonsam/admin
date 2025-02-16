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
import { Link2, Loader2, Copy, ExternalLink, Trash2, RefreshCw } from "lucide-react";
import { request } from "@/lib/request";
import type { ShortLink, ShortLinkResponse } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
                throw new Error('获取短链列表失败');
            }
        } catch (error) {
            toast.error('获取失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

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

            toast.success('创建成功', {
                description: '短链接已创建',
            });

            // 自动复制新的短链到剪贴板
            copyToClipboard(data.short_url);

            // 重置表单
            setNewLink({ originalUrl: '', description: '' });
        } catch (error) {
            toast.error('创建失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('已复制到剪贴板');
        });
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

            toast.success('删除成功', {
                description: '短链接已被删除',
            });

            // 重新获取列表
            await fetchLinks();
        } catch (error) {
            toast.error('删除失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        } finally {
            // 关闭对话框
            setDeleteDialog({ open: false, link: null });
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

            toast.success('重新生成成功', {
                description: '短链码已更新',
            });

            // 自动复制新的短链到剪贴板
            copyToClipboard(updatedLink.short_url);
        } catch (error) {
            toast.error('重新生成失败', {
                description: error instanceof Error ? error.message : '未知错误',
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">短链管理</h1>
                <p className="text-sm text-muted-foreground mt-2">管理和追踪您的短链接</p>
            </div>

            <Separator />

            <div className="grid gap-6">
                <Card className="col-span-3">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">链接列表</CardTitle>
                        <CardDescription>
                            共 {total} 个短链接
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-end">
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
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
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
                                        <TableRow key={link.id}>
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
                                                <div className="flex justify-end gap-2">
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
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, link: open ? deleteDialog.link : null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>删除短链接</DialogTitle>
                        <DialogDescription>
                            确定要删除这个短链接吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">原始链接</p>
                            <p className="text-sm text-muted-foreground break-all">{deleteDialog.link?.original_url}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">短链码</p>
                            <p className="text-sm text-muted-foreground">{deleteDialog.link?.code}</p>
                        </div>
                        {deleteDialog.link?.description && (
                            <div>
                                <p className="text-sm font-medium">描述</p>
                                <p className="text-sm text-muted-foreground">{deleteDialog.link.description}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, link: null })}
                        >
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 