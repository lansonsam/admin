declare module '@ckeditor/ckeditor5-react' {
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
    import { ReactNode } from 'react';

    interface CKEditorProps {
        editor: typeof ClassicEditor;
        data?: string;
        config?: any;
        onReady?: (editor: ClassicEditor) => void;
        onChange?: (event: any, editor: ClassicEditor) => void;
        onBlur?: (event: any, editor: ClassicEditor) => void;
        onFocus?: (event: any, editor: ClassicEditor) => void;
        onError?: (error: Error, details: { willEditorRestart: boolean }) => void;
        disabled?: boolean;
    }

    export const CKEditor: (props: CKEditorProps) => ReactNode;
}

declare module '@ckeditor/ckeditor5-build-classic' {
    const ClassicEditor: any;
    export = ClassicEditor;
} 