'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Users, Link2, FileText, TrendingUp, TrendingDown, Eye, MessageSquare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { request } from "@/lib/request";

interface DashboardStats {
    users: {
        total: number;
        active: number;
        trend: number;
    };
    posts: {
        total: number;
        published: number;
        trend: number;
    };
    links: {
        total: number;
        visits: number;
        trend: number;
    };
    comments: {
        total: number;
        pending: number;
        trend: number;
    };
}

interface RecentActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    created_at: string;
    user: {
        name: string;
        avatar_url: string;
    };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        users: { total: 0, active: 0, trend: 0 },
        posts: { total: 0, published: 0, trend: 0 },
        links: { total: 0, visits: 0, trend: 0 },
        comments: { total: 0, pending: 0, trend: 0 }
    });
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        // 初始化时间
        setCurrentTime(new Date().toLocaleString());

        // 每秒更新时间
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await request('/auth/admin/comment/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    // 转换后端数据格式为前端所需格式
                    setStats({
                        users: {
                            total: data.stats.users.total || 0,
                            active: data.stats.users.active || 0,
                            trend: data.stats.users.trend || 0
                        },
                        posts: {
                            total: data.stats.posts.total || 0,
                            published: data.stats.posts.published || 0,
                            trend: data.stats.posts.trend || 0
                        },
                        links: {
                            total: data.stats.links.total || 0,
                            visits: data.stats.links.visits || 0,
                            trend: data.stats.links.trend || 0
                        },
                        comments: {
                            total: data.stats.comments.total || 0,
                            pending: data.stats.comments.pending || 0,
                            trend: data.stats.comments.trend || 0
                        }
                    });

                    // 设置活动数据
                    setActivities(data.activities || []);
                }
            } catch (error) {
                console.error('获取仪表盘数据失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // 每5分钟刷新一次数据
        const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, []);

    // 计算趋势
    const calculateTrend = (current: number, previous: number): number => {
        if (!previous) return 0;
        return Number(((current - previous) / previous * 100).toFixed(1));
    };

    const StatCard = ({ title, value, description, icon: Icon, trend, color }: any) => (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2 bg-primary/10 rounded-lg", color)}>
                    <Icon className="w-4 h-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "flex items-center text-sm",
                        trend > 0 ? "text-green-600" : "text-red-600"
                    )}>
                        {trend > 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(trend)}%
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
            <div className={cn(
                "absolute bottom-0 left-0 w-full h-1",
                trend > 0 ? "bg-green-500/20" : "bg-red-500/20"
            )} />
        </Card>
    );

    const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
        <div className="flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                {activity.type === 'post' && <FileText className="w-4 h-4 text-primary" />}
                {activity.type === 'comment' && <MessageSquare className="w-4 h-4 text-primary" />}
                {activity.type === 'user' && <Users className="w-4 h-4 text-primary" />}
                {activity.type === 'security' && <Shield className="w-4 h-4 text-primary" />}
                {activity.type === 'link' && <Link2 className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                        {activity.description}
                    </span>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(activity.created_at).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        })}
                    </time>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
                    <p className="text-muted-foreground">
                        欢迎回来！以下是您的系统概览。
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        最后更新: {currentTime}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="用户数量"
                    value={stats.users.total}
                    description={`${stats.users.active} 个活跃用户`}
                    icon={Users}
                    trend={stats.users.trend}
                />
                <StatCard
                    title="文章数量"
                    value={stats.posts.total}
                    description={`${stats.posts.published} 篇已发布`}
                    icon={FileText}
                    trend={stats.posts.trend}
                />
                <StatCard
                    title="短链接数"
                    value={stats.links.total}
                    description={`${stats.links.visits} 次访问`}
                    icon={Link2}
                    trend={stats.links.trend}
                />
                <StatCard
                    title="评论数量"
                    value={stats.comments.total}
                    description={`${stats.comments.pending} 条待审核`}
                    icon={MessageSquare}
                    trend={stats.comments.trend}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>访问趋势</CardTitle>
                                <CardDescription>
                                    过去 30 天的系统访问量统计
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">页面访问</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                                    <span className="text-muted-foreground">独立访客</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                            图表区域（需要集成图表库）
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>最近活动</CardTitle>
                                <CardDescription>
                                    系统最新动态
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                实时
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[350px]">
                            <div className="space-y-0 divide-y">
                                {activities.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                                {activities.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <Activity className="w-12 h-12 mb-4" />
                                        <p>暂无活动记录</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>热门文章</CardTitle>
                        <CardDescription>
                            访问量最高的文章
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Eye className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">示例文章标题 {i}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {1000 - i * 100} 次访问
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {i} 天前
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>热门短链</CardTitle>
                        <CardDescription>
                            点击量最高的短链接
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Link2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">示例短链描述 {i}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {500 - i * 50} 次点击
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {i * 2} 小时前
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>系统状态</CardTitle>
                        <CardDescription>
                            关键指标监控
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">CPU 使用率</span>
                                    <span className="font-medium">45%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted">
                                    <div className="h-full w-[45%] rounded-full bg-primary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">内存使用率</span>
                                    <span className="font-medium">68%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted">
                                    <div className="h-full w-[68%] rounded-full bg-primary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">存储空间</span>
                                    <span className="font-medium">32%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted">
                                    <div className="h-full w-[32%] rounded-full bg-primary" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 