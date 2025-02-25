'use client';

import { useEffect, useState } from 'react';
import { getAdminList, updateAdminStatus } from '@/lib/api';
import { Admin } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CreateAdminDialog } from '@/components/create-admin-dialog';
import { UpdatePasswordDialog } from '@/components/update-password-dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsersIcon, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/request";
import { toast } from 'sonner';

export default function UsersPage() {
    const [users, setUsers] = useState<Admin[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<Admin | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await getAdminList();
            setUsers(data.items);
            setTotal(data.total);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '获取用户列表失败';
            setError(errorMessage);
            toast.error('获取用户列表失败', {
                description: errorMessage,
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (adminId: string, newStatus: boolean) => {
        try {
            await updateAdminStatus(adminId, { status: newStatus });
            // 更新本地状态
            setUsers(users.map(user =>
                user.admin_id === adminId
                    ? { ...user, is_active: newStatus }
                    : user
            ));
            toast.success(newStatus ? '用户已启用' : '用户已禁用', {
                description: `用户状态已${newStatus ? '启用' : '禁用'}`,
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '更新状态失败';
            toast.error('更新状态失败', {
                description: errorMessage,
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
            // 如果失败，重新获取列表以确保数据同步
            fetchUsers();
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await request(`/auth/admin/${userToDelete.admin_id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.detail === "不能删除自己") {
                    toast.error('无法删除', {
                        description: '系统不允许删除当前登录的用户账号',
                        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                        duration: 4000,
                    });
                } else {
                    throw new Error(data.detail || '删除失败');
                }
                return;
            }

            // 从列表中移除被删除的用户
            setUsers(users.filter(user => user.admin_id !== userToDelete.admin_id));
            toast.success('用户已删除', {
                description: `用户 ${userToDelete.name} 已被删除`,
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
            setUserToDelete(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '删除失败';
            toast.error('删除失败', {
                description: errorMessage,
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
                duration: 4000,
            });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UsersIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>用户管理</CardTitle>
                                <CardDescription>管理系统用户</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>总用户数</span>
                                <span className="font-medium text-foreground">{total}</span>
                            </div>
                            <CreateAdminDialog onSuccess={fetchUsers} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[300px]">用户信息</TableHead>
                                <TableHead className="w-[250px]">邮箱</TableHead>
                                <TableHead>角色</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead className="w-[180px]">创建时间</TableHead>
                                <TableHead className="w-[200px] text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.admin_id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.avatar_url} alt={user.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">ID: {user.admin_id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.role === 'superadmin' ? 'destructive' :
                                                user.role === 'admin' ? 'default' : 'secondary'
                                        } className="capitalize">
                                            {user.role === 'superadmin' ? '超级管理员' :
                                                user.role === 'admin' ? '管理员' : '作者'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "success" : "secondary"} className="min-w-[4rem] justify-center">
                                            {user.is_active ? '活跃' : '禁用'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(new Date(user.created_at), 'yyyy-MM-dd HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Switch
                                                checked={user.is_active}
                                                onCheckedChange={(checked) => handleStatusChange(user.admin_id, checked)}
                                            />
                                            <UpdatePasswordDialog
                                                adminId={user.admin_id}
                                                userName={user.name}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setUserToDelete(user)}
                                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
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

            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除用户</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除用户 "{userToDelete?.name}" 吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
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