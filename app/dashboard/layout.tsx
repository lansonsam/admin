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

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const [systemName, setSystemName] = useState("管理系统");

    useEffect(() => {
        const { token } = getAuth();
        if (!token) {
            redirect('/');
        }

        // 在 useEffect 中获取本地存储的值
        const storedName = localStorage.getItem('system_name');
        if (storedName) {
            setSystemName(storedName);
        }

        const fetchSystemName = async () => {
            try {
                const response = await request<{ items: SystemSetting[] }>('/auth/system/basic-settings');
                if (response.ok) {
                    const data = await response.json();
                    const systemSetting = data.items.find(item => item.key === 'SYSTEM_NAME');
                    if (systemSetting) {
                        setSystemName(systemSetting.value);
                        // 更新页面标题和本地存储
                        document.title = systemSetting.value;
                        localStorage.setItem('system_name', systemSetting.value);
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
            <Sidebar className="w-64 shrink-0" />
            <main className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
} 