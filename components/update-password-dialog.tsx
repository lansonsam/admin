import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAdminPassword } from '@/lib/api';
import { generatePassword } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';

interface UpdatePasswordDialogProps {
    adminId: string;
    userName: string;
}

export function UpdatePasswordDialog({ adminId, userName }: UpdatePasswordDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateAdminPassword(adminId, { password });
            toast.success('密码已更新', {
                description: `用户 ${userName} 的密码已成功更新`,
                icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
                duration: 3000,
            });
            setOpen(false);
            setPassword('');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '更新密码失败';
            toast.error('更新密码失败', {
                description: errorMessage,
                icon: <XCircle className="w-4 h-4 text-red-500" />,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePassword = () => {
        setPassword(generatePassword());
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">修改密码</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>修改密码 - {userName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">新密码</Label>
                        <div className="flex gap-2">
                            <Input
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGeneratePassword}
                            >
                                随机
                            </Button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '更新中...' : '更新密码'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
} 