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
import { Toaster } from "sonner";

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
            <Toaster
                position="top-right"
                expand={true}
                richColors
                closeButton
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={userInfo.avatar_url} alt={userInfo.name} />
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

            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-[425px] bg-background">
                    <DialogHeader>
                        <DialogTitle>修改密码</DialogTitle>
                    </DialogHeader>
                    <ChangePasswordForm onSuccess={() => setShowPasswordDialog(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
} 