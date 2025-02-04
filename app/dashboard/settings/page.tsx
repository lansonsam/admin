'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getAuth } from '@/lib/auth';
import { Loader2, Edit2, Eye, EyeOff, SettingsIcon } from "lucide-react";
import { toast, Toaster } from 'sonner';
import { request } from '@/lib/request';

interface SystemSetting {
    key: string;
    value: string | null;
    description: string;
    is_editable: boolean;
    id: number;
    created_at: string;
    updated_at: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showValue, setShowValue] = useState<Record<number, boolean>>({});
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [emailSettings, setEmailSettings] = useState({
        mail_username: '',
        mail_password: '',
        mail_from: '',
        mail_server: '',
        mail_port: 465,
        mail_tls: false,
        mail_ssl: true,
        mail_use_credentials: true,
        mail_validate_certs: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await request('/auth/system/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data.items);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (setting: SystemSetting) => {
        setEditingSetting(setting);
        setEditValue(setting.value || '');
    };

    const handleSaveEdit = async () => {
        if (!editingSetting) return;

        setSaving(true);
        try {
            if (editingSetting.key === 'SYSTEM_NAME') {
                const response = await request('/auth/system/name', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        system_name: editValue
                    })
                });

                if (!response.ok) {
                    throw new Error('更新失败');
                }
            } else {
                // TODO: 实现其他设置的保存API调用
                await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟保存
            }

            setSettings(settings.map(setting =>
                setting.id === editingSetting.id ? { ...setting, value: editValue } : setting
            ));
            setEditingSetting(null);
            toast.success('设置已更新');
        } catch (error) {
            toast.error('保存失败');
            console.error('Failed to save setting:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEmailSettings = async () => {
        setSaving(true);
        try {
            const response = await request('/auth/system/email', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailSettings)
            });

            if (response.ok) {
                toast.success('邮件设置已更新');
                setShowEmailDialog(false);
                fetchSettings(); // 刷新设置列表
            } else {
                throw new Error('更新失败');
            }
        } catch (error) {
            toast.error('保存失败');
            console.error('Failed to save email settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        toast.success('测试邮件已发送');
    };

    const isSensitive = (key: string) => {
        return key.includes('PASSWORD') ||
            key.includes('TOKEN') ||
            key.includes('SECRET') ||
            key.includes('KEY') ||
            key === 'INSTALLED' ||
            key === 'DB_VERSION' ||
            key === 'ADMIN_EMAIL' ||
            key === 'DEFAULT_ROLE';
    };

    const isBoolean = (key: string) => {
        return key.includes('SSL') ||
            key.includes('TLS') ||
            key.includes('VALIDATE') ||
            key.includes('USE_CREDENTIALS');
    };

    const displayValue = (setting: SystemSetting) => {
        if (!setting.value) return '';
        if (isSensitive(setting.key)) {
            return '';
        }
        if (isBoolean(setting.key)) {
            return setting.value === 'True' ? '是' : '否';
        }
        return setting.value;
    };

    const toggleValueVisibility = (id: number) => {
        setShowValue(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const mailSettings = settings.filter(s => s.key.startsWith('MAIL_'));
    const systemSettings = settings.filter(s => !s.key.startsWith('MAIL_'));

    const renderSettingItem = (setting: SystemSetting) => {
        if (isSensitive(setting.key)) {
            return null; // 不渲染敏感信息项
        }

        const isMailSetting = setting.key.startsWith('MAIL_');
        const isToggleSetting = setting.key === 'MAIL_TLS' ||
            setting.key === 'MAIL_SSL' ||
            setting.key === 'MAIL_USE_CREDENTIALS' ||
            setting.key === 'MAIL_VALIDATE_CERTS';

        if (isToggleSetting) {
            return null; // 不在这里渲染开关设置
        }

        return (
            <div key={setting.id} className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="text-sm font-medium">
                        {setting.description}
                    </Label>
                    {setting.is_editable && !isMailSetting && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(setting)}
                            className="h-8 w-8 hover:bg-muted"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="relative">
                    <Input
                        id={setting.key}
                        value={displayValue(setting)}
                        disabled={true}
                        className="bg-muted/50"
                        placeholder="未设置"
                    />
                </div>
            </div>
        );
    };

    const renderToggleSettings = () => {
        const toggleSettings = settings.filter(s =>
            s.key === 'MAIL_TLS' ||
            s.key === 'MAIL_SSL' ||
            s.key === 'MAIL_USE_CREDENTIALS' ||
            s.key === 'MAIL_VALIDATE_CERTS'
        );

        return (
            <div className="grid grid-cols-2 gap-4">
                {toggleSettings.map(setting => (
                    <div key={setting.id} className="flex items-center space-x-2">
                        <Switch
                            id={setting.key}
                            checked={setting.value === 'True'}
                            disabled={true}
                        />
                        <Label htmlFor={setting.key}>{setting.description}</Label>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Toaster
                position="top-right"
                expand={true}
                richColors
                closeButton
            />
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle>系统设置</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="system" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="system">基本设置</TabsTrigger>
                            <TabsTrigger value="mail">邮件设置</TabsTrigger>
                        </TabsList>

                        <TabsContent value="system" className="space-y-6">
                            <div className="grid gap-6">
                                {systemSettings.map(renderSettingItem)}
                            </div>
                        </TabsContent>

                        <TabsContent value="mail" className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">邮件服务器</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                配置系统的邮件服务器信息
                                            </p>
                                        </div>
                                        <Button onClick={() => setShowEmailDialog(true)}>
                                            修改邮件设置
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6">
                                        {mailSettings.map(renderSettingItem)}
                                        {renderToggleSettings()}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleTestEmail}
                                        className="w-full"
                                    >
                                        发送测试邮件
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>修改{editingSetting?.description}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="edit-value">{editingSetting?.description}</Label>
                        <Input
                            id="edit-value"
                            type={isSensitive(editingSetting?.key || '') ? 'password' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="mt-2"
                            placeholder={`请输入${editingSetting?.description}`}
                            autoComplete="off"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingSetting(null)}
                            disabled={saving}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    保存中...
                                </>
                            ) : '保存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>修改邮件设置</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mail_username">邮箱账号</Label>
                            <Input
                                id="mail_username"
                                value={emailSettings.mail_username}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, mail_username: e.target.value }))}
                                placeholder="请输入邮箱账号"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mail_password">邮箱密码</Label>
                            <Input
                                id="mail_password"
                                type="password"
                                value={emailSettings.mail_password}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, mail_password: e.target.value }))}
                                placeholder="请输入邮箱密码"
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mail_from">发件人地址</Label>
                            <Input
                                id="mail_from"
                                value={emailSettings.mail_from}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, mail_from: e.target.value }))}
                                placeholder="请输入发件人地址"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mail_server">SMTP服务器</Label>
                            <Input
                                id="mail_server"
                                value={emailSettings.mail_server}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, mail_server: e.target.value }))}
                                placeholder="请输入SMTP服务器地址"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mail_port">端口</Label>
                            <Input
                                id="mail_port"
                                type="number"
                                value={emailSettings.mail_port}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, mail_port: parseInt(e.target.value) }))}
                                placeholder="请输入端口号"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="mail_tls"
                                    checked={emailSettings.mail_tls}
                                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, mail_tls: checked }))}
                                />
                                <Label htmlFor="mail_tls">启用TLS</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="mail_ssl"
                                    checked={emailSettings.mail_ssl}
                                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, mail_ssl: checked }))}
                                />
                                <Label htmlFor="mail_ssl">启用SSL</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="mail_use_credentials"
                                    checked={emailSettings.mail_use_credentials}
                                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, mail_use_credentials: checked }))}
                                />
                                <Label htmlFor="mail_use_credentials">使用凭证</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="mail_validate_certs"
                                    checked={emailSettings.mail_validate_certs}
                                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, mail_validate_certs: checked }))}
                                />
                                <Label htmlFor="mail_validate_certs">验证证书</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleSaveEmailSettings}
                            disabled={saving}
                        >
                            {saving ? '保存中...' : '保存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 