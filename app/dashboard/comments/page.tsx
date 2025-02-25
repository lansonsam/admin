'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MessageSquare, Loader2, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { getCommentList, updateCommentVisibility, deleteComment } from '@/lib/api';
import type { Comment } from '@/lib/types';
import { format } from 'date-fns';

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

    // 获取评论列表
    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await getCommentList();
            setComments(data.items);
            setTotal(data.total);
        } catch (error) {
            toast.error('获取评论列表失败', {
                description: error instanceof Error ? error.message : '未知错误',
                dismissible: true,
                duration: 4000,
                id: 'fetch-comments-error',
                style: {
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    // 更新评论可见性
    const handleVisibilityChange = async (id: number, isVisible: boolean) => {
        try {
            await updateCommentVisibility(id, isVisible);
            setComments(comments.map(comment =>
                comment.comment_id === id ? { ...comment, is_visible: isVisible } : comment
            ));
            toast.success(isVisible ? '评论已显示' : '评论已隐藏');
        } catch (error) {
            toast.error('更新失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        }
    };

    // 删除评论
    const handleDelete = async () => {
        if (!commentToDelete) return;

        try {
            await deleteComment(commentToDelete.comment_id);
            setComments(comments.filter(comment => comment.comment_id !== commentToDelete.comment_id));
            setTotal(total - 1);
            toast.success('评论已删除');
        } catch (error) {
            toast.error('删除失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        } finally {
            setCommentToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>评论管理</CardTitle>
                                <CardDescription>管理文章评论</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>总评论数</span>
                                <span className="font-medium text-foreground">{total}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>评论内容</TableHead>
                                <TableHead>评论者</TableHead>
                                <TableHead>文章</TableHead>
                                <TableHead>IP地址</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="flex items-center justify-center h-24">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : comments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                                            <MessageSquare className="w-8 h-8 mb-2" />
                                            <p>暂无评论</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                comments.map((comment) => (
                                    <TableRow key={comment.comment_id} className="group">
                                        <TableCell className="max-w-[300px]">
                                            <div className="truncate font-medium">
                                                {comment.content}
                                            </div>
                                            {comment.parent_id && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    回复评论 #{comment.parent_id}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{comment.nickname}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {comment.email || '未提供邮箱'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="link"
                                                className="h-auto p-0 text-left font-normal"
                                                onClick={() => window.open(`/article/${comment.article_id}`, '_blank')}
                                            >
                                                {comment.article_title}
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{comment.ip_address}</div>
                                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                                {comment.user_agent}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {comment.is_visible ? (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <Eye className="w-4 h-4" />
                                                    <span>可见</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <EyeOff className="w-4 h-4" />
                                                    <span>隐藏</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Switch
                                                    checked={comment.is_visible}
                                                    onCheckedChange={(checked) => handleVisibilityChange(comment.comment_id, checked)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setCommentToDelete(comment)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 删除确认对话框 */}
            <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除评论</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除这条评论吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <div className="text-sm font-medium">评论内容</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {commentToDelete?.content}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">评论者</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {commentToDelete?.nickname} {commentToDelete?.email ? `(${commentToDelete.email})` : ''}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">评论时间</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {commentToDelete && format(new Date(commentToDelete.created_at), 'yyyy-MM-dd HH:mm:ss')}
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter className="mt-6">
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