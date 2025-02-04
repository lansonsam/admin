'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarTrigger,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    useSidebar,
} from '@/components/ui/sidebar';
import { navItems } from '@/config/nav';
import { Loader2 } from 'lucide-react';

// 加载中组件
function LoadingSpinner() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

// 主布局组件
function MainLayout({ children }: { children: React.ReactNode }) {
    const { open: isOpen } = useSidebar();
    const router = useRouter();
    const [currentPath, setCurrentPath] = useState('');

    console.log('【Client】MainLayout 渲染', { isOpen, currentPath });

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        router.push('/');
    };

    useEffect(() => {
        console.log('【Client】MainLayout useEffect - 设置当前路径');
        setCurrentPath(window.location.pathname);
    }, []);

    return (
        <div className="flex min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-full items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <span className="text-xl font-bold">管理系统</span>
                    </div>
                    <Button
                        variant="ghost"
                        className="flex items-center"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        退出登录
                    </Button>
                </div>
            </header>

            {/* 侧边栏 */}
            <Sidebar className="fixed bottom-0 left-0 top-16 z-40 w-64 -translate-x-full border-r bg-background transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0 lg:w-64 lg:translate-x-0">
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    data-active={currentPath === item.href}
                                >
                                    <button
                                        onClick={() => {
                                            setCurrentPath(item.href);
                                            router.push(item.href);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                            currentPath === item.href
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            {/* 主内容区 */}
            <main className={cn(
                "flex-1 px-4 pb-8 pt-20 transition-[padding] duration-300",
                "lg:pl-72"
            )}>
                {children}
            </main>
        </div>
    );
}

// 仪表盘布局组件
export default function ClientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    const router = useRouter();

    console.log('【Client】ClientDashboardLayout 渲染', { authState });

    useEffect(() => {
        console.log('【Client】ClientDashboardLayout useEffect - 检查认证');
        const checkAuth = () => {
            const token = localStorage.getItem('access_token');
            console.log('【Client】检查 token:', !!token);

            if (!token) {
                setAuthState('unauthenticated');
                router.push('/');
                return;
            }

            setAuthState('authenticated');
        };

        checkAuth();
    }, [router]);

    if (authState === 'loading') {
        return <LoadingSpinner />;
    }

    if (authState === 'unauthenticated') {
        return null;
    }

    return (
        <SidebarProvider defaultOpen>
            <MainLayout>{children}</MainLayout>
        </SidebarProvider>
    );
} 