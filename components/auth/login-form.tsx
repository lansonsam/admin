'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { setAuth } from '@/lib/auth';

interface LoginResponse {
    access_token: string;
    token_type: string;
    name: string;
    role: string;
    admin_id: number;
    require_2fa: boolean;
    message?: string;
}

function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        totp_code: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [require2FA, setRequire2FA] = useState(false);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/auth/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    ...(formData.totp_code ? { totp_code: formData.totp_code } : {})
                }),
            });

            const data = await response.json();

            // 处理需要二次验证的情况
            if (response.ok && data.require_2fa) {
                setRequire2FA(true);
                setError(data.message || '请输入验证码');
                setIsLoading(false);
                return;
            }

            // 处理错误情况
            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        throw new Error(data.detail || '用户名或密码错误');
                    case 403:
                        throw new Error(data.detail || '账号已被禁用');
                    case 422:
                        throw new Error(data.detail || '请求数据验证失败');
                    default:
                        throw new Error(data.detail || '登录失败');
                }
            }

            // 登录成功
            setAuth(data.access_token, {
                name: data.name,
                role: data.role,
                admin_id: data.admin_id,
                require_2fa: data.require_2fa,
            });

            // 延迟关闭加载状态和跳转
            setTimeout(() => {
                setIsLoading(false);
                router.push('/dashboard');
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
            setIsLoading(false);
        }
    }, [formData, router]);

    return (
        <Card className="w-[450px]">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">欢迎回来</CardTitle>
                <CardDescription className="text-center font-medium">请登录您的账号</CardDescription>
                {error && (
                    <div className="text-sm text-red-500 text-center mt-2">{error}</div>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            用户名
                        </label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="请输入用户名"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="font-normal h-11"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            密码
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="请输入密码"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="font-normal h-11"
                                disabled={isLoading}
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>
                    </div>
                    {require2FA && (
                        <div className="space-y-2">
                            <label htmlFor="totp_code" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                验证码
                            </label>
                            <Input
                                id="totp_code"
                                type="text"
                                placeholder="请输入6位TOTP码或8位备份码"
                                value={formData.totp_code}
                                onChange={(e) => setFormData({ ...formData, totp_code: e.target.value })}
                                className="font-normal h-11"
                                disabled={isLoading}
                                required
                                maxLength={8}
                                pattern="[0-9]*"
                            />
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full font-medium h-11"
                        disabled={isLoading}
                    >
                        {isLoading ? '登录中...' : '登录'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <Button variant="link" className="w-full font-normal">
                    忘记密码？
                </Button>
            </CardFooter>
        </Card>
    );
}

export { LoginForm }; 