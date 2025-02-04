import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { request } from '@/lib/request';
import { useRouter } from 'next/navigation';
import { removeAuth } from '@/lib/auth';

interface ChangePasswordFormProps {
    onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('密码不匹配', {
                description: '新密码与确认密码不一致',
                icon: <AlertCircle className="w-4 h-4 text-red-500" />,
                duration: 4000,
            });
            return;
        }

        setLoading(true);

        try {
            const response = await request('/auth/admin/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_password: formData.oldPassword,
                    new_password: formData.newPassword,
                    confirm_password: formData.confirmPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || '密码修改失败');
            }

            toast.success('密码已更新', {
                description: '密码修改成功，请重新登录',
                icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
                duration: 3000,
            });

            // 延迟处理所有状态更新和回调
            setTimeout(() => {
                setFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });

                if (onSuccess) {
                    onSuccess();
                }

                removeAuth();
                router.push('/');
            }, 1500);

        } catch (error) {
            toast.error('修改失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="w-4 h-4 text-red-500" />,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="oldPassword">当前密码</Label>
                <div className="relative">
                    <Input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={formData.oldPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                        placeholder="请输入当前密码"
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                        {showOldPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="请输入新密码"
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="请再次输入新密码"
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            更新中...
                        </>
                    ) : '更新密码'}
                </Button>
            </div>
        </form>
    );
} 