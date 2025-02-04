'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth } from '@/lib/auth';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield, User, Key } from "lucide-react";
import { Toaster } from "sonner";

interface UserInfo {
    name: string;
    avatar_url: string;
    email: string;
    role: string;
    admin_id: number;
}

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const { token } = getAuth();
                if (!token) return;

                const response = await fetch('/auth/admin/info', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserInfo(data);
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">加载中...</div>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">无法加载用户信息</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Toaster
                position="top-right"
                expand={true}
                richColors
                closeButton
            />
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">个人资料</h2>
                        <p className="text-muted-foreground mt-1">
                            查看和管理您的个人信息
                        </p>
                    </div>
                    <Badge variant="secondary" className="mt-1">
                        {userInfo.role === 'superadmin' ? '超级管理员' : '管理员'}
                    </Badge>
                </div>

                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 ring-2 ring-primary/10">
                                <AvatarImage src={userInfo.avatar_url} alt={userInfo.name} />
                                <AvatarFallback className="text-xl bg-primary/5">
                                    {userInfo.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-semibold">{userInfo.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {userInfo.email}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="grid gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Key className="h-4 w-4" />
                                        管理员ID
                                    </div>
                                    <p className="text-lg">{userInfo.admin_id}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        邮箱地址
                                    </div>
                                    <p className="text-lg">{userInfo.email}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        用户名
                                    </div>
                                    <p className="text-lg">{userInfo.name}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        角色权限
                                    </div>
                                    <p className="text-lg">
                                        {userInfo.role === 'superadmin' ? '超级管理员' : '管理员'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 