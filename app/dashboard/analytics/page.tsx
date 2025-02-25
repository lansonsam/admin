'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Activity,
    AlertCircle,
    Shield,
    Search,
    Timer,
    XCircle,
    UserX,
    LogIn,
    Globe,
    Chrome,
    Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/request";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SecurityLog {
    id: number;
    ip_address: string;
    user_agent: string;
    details: string;
    event_type: 'login_failed' | 'login_success' | 'password_reset' | 'account_locked';
    created_at: string;
}

interface SecurityLogResponse {
    total: number;
    items: SecurityLog[];
}

interface AIAnalysis {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    summary: string;
    recommendations: string[];
    patterns: {
        type: string;
        count: number;
        description: string;
    }[];
}

interface AIAnalysisConfig {
    time_range: {
        start_time: string;
        end_time: string;
    };
    analysis_type: 'basic' | 'detailed' | 'comprehensive';
    model: string;
    options: {
        include_patterns: boolean;
        include_recommendations: boolean;
        include_summary: boolean;
        cache_result: boolean;
        cache_ttl: number;
    };
}

const eventIcons = {
    'login_failed': <UserX className="h-4 w-4 text-red-500" />,
    'login_success': <LogIn className="h-4 w-4 text-green-500" />,
    'password_reset': <Shield className="h-4 w-4 text-blue-500" />,
    'account_locked': <XCircle className="h-4 w-4 text-orange-500" />,
} as const;

const eventColors = {
    'login_failed': 'bg-red-50 text-red-700 border-red-200',
    'login_success': 'bg-green-50 text-green-700 border-green-200',
    'password_reset': 'bg-blue-50 text-blue-700 border-blue-200',
    'account_locked': 'bg-orange-50 text-orange-700 border-orange-200',
} as const;

const riskLevelColors = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800',
} as const;

const getBrowserIcon = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return <Chrome className="h-4 w-4" />;
    if (userAgent.includes('Firefox')) return <Globe className="h-4 w-4" />;
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
};

export default function SecurityLogsPage() {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
    const [total, setTotal] = useState(0);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [analysisConfig, setAnalysisConfig] = useState<AIAnalysisConfig>({
        time_range: {
            start_time: '2024-01-01T00:00:00',
            end_time: '2024-01-31T23:59:59'
        },
        analysis_type: 'comprehensive',
        model: 'deepseek-chat',
        options: {
            include_patterns: true,
            include_recommendations: true,
            include_summary: true,
            cache_result: true,
            cache_ttl: 300
        }
    });

    // 处理时间范围变更
    const handleTimeRangeChange = (field: 'start_time' | 'end_time', value: string) => {
        setAnalysisConfig(prev => ({
            ...prev,
            time_range: {
                ...prev.time_range,
                [field]: value
            }
        }));
    };

    // 处理分析类型变更
    const handleAnalysisTypeChange = (value: 'basic' | 'detailed' | 'comprehensive') => {
        setAnalysisConfig(prev => ({
            ...prev,
            analysis_type: value
        }));
    };

    // 模拟 AI 分析
    const analyzeSecurityLogs = async (logs: SecurityLog[]) => {
        setAnalyzing(true);
        try {
            // 调用 AI 分析接口
            const response = await request('/auth/admin/log/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisConfig)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'AI分析请求失败');
            }

            const analysisResult = await response.json();

            // 转换API响应为我们需要的格式
            const analysis: AIAnalysis = {
                riskLevel: analysisResult.risk_level || 'low',
                summary: analysisResult.summary || '暂无分析结果',
                recommendations: analysisResult.recommendations || [],
                patterns: (analysisResult.patterns || []).map((pattern: any) => ({
                    type: pattern.type,
                    count: pattern.count,
                    description: pattern.description
                }))
            };

            setAiAnalysis(analysis);

            // 显示成功提示
            toast.success('分析完成', {
                description: '安全日志分析已更新',
                icon: <Activity className="h-4 w-4 text-green-500" />,
                duration: 3000,
            });
        } catch (error) {
            toast.error('AI分析失败', {
                description: error instanceof Error ? error.message : '无法完成安全日志的智能分析',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            });

            // 如果 AI 分析失败，使用基本的统计分析作为后备
            const failedLogins = logs.filter(log => log.event_type === 'login_failed').length;
            const accountLocks = logs.filter(log => log.event_type === 'account_locked').length;

            let riskLevel: AIAnalysis['riskLevel'] = 'low';
            if (failedLogins > 10) riskLevel = 'critical';
            else if (failedLogins > 5) riskLevel = 'high';
            else if (failedLogins > 2) riskLevel = 'medium';

            const fallbackAnalysis: AIAnalysis = {
                riskLevel,
                summary: `在 ${new Date(analysisConfig.time_range.start_time).toLocaleString()} 至 ${new Date(analysisConfig.time_range.end_time).toLocaleString()} 期间，系统记录了 ${logs.length} 个安全事件。其中包含 ${failedLogins} 次登录失败尝试和 ${accountLocks} 次账户锁定事件。根据分析，当前系统安全风险等级为 ${riskLevel}。`,
                recommendations: [
                    '建议开启双因素认证以提高账户安全性',
                    '定期审查登录失败的IP地址',
                    '考虑实施渐进式延迟登录机制',
                    '更新系统安全策略，增加密码复杂度要求'
                ],
                patterns: [
                    {
                        type: '登录失败模式',
                        count: failedLogins,
                        description: '检测到多次登录失败，可能存在暴力破解尝试'
                    },
                    {
                        type: '账户锁定事件',
                        count: accountLocks,
                        description: '系统自动锁定了可疑账户，有效防止了进一步的攻击'
                    }
                ]
            };

            setAiAnalysis(fallbackAnalysis);
        } finally {
            setAnalyzing(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await request<SecurityLogResponse>('/auth/admin/log/security');
            if (!response.ok) {
                throw new Error('获取安全日志失败');
            }
            const data = await response.json();
            setLogs(data.items);
            setTotal(data.total);

            // 移除自动 AI 分析
            // analyzeSecurityLogs(data.items);
        } catch (error) {
            toast.error('获取失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        if (autoRefresh) {
            const interval = setInterval(fetchLogs, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const filteredLogs = logs
        .filter(log => filter === 'all' || log.event_type === filter)
        .filter(log =>
            searchQuery === '' ||
            log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="space-y-6">
            {/* 配置对话框 */}
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI 分析配置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>开始时间</Label>
                            <Input
                                type="datetime-local"
                                value={analysisConfig.time_range.start_time.slice(0, 16)}
                                onChange={(e) => handleTimeRangeChange('start_time', e.target.value + ':00')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>结束时间</Label>
                            <Input
                                type="datetime-local"
                                value={analysisConfig.time_range.end_time.slice(0, 16)}
                                onChange={(e) => handleTimeRangeChange('end_time', e.target.value + ':00')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>分析类型</Label>
                            <Select
                                value={analysisConfig.analysis_type}
                                onValueChange={handleAnalysisTypeChange}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">基础分析</SelectItem>
                                    <SelectItem value="detailed">详细分析</SelectItem>
                                    <SelectItem value="comprehensive">全面分析</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                            取消
                        </Button>
                        <Button onClick={() => {
                            setShowConfigDialog(false);
                            analyzeSecurityLogs(logs);
                        }}>
                            开始分析
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI 分析面板 */}
            {aiAnalysis && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>AI 安全分析</CardTitle>
                                    <CardDescription>
                                        {analyzing ? (
                                            <span className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 animate-spin" />
                                                正在进行智能分析...
                                            </span>
                                        ) : (
                                            <>
                                                DeepSeek 智能安全评估
                                                <span className="ml-2 text-xs">
                                                    ({new Date(analysisConfig.time_range.start_time).toLocaleDateString()} - {new Date(analysisConfig.time_range.end_time).toLocaleDateString()})
                                                </span>
                                            </>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge className={cn("px-4 py-1", riskLevelColors[aiAnalysis.riskLevel])}>
                                {aiAnalysis.riskLevel === 'critical' && '严重风险'}
                                {aiAnalysis.riskLevel === 'high' && '高风险'}
                                {aiAnalysis.riskLevel === 'medium' && '中等风险'}
                                {aiAnalysis.riskLevel === 'low' && '低风险'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-medium mb-2">安全态势分析</h3>
                                <p className="text-sm text-muted-foreground">{aiAnalysis.summary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiAnalysis.patterns.map((pattern, index) => (
                                    <Card key={`pattern-${pattern.type}-${index}`} className="border border-muted">
                                        <CardHeader className="p-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">{pattern.type}</CardTitle>
                                                <Badge variant="outline">{pattern.count}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <p className="text-sm text-muted-foreground">
                                                {pattern.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div>
                                <h3 className="font-medium mb-3">安全建议</h3>
                                <div className="grid gap-2">
                                    {aiAnalysis.recommendations.map((rec, index) => (
                                        <div key={`recommendation-${index}`} className="flex items-center gap-2 text-sm">
                                            <Shield className="h-4 w-4 text-primary" />
                                            <span>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 日志列表卡片 */}
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>安全日志</CardTitle>
                                <CardDescription>监控系统安全事件</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>总事件数</span>
                                <span className="font-medium text-foreground">{total}</span>
                            </div>
                            <Button
                                variant={autoRefresh ? "default" : "outline"}
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className="gap-2"
                            >
                                <Timer className="h-4 w-4" />
                                {autoRefresh ? '实时更新中' : '已暂停更新'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowConfigDialog(true)}
                                disabled={analyzing}
                                className="gap-2"
                            >
                                {analyzing ? (
                                    <>
                                        <Activity className="h-4 w-4 animate-spin" />
                                        分析中...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="h-4 w-4" />
                                        AI 分析
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="搜索IP地址或事件详情..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="选择事件类型" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部事件</SelectItem>
                                <SelectItem value="login_failed">登录失败</SelectItem>
                                <SelectItem value="login_success">登录成功</SelectItem>
                                <SelectItem value="password_reset">密码重置</SelectItem>
                                <SelectItem value="account_locked">账户锁定</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {filteredLogs.map((log, index) => (
                                <div
                                    key={log.id ? `log-${log.id}` : `log-fallback-${index}-${log.created_at}`}
                                    className={`p-4 rounded-lg border ${eventColors[log.event_type] || 'bg-gray-50'} transition-colors hover:bg-opacity-80 cursor-pointer`}
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {eventIcons[log.event_type]}
                                            <Badge variant="outline">
                                                {log.event_type === 'login_failed' && '登录失败'}
                                                {log.event_type === 'login_success' && '登录成功'}
                                                {log.event_type === 'password_reset' && '密码重置'}
                                                {log.event_type === 'account_locked' && '账户锁定'}
                                            </Badge>
                                            <Badge variant="secondary" className="font-mono">
                                                {log.ip_address}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getBrowserIcon(log.user_agent)}
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(log.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium">{log.details}</p>
                                    <div className="mt-2 text-xs text-muted-foreground font-mono">
                                        {log.user_agent}
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Shield className="h-12 w-12 mb-4" />
                                    <p>暂无安全事件记录</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">事件统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(eventIcons).map(([type, icon]) => (
                                <div key={`event-type-${type}`} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {icon}
                                        <span>
                                            {type === 'login_failed' && '登录失败'}
                                            {type === 'login_success' && '登录成功'}
                                            {type === 'password_reset' && '密码重置'}
                                            {type === 'account_locked' && '账户锁定'}
                                        </span>
                                    </div>
                                    <Badge variant="secondary">
                                        {logs.filter(log => log.event_type === type).length}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">IP 地址分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from(new Set(logs.map(log => log.ip_address))).map(ip => (
                                <div key={`ip-${ip}`} className="flex items-center justify-between">
                                    <Badge variant="outline" className="font-mono">
                                        {ip}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {logs.filter(log => log.ip_address === ip).length}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 