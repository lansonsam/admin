'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    FileText,
    FolderOpen,
    MessageSquare,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">仪表盘</h1>

            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,853</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 flex items-center">
                                <ArrowUpRight className="h-3 w-3" />
                                +12%
                            </span>
                            较上月
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">文章数量</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">438</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 flex items-center">
                                <ArrowUpRight className="h-3 w-3" />
                                +8%
                            </span>
                            较上月
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">资源数量</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,324</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-red-500 flex items-center">
                                <ArrowDownRight className="h-3 w-3" />
                                -3%
                            </span>
                            较上月
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">评论数量</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,234</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="text-green-500 flex items-center">
                                <ArrowUpRight className="h-3 w-3" />
                                +18%
                            </span>
                            较上月
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 最近活动 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>最近文章</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">如何使用Next.js和Tailwind CSS构建现代网站</p>
                                        <p className="text-sm text-muted-foreground">2024-02-03 12:00</p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>最新评论</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm"><span className="font-medium">用户{i}</span> 评论了 <span className="text-blue-500">文章标题</span></p>
                                        <p className="text-sm text-muted-foreground">这是一个非常有见地的评论...</p>
                                        <p className="text-xs text-muted-foreground">2分钟前</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 