import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAdmin } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { request } from '@/lib/request';

type Role = 'superadmin' | 'admin' | 'author';

interface CreateAdminDialogProps {
    onSuccess: () => void;
}

export function CreateAdminDialog({ onSuccess }: CreateAdminDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendPassword, setSendPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'author' as Role,
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await createAdmin({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role: formData.role,
            });

            // 如果选择发送密码到邮箱
            if (sendPassword) {
                const sendPasswordResponse = await request('/auth/admin/send-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        username: formData.username,
                        password: formData.password,
                    }),
                });

                if (!sendPasswordResponse.ok) {
                    throw new Error('密码发送失败');
                }

                toast.success('用户创建成功', {
                    description: '密码已发送至用户邮箱',
                    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
                    duration: 3000,
                });
            } else {
                toast.success('用户创建成功', {
                    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
                    duration: 3000,
                });
            }

            setOpen(false);
            onSuccess();
            setFormData({
                username: '',
                password: '',
                email: '',
                role: 'author',
            });
        } catch (error) {
            toast.error('创建失败', {
                description: error instanceof Error ? error.message : '未知错误',
                icon: <AlertCircle className="w-4 h-4 text-red-500" />,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePassword = () => {
        // 生成12位随机密码，包含大小写字母、数字和特殊字符
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    创建用户
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>创建新用户</DialogTitle>
                    <DialogDescription>
                        创建一个新的管理员用户，设置其基本信息和权限。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="请输入邮箱"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <Input
                            id="username"
                            placeholder="请输入用户名"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <div className="flex gap-2">
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="请输入密码"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGeneratePassword}
                                className="flex-shrink-0"
                            >
                                随机生成
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">角色</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value: Role) =>
                                setFormData(prev => ({ ...prev, role: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择角色" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="superadmin">超级管理员</SelectItem>
                                <SelectItem value="admin">管理员</SelectItem>
                                <SelectItem value="author">作者</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="send-password"
                            checked={sendPassword}
                            onCheckedChange={setSendPassword}
                        />
                        <Label htmlFor="send-password">将密码发送至用户邮箱</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    创建中...
                                </>
                            ) : '创建'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 