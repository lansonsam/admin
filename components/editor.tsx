'use client';

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { Mark, mergeAttributes } from '@tiptap/core'
import { FC, useState, useCallback, useEffect } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
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
    Minus,
    Loader2,
    X,
    Type,
    Palette,
    Eye,
    EyeOff,
} from 'lucide-react'
import { handleEditorImageUpload } from '@/lib/editor-upload'
import { toast } from 'sonner'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Editor, Mark as TiptapMark } from '@tiptap/core'
import { Commands } from '@tiptap/core'

declare global {
    interface Window {
        handleImageClick?: (src: string) => void;
    }
}

// 自定义图片扩展
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => element.getAttribute('width'),
                renderHTML: attributes => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                        style: 'display: block; margin: 0 auto;'
                    };
                },
            }
        };
    },
    addNodeView() {
        return ({ node, getPos, editor }) => {
            const dom = document.createElement('div');
            dom.classList.add('relative');
            dom.style.textAlign = 'center';

            const img = document.createElement('img');
            img.src = node.attrs.src;
            if (node.attrs.width) {
                img.style.width = node.attrs.width;
            }
            img.classList.add('max-w-full', 'rounded-lg', 'mx-auto');

            const menu = document.createElement('div');
            menu.classList.add(
                'absolute', 'top-0', 'left-1/2', '-translate-x-1/2', '-translate-y-[calc(100%+0.5rem)]',
                'bg-white', 'shadow-lg', 'rounded-lg', 'p-1', 'flex', 'gap-1', 'border',
                'hidden', 'z-10'
            );

            // 添加大小调整按钮
            const resizeButton = document.createElement('button');
            resizeButton.classList.add(
                'p-2', 'rounded-lg', 'hover:bg-gray-100', 'transition-colors',
                'flex', 'items-center', 'gap-1', 'text-sm'
            );
            resizeButton.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg><span>调整大小</span>';
            resizeButton.onclick = (e) => {
                e.stopPropagation();
                if (typeof getPos === 'function') {
                    const dialog = document.createElement('div');
                    dialog.classList.add(
                        'fixed', 'inset-0', 'bg-black/50', 'flex', 'items-center', 'justify-center', 'z-50'
                    );

                    const content = document.createElement('div');
                    content.classList.add(
                        'bg-white', 'rounded-lg', 'p-4', 'w-80', 'space-y-4'
                    );

                    const title = document.createElement('h3');
                    title.classList.add('text-lg', 'font-semibold');
                    title.textContent = '调整图片大小';

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = node.attrs.width || '';
                    input.placeholder = '例如: 300px 或 50%';
                    input.classList.add(
                        'w-full', 'px-3', 'py-2', 'border', 'rounded-md'
                    );

                    const buttonGroup = document.createElement('div');
                    buttonGroup.classList.add('flex', 'justify-end', 'gap-2', 'mt-4');

                    const cancelButton = document.createElement('button');
                    cancelButton.classList.add(
                        'px-4', 'py-2', 'rounded-md', 'border', 'hover:bg-gray-100'
                    );
                    cancelButton.textContent = '取消';
                    cancelButton.onclick = () => dialog.remove();

                    const confirmButton = document.createElement('button');
                    confirmButton.classList.add(
                        'px-4', 'py-2', 'rounded-md', 'bg-blue-500', 'text-white',
                        'hover:bg-blue-600'
                    );
                    confirmButton.textContent = '确定';
                    confirmButton.onclick = () => {
                        const width = input.value.trim();
                        if (width) {
                            editor.chain().focus().setNodeSelection(getPos()).updateAttributes('image', {
                                width,
                            }).run();
                        }
                        dialog.remove();
                    };

                    buttonGroup.appendChild(cancelButton);
                    buttonGroup.appendChild(confirmButton);

                    content.appendChild(title);
                    content.appendChild(input);
                    content.appendChild(buttonGroup);
                    dialog.appendChild(content);
                    document.body.appendChild(dialog);

                    input.focus();
                }
            };

            menu.appendChild(resizeButton);
            dom.appendChild(img);
            dom.appendChild(menu);

            // 点击图片时显示菜单
            let isMenuVisible = false;
            img.onclick = () => {
                if (!isMenuVisible) {
                    menu.classList.remove('hidden');
                    isMenuVisible = true;
                } else {
                    menu.classList.add('hidden');
                    isMenuVisible = false;
                }
            };

            // 点击其他地方时隐藏菜单
            document.addEventListener('click', (event) => {
                if (!dom.contains(event.target as Node) && isMenuVisible) {
                    menu.classList.add('hidden');
                    isMenuVisible = false;
                }
            });

            return {
                dom,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== 'image') return false;
                    img.src = updatedNode.attrs.src;
                    if (updatedNode.attrs.width) {
                        img.style.width = updatedNode.attrs.width;
                    }
                    return true;
                }
            };
        };
    }
});

// 修改隐藏文本扩展
const HiddenText = Mark.create({
    name: 'hidden',

    addAttributes() {
        return {
            hidden: {
                default: true,
                parseHTML: element => element.hasAttribute('data-hidden'),
                renderHTML: attributes => {
                    if (!attributes.hidden) {
                        return {}
                    }
                    return {
                        'data-hidden': '',
                        class: 'blur-sm hover:blur-none transition-all duration-300'
                    }
                }
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-hidden]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0]
    }
});

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

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    const [isUploading, setIsUploading] = useState(false);
    const [customColor, setCustomColor] = useState('#000000');
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#000000');

    const handleImageUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const url = await handleEditorImageUpload(file);

            // 先清除当前选区的格式
            editor?.chain()
                .focus()
                .unsetAllMarks() // 清除所有标记（如加粗、斜体等）
                .command(({ tr, dispatch }) => {
                    if (dispatch) {
                        // 创建新的段落节点
                        tr.insert(tr.selection.from, editor.schema.nodes.paragraph.create());
                        return true;
                    }
                    return false;
                })
                .setImage({ src: url })
                .insertContent({ type: 'paragraph' })
                .focus()
                .run();

            toast.success('图片上传成功');
        } catch (error) {
            toast.error('上传失败', {
                description: error instanceof Error ? error.message : '未知错误'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const adjustImageSize = () => {
        const node = editor.state.selection.$anchor.node();
        if (node.type.name === 'image') {
            const width = window.prompt('输入图片宽度 (例如: 300px 或 50%)', node.attrs.width || '');
            if (width) {
                editor.chain()
                    .updateAttributes('image', {
                        width,
                    })
                    .run();
            }
        }
    };

    const setColor = (color: string) => {
        editor.chain()
            .focus()
            .setColor(color)
            .run();
    };

    const toggleHidden = () => {
        editor.chain().focus().toggleMark('hidden').run()
    }

    return (
        <div className="border-b p-2 flex flex-wrap gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') && 'bg-accent')}
                title="加粗"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') && 'bg-accent')}
                title="斜体"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(editor.isActive('underline') && 'bg-accent')}
                title="下划线"
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(editor.isActive('strike') && 'bg-accent')}
                title="删除线"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border my-auto mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-accent')}
                title="左对齐"
            >
                <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-accent')}
                title="居中对齐"
            >
                <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-accent')}
                title="右对齐"
            >
                <AlignRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border my-auto mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive('heading', { level: 1 }) && 'bg-accent')}
                title="一级标题"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive('heading', { level: 2 }) && 'bg-accent')}
                title="二级标题"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border my-auto mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') && 'bg-accent')}
                title="无序列表"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') && 'bg-accent')}
                title="有序列表"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border my-auto mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive('blockquote') && 'bg-accent')}
                title="引用"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="分割线"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border my-auto mx-1" />
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleHidden}
                className={cn(editor.isActive('hidden') && 'bg-accent')}
                title="隐藏文本"
            >
                <EyeOff className="h-4 w-4" />
            </Button>

            {/* 文字颜色选择 */}
            <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="文字颜色"
                    >
                        <Palette className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-56 p-2"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="grid gap-2">
                        <div className="grid grid-cols-4 gap-1">
                            {TEXT_COLORS.map((color) => (
                                <Button
                                    key={color.value}
                                    variant="ghost"
                                    className={cn(
                                        "w-8 h-8 p-0",
                                        selectedColor === color.value && "ring-2 ring-primary"
                                    )}
                                    title={color.label}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedColor(color.value);
                                        setCustomColor(color.value);
                                    }}
                                    onPointerDown={(e) => e.preventDefault()}
                                >
                                    <div
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: color.value }}
                                    />
                                </Button>
                            ))}
                        </div>
                        <div className="w-full h-px bg-border my-1" />
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customColor}
                                className="w-24 h-8 px-2 border rounded"
                                placeholder="#000000"
                                onChange={(e) => {
                                    setCustomColor(e.target.value);
                                    setSelectedColor(e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.preventDefault()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setColor(selectedColor);
                                        setIsColorPickerOpen(false);
                                    }
                                }}
                            />
                            <input
                                type="color"
                                value={customColor}
                                className="w-8 h-8 p-0 cursor-pointer"
                                onChange={(e) => {
                                    e.preventDefault();
                                    const newColor = e.target.value;
                                    setCustomColor(newColor);
                                    setSelectedColor(newColor);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.preventDefault()}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setColor(selectedColor);
                                    setIsColorPickerOpen(false);
                                }}
                                onPointerDown={(e) => e.preventDefault()}
                            >
                                确定
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

interface TipTapEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    autoSave?: boolean;
}

const ImagePreview = ({ src, onClose }: { src: string; onClose: () => void }) => {
    if (!src) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative max-w-[90vw] max-h-[90vh]">
                <img
                    src={src}
                    alt="预览图片"
                    className="max-w-full max-h-[90vh] object-contain"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 bg-white hover:bg-gray-100"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const TipTapEditor: FC<TipTapEditorProps> = ({
    content = '',
    onChange,
    autoSave = true,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            CustomImage.configure({
                HTMLAttributes: {
                    class: 'group',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            HiddenText,
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);

            // 只在启用自动保存时保存内容
            if (autoSave) {
                localStorage.setItem('editor-content', html);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-2 [&_.ProseMirror-focused]:caret-primary [&_.ProseMirror-focused]:caret-[1px]',
            },
            handleDrop: (view, event, slice, moved) => {
                const handleDropAsync = async () => {
                    if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                        const file = event.dataTransfer.files[0];
                        if (file.type.startsWith('image/')) {
                            event.preventDefault();
                            try {
                                const url = await handleEditorImageUpload(file);
                                if (url) {
                                    const { schema } = view.state;
                                    const imageNode = schema.nodes.image.create({ src: url });
                                    const paragraphNode = schema.nodes.paragraph.create();
                                    const transaction = view.state.tr
                                        .replaceSelectionWith(imageNode)
                                        .insert(view.state.selection.from, paragraphNode)
                                        .scrollIntoView();
                                    view.dispatch(transaction);
                                    // 确保光标可见
                                    view.focus();
                                    toast.success('图片上传成功');
                                }
                            } catch (error) {
                                toast.error('上传失败', {
                                    description: error instanceof Error ? error.message : '未知错误'
                                });
                            }
                        }
                    }
                };
                handleDropAsync();
                return false;
            },
            handlePaste: (view, event, slice) => {
                const handlePasteAsync = async () => {
                    if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
                        const file = event.clipboardData.files[0];
                        if (file.type.startsWith('image/')) {
                            event.preventDefault();
                            try {
                                const url = await handleEditorImageUpload(file);
                                if (url) {
                                    const { schema } = view.state;
                                    const imageNode = schema.nodes.image.create({ src: url });
                                    const paragraphNode = schema.nodes.paragraph.create();
                                    const transaction = view.state.tr
                                        .replaceSelectionWith(imageNode)
                                        .insert(view.state.selection.from, paragraphNode)
                                        .scrollIntoView();
                                    view.dispatch(transaction);
                                    // 确保光标可见
                                    view.focus();
                                    toast.success('图片上传成功');
                                }
                            } catch (error) {
                                toast.error('上传失败', {
                                    description: error instanceof Error ? error.message : '未知错误'
                                });
                            }
                        }
                    }
                };
                handlePasteAsync();
                return false;
            },
        },
    });

    // 监听 content prop 的变化
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // 清除保存的内容
    const clearSavedContent = () => {
        localStorage.removeItem('editor-content');
    };

    // 在组件卸载时清除保存的内容
    useEffect(() => {
        return () => {
            if (autoSave) {
                clearSavedContent();
            }
        };
    }, [autoSave]);

    useEffect(() => {
        window.handleImageClick = (src: string) => {
            setPreviewImage(src);
        };
        return () => {
            delete window.handleImageClick;
        };
    }, []);

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            <MenuBar editor={editor} />
            <div className="relative">
                <EditorContent editor={editor} />
                {isUploading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>
            {previewImage && (
                <ImagePreview
                    src={previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    );
};

export default TipTapEditor 