'use client';

import { FC, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Quote,
    Type,
    Palette,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { uploadImage } from '@/lib/upload';
import { toast } from 'sonner';

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const FONT_SIZES = [
    { label: '12px', value: '1' },
    { label: '14px', value: '2' },
    { label: '16px', value: '3' },
    { label: '18px', value: '4' },
    { label: '24px', value: '5' },
    { label: '32px', value: '6' },
    { label: '48px', value: '7' },
];

const TEXT_COLORS = [
    { label: '黑色', value: '#000000' },
    { label: '深灰', value: '#666666' },
    { label: '红色', value: '#EF4444' },
    { label: '黄色', value: '#F59E0B' },
    { label: '绿色', value: '#10B981' },
    { label: '蓝色', value: '#3B82F6' },
    { label: '紫色', value: '#8B5CF6' },
    { label: '粉色', value: '#EC4899' },
];

export function RichEditor({ value, onChange }: RichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // 执行编辑命令
    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    // 处理图片上传
    const handleImageUpload = async (file: File) => {
        if (!file) return;

        try {
            setIsUploading(true);
            const response = await uploadImage('/auth/admin/image/upload', file);
            const data = await response.json();

            if (!response.ok) {
                throw new Error('上传失败');
            }

            execCommand('insertImage', data.url);
            toast.success('图片上传成功');
        } catch (error) {
            toast.error('上传图片失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            <div className="border-b p-2 flex flex-wrap gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('bold')}
                    title="加粗"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('italic')}
                    title="斜体"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('underline')}
                    title="下划线"
                >
                    <Underline className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('strikeThrough')}
                    title="删除线"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border my-auto mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('justifyLeft')}
                    title="左对齐"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('justifyCenter')}
                    title="居中对齐"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('justifyRight')}
                    title="右对齐"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border my-auto mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('formatBlock', '<h1>')}
                    title="一级标题"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('formatBlock', '<h2>')}
                    title="二级标题"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border my-auto mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('insertUnorderedList')}
                    title="无序列表"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('insertOrderedList')}
                    title="有序列表"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border my-auto mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                handleImageUpload(file);
                            }
                        };
                        input.click();
                    }}
                    title="插入图片"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => execCommand('formatBlock', '<blockquote>')}
                    title="引用"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border my-auto mx-1" />

                {/* 字体大小选择 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            title="字体大小"
                        >
                            <Type className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                        <div className="grid gap-1">
                            {FONT_SIZES.map((size) => (
                                <Button
                                    key={size.value}
                                    variant="ghost"
                                    className="justify-start font-normal"
                                    onClick={() => execCommand('fontSize', size.value)}
                                >
                                    <span style={{ fontSize: size.label }}>{size.label}</span>
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* 文字颜色选择 */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            title="文字颜色"
                        >
                            <Palette className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                        <div className="grid gap-1">
                            {TEXT_COLORS.map((color) => (
                                <Button
                                    key={color.value}
                                    variant="ghost"
                                    className="justify-start font-normal"
                                    onClick={() => execCommand('foreColor', color.value)}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: color.value }}
                                        />
                                        {color.label}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div
                ref={editorRef}
                className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
                contentEditable
                dangerouslySetInnerHTML={{ __html: value }}
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onPaste={(e) => {
                    // 处理图片粘贴
                    const items = Array.from(e.clipboardData.items);
                    const imageItem = items.find(item => item.type.startsWith('image/'));
                    if (imageItem) {
                        e.preventDefault();
                        const file = imageItem.getAsFile();
                        if (file) {
                            handleImageUpload(file);
                        }
                    }
                }}
                onDrop={(e) => {
                    // 处理图片拖放
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    const imageFile = files.find(file => file.type.startsWith('image/'));
                    if (imageFile) {
                        handleImageUpload(imageFile);
                    }
                }}
            />
        </div>
    );
} 