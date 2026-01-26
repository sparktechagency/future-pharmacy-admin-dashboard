import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Blockquote from '@tiptap/extension-blockquote';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Upload as UploadIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  isEditing?: boolean; // Add this prop
}

// Remove the normalizeImageUrls function completely and use this simpler approach
const cleanHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;

  // Remove data-original-src attributes if they exist
  return htmlContent.replace(/data-original-src="[^"]+"/g, '');
};

export default function TiptapEditor({ content, onChange, isEditing }: TiptapEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ms-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ms-4',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'leading-relaxed',
          },
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 max-h-[400px]',
          loading: 'lazy',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 my-4 italic',
        },
      }),
      Heading.configure({
        levels: [2, 3],
        HTMLAttributes: {
          class: 'font-bold mt-4 mb-2',
        },
      }),
    ],
    content: cleanHtmlContent(content),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 h-full overflow-y-auto',
      },
    },
    onUpdate: ({ editor }) => {
      const htmlString = editor.getHTML();
      onChange(htmlString);
    },
    immediatelyRender: false,
  });

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image size should be less than 2MB for better performance');
      return;
    }

    setIsUploading(true);
    try {
      // Convert image to base64
      const base64String = await convertImageToBase64(file);

      // Insert the base64 image at the current cursor position
      editor?.chain().focus().setImage({
        src: base64String,
        alt: 'blog image',
        title: file.name
      }).run();

      toast.success('Image added successfully!');
    } catch (error: any) {
      toast.error('Failed to process image');
      console.error('Image conversion error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };

    input.click();
  };

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if content is different
      // Use setTimeout to ensure editor is ready
      setTimeout(() => {
        editor.commands.setContent(cleanHtmlContent(content));
      }, 100);
    }
  }, [content, editor]);

  if (!isClient || !editor) {
    return (
      <div className="border rounded-md min-h-[300px] h-[300px] flex items-center justify-center text-gray-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-white flex flex-col h-[400px]">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        {/* Basic formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <Italic className="w-4 h-4" />
        </Button>

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        {/* Blockquote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') ? 'bg-gray-200' : '', 'min-w-10')}
        >
          <Quote className="w-4 h-4" />
        </Button>

        {/* Image Upload */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={triggerImageUpload}
          disabled={isUploading}
          className="min-w-10"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UploadIcon className="w-4 h-4" />
          )}
        </Button>
      </div>
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      <div className="px-4 py-2 border-t text-xs text-gray-500 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <p>Supported: Headings (H2, H3), Bold, Italic, Lists, Blockquotes</p>
            <p>Images are stored directly in HTML as base64 strings</p>
          </div>
          {isEditing && (
            <div className="text-right">
              <p className="text-green-600 font-semibold">✓ Editing existing blog</p>
              <p className="text-amber-600">Existing images are preserved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}