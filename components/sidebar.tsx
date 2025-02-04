'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Users,
    Settings,
    Tags,
    MessageSquare,
    BarChart3,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { removeAuth } from "@/lib/auth";

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
        title: "资源管理",
        href: "/dashboard/resources",
        icon: FolderOpen,
    },
    {
        title: "分类管理",
        href: "/dashboard/categories",
        icon: Tags,
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
        title: "系统设置",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // 清除认证信息
        removeAuth();
        // 跳转到登录页面
        router.push('/');
    };

    return (
        <div className={cn("flex flex-col min-h-screen", className)}>
            <div className="flex-1">
                <div className="px-3 py-2">
                    <h2 className="mb-6 px-4 text-lg font-semibold">资源博客管理系统</h2>
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
            <div className="border-t sticky bottom-0 bg-gray-50/40 p-4">
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