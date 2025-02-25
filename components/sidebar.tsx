'use client';

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LayoutDashboard,
    FileText,
    Link2,
    Users,
    Settings,
    Tags,
    MessageSquare,
    BarChart3,
    LogOut,
    FolderPlus,
    ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { removeAuth } from "@/lib/auth";
import { request } from "@/lib/request";

const sidebarNavItems = [
    {
        title: "仪表盘",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "文章管理",
        href: "/dashboard/posts",
        icon: FileText,
    },
    {
        title: "分类管理",
        href: "/dashboard/categories",
        icon: FolderPlus,
    },
    {
        title: "短链管理",
        href: "/dashboard/links",
        icon: Link2,
    },
    {
        title: "用户管理",
        href: "/dashboard/users",
        icon: Users,
    },
    {
        title: "评论管理",
        href: "/dashboard/comments",
        icon: MessageSquare,
    },
    {
        title: "数据统计",
        href: "/dashboard/analytics",
        icon: BarChart3,
    },
    {
        title: "图床管理",
        href: "/dashboard/images",
        icon: ImageIcon,
    },
    {
        title: "系统设置",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description: string;
    is_editable: boolean;
    created_at: string;
    updated_at: string;
}

interface UserInfo {
    name: string;
    avatar_url: string;
    email: string;
    role: string;
    admin_id: number;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [systemName, setSystemName] = useState("管理系统");

    useEffect(() => {
        const fetchSystemName = async () => {
            try {
                // 先从本地存储获取
                const storedName = localStorage.getItem('system_name');
                if (storedName) {
                    setSystemName(storedName);
                }

                // 然后从服务器获取最新值
                const response = await request<{ items: SystemSetting[] }>('/auth/system/settings');
                if (response.ok) {
                    const data = await response.json();
                    const systemSetting = data.items.find(item => item.key === 'SYSTEM_NAME');
                    if (systemSetting) {
                        setSystemName(systemSetting.value);
                        localStorage.setItem('system_name', systemSetting.value);
                    }
                }
            } catch (error) {
                console.error('获取系统名称失败:', error);
            }
        };

        fetchSystemName();
    }, []);

    const handleLogout = () => {
        // 清除认证信息
        removeAuth();
        // 跳转到登录页面
        router.push('/');
    };

    return (
        <div className={cn("flex flex-col h-screen fixed left-0 top-0", className)}>
            <div className="flex-1">
                <div className="px-3 py-2">
                    <h2 className="mb-6 px-4 text-lg font-semibold">{systemName}</h2>
                    <div className="space-y-1">
                        <ScrollArea className="h-[calc(100vh-12rem)]">
                            <div className="space-y-1">
                                {sidebarNavItems.map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={pathname === item.href ? "secondary" : "ghost"}
                                            className="w-full justify-start gap-2"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.title}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
            <div className="border-t bg-gray-50/40 p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    退出登录
                </Button>
            </div>
        </div>
    );
} 