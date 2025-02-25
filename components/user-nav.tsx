'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuth, removeAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChangePasswordForm } from "./change-password";
import { AvatarUpload } from "./avatar-upload";

interface UserInfo {
    name: string;
    avatar_url: string;
    email: string;
    role: string;
    admin_id: number;
}

export function UserNav() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showAvatarDialog, setShowAvatarDialog] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const auth = getAuth();

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
                    setAvatarUrl(data.avatar_url || '');
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        removeAuth();
        router.push('/auth/login');
    };

    if (!userInfo) return null;

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userInfo?.name || ''}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={avatarUrl} alt={userInfo.name} />
                                <AvatarFallback>{userInfo.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userInfo.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{userInfo.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link href="/dashboard/profile">
                                <DropdownMenuItem className="cursor-pointer">
                                    个人资料
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => setShowAvatarDialog(true)}>
                                上传头像
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                                修改密码
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={handleLogout}
                        >
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-[425px] bg-background">
                    <DialogHeader>
                        <DialogTitle>修改密码</DialogTitle>
                    </DialogHeader>
                    <ChangePasswordForm onSuccess={() => setShowPasswordDialog(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>更新头像</DialogTitle>
                    </DialogHeader>
                    <AvatarUpload
                        value={avatarUrl}
                        onChange={(url) => {
                            setAvatarUrl(url);
                            // 同时更新 userInfo
                            if (userInfo) {
                                const updatedUserInfo = {
                                    ...userInfo,
                                    avatar_url: url
                                };
                                setUserInfo(updatedUserInfo);
                                // 更新本地存储
                                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 