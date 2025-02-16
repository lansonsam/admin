'use client';

import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth } from '@/lib/auth';
import { UserNav } from "@/components/user-nav";
import { request } from "@/lib/request";

interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description: string;
    is_editable: boolean;
    created_at: string;
    updated_at: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [systemName, setSystemName] = useState("管理系统");

    useEffect(() => {
        const { token } = getAuth();
        if (!token) {
            redirect('/');
        }

        const fetchSystemName = async () => {
            try {
                const response = await request<{ items: SystemSetting[] }>('/auth/system/settings');
                if (response.ok) {
                    const data = await response.json();
                    const systemSetting = data.items.find(item => item.key === 'SYSTEM_NAME');
                    if (systemSetting) {
                        setSystemName(systemSetting.value);
                        // 更新页面标题
                        document.title = systemSetting.value;
                    }
                }
            } catch (error) {
                console.error('获取系统名称失败:', error);
            }
        };

        fetchSystemName();
    }, []);

    return (
        <div className="flex min-h-screen">
            {/* 侧边栏 */}
            <Sidebar className="w-64 border-r bg-gray-50/40" />

            {/* 主内容区 */}
            <div className="flex-1">
                {/* 顶部导航栏 */}
                <header className="h-14 border-b bg-white/60 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex h-14 items-center px-6 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative w-96">
                                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    type="search"
                                    placeholder="搜索..."
                                    className="pl-8 bg-gray-50/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <UserNav />
                        </div>
                    </div>
                </header>

                {/* 页面内容 */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
} 