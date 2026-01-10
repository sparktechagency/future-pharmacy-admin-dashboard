"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { format, parse } from 'date-fns';
import { Bold, Calendar as CalendarIcon, Edit, Italic, List, ListOrdered, Loader2, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  useCreateBlogMutation,
  useDeleteBlogMutation,
  useGetAllBlogsQuery,
  useUpdateBlogMutation
} from '../../../features/blog/blogApi';
import { baseURL } from '../../../utils/BaseURL';
import { RTKError } from '../../../utils/types';

// Types
interface Blog {
  _id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  createdAt: string;
  blogLikes?: string[];
}

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

interface BlogCardProps {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

// Helper function to parse date from your custom format
const parseCustomDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;

  try {
    // Try to parse from your custom format "MM--dd-yyyy"
    if (dateString.includes('--')) {
      const parts = dateString.split('--');
      if (parts.length === 3) {
        const [month, day, year] = parts;
        // Create date string in format that Date can parse: "yyyy-MM-dd"
        const standardDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const date = new Date(standardDateStr);
        return isNaN(date.getTime()) ? undefined : date;
      }
    }

    // Try parsing with date-fns if it's a different format
    const possibleFormats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'dd-MM-yyyy',
      'MM--dd-yyyy'
    ];

    for (const fmt of possibleFormats) {
      try {
        const parsed = parse(dateString, fmt, new Date());
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    // Last resort: try native Date parsing
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return undefined;
  }
};

// Tiptap Editor Component
const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const [isClient, setIsClient] = useState(false);

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
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 h-full overflow-y-auto',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!isClient || !editor) {
    return (
      <div className="border rounded-md min-h-[300px] h-[300px] flex items-center justify-center text-gray-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-white flex flex-col h-[300px]">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            editor.isActive('bold') ? 'bg-gray-200' : '',
            'min-w-10'
          )}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            editor.isActive('italic') ? 'bg-gray-200' : '',
            'min-w-10'
          )}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            editor.isActive('bulletList') ? 'bg-gray-200' : '',
            'min-w-10'
          )}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            editor.isActive('orderedList') ? 'bg-gray-200' : '',
            'min-w-10'
          )}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto"
      />
    </div>
  );
};

// Blog Card Component
const BlogCard: React.FC<BlogCardProps> = ({ blog, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get image URL - handle both local and external images
  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${baseURL}/${imagePath.replace(/\\/g, '/')}`;
  };

  // Line 233: যেখানে any type ছিল
  function formatCreatedAt(dateStr: string) {
    const date = new Date(dateStr);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }


  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`transition-all duration-300 ${isHovered ? 'blur-sm' : ''}`}>
        <Image
          src={getImageUrl(blog.image) || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
          alt={blog.title}
          height={1000}
          width={1000}
          className="w-full h-48 object-cover"
        />
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 mb-1">Created: {formatCreatedAt(blog.createdAt)}</p>
          <p className="text-sm text-gray-500 mb-1">{blog.blogLikes?.length} Likes</p>
          <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
          <div
            className="text-sm text-gray-600 line-clamp-2 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />
        </CardContent>
      </div>

      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/20">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full w-12 h-12"
            onClick={() => onEdit(blog)}
          >
            <Edit className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="rounded-full w-12 h-12"
            onClick={() => onDelete(blog)}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      )}
    </Card>
  );
};

// Main Blog Management App
export default function BlogManagementApp() {
  // API Hooks
  const { data: blogsData, isLoading, refetch } = useGetAllBlogsQuery({});
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  console.log("image file", imageFile)
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const blogs = blogsData?.data?.data || [];

  console.log(blogs)

  useEffect(() => {
    if (currentBlog && isModalOpen) {
      const parsedDate = parseCustomDate(currentBlog.date);
      if (parsedDate) {
        setDate(parsedDate);
      }
    }
  }, [currentBlog, isModalOpen]);





  const handleCreateNew = () => {
    setCurrentBlog(null);
    setTitle('');
    setDate(undefined);
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    console.log('Editing blog:', blog);
    setCurrentBlog(blog);
    setTitle(blog.title);

    const parsedDate = parseCustomDate(blog.date);
    if (parsedDate) {
      setDate(parsedDate);
    } else {
      setDate(undefined);
    }

    setDescription(blog.description);
    setImageFile(null);

    // Set preview to existing image
    let imageUrl = '';
    if (blog.image) {
      if (blog.image.startsWith('http')) {
        imageUrl = blog.image;
      } else {
        imageUrl = `${baseURL}/${blog.image.replace(/\\/g, '/')}`;
      }
    }
    setImagePreview(imageUrl);

    setIsModalOpen(true);
  };

  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (blogToDelete) {
      try {
        await deleteBlog(blogToDelete._id).unwrap();
        toast.success('Blog deleted successfully!');
        refetch();
      } catch (error: unknown) {
        const err = error as RTKError;
        toast.error(err?.data?.message || 'Failed to delete blog');
      }

    }
    setIsDeleteDialogOpen(false);
    setBlogToDelete(null);
  };

  // এই ফাংশনটি পরিবর্তন করা হয়েছে
  const handleSave = async () => {
    if (!title.trim() || !date || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (currentBlog) {
        // **সমাধান: ইমেজ ছাড়াই আপডেট করার জন্য JSON data পাঠানো**
        const updateData = {
          title: title.trim(),
          date: format(date, 'MM--dd-yyyy'),
          description: description.trim(),
        };

        // যদি নতুন ইমেজ থাকে, তাহলে FormData ব্যবহার করব
        if (imageFile) {
          const formData = new FormData();
          formData.append('title', title.trim());
          formData.append('date', format(date,'MM--dd-yyyy'));
          formData.append('description', description.trim());
          formData.append('image', imageFile);

          console.log('Updating with new image');
          await updateBlog({
            data: formData,
            id: currentBlog._id
          }).unwrap();
        } else {
          // যদি নতুন ইমেজ না থাকে, তাহলে শুধু JSON data পাঠাব
          console.log('Updating without image change');

          // আপনার API যদি JSON support করে
          await updateBlog({
            data: updateData,
            id: currentBlog._id
          }).unwrap();
        }

        toast.success('Blog updated successfully!');
      } else {
        // Create new blog - image is required
        if (!imageFile) {
          toast.error('Please upload an image for new blog');
          return;
        }

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('date', format(date, 'MM--dd-yyyy'));
        formData.append('description', description.trim());
        formData.append('image', imageFile);

        await createBlog(formData).unwrap();
        toast.success('Blog created successfully!');
      }

      refetch();
      setIsModalOpen(false);

      // Reset form
      setCurrentBlog(null);
      setTitle('');
      setDate(undefined);
      setDescription('');
      setImageFile(null);
      setImagePreview(null);

    } catch (error: unknown) {
      console.error('Save error details:', error);

      // আরও বিস্তারিত error message
      if (error && typeof error === 'object' && 'data' in error) {
        const err = error as { data?: unknown; status?: number; message?: string };
        console.log('Error data:', err.data);

        if (err.data && typeof err.data === 'object') {
          toast.error(`Error: ${JSON.stringify(err.data)}`);
        } else if (err.data) {
          toast.error(`Error: ${String(err.data)}`);
        } else if (err.status) {
          toast.error(`HTTP Error ${err.status}`);
        } else if (err.message) {
          toast.error(`Error: ${err.message}`);
        } else {
          toast.error('An unknown error occurred');
        }
      } else {
        toast.error('Failed to save blog. Please check console for details.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Button variant={"default"} onClick={handleCreateNew} className="bg-[#8E4585]">
          Create a New Blog
        </Button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No blogs found. Create your first blog!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: Blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex flex-col max-w-5xl w-full h-[90vh] max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{currentBlog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Blog Title *</Label>
              <Input
                id="title"
                placeholder="Enter your title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <TiptapEditor content={description} onChange={setDescription} />
              <p className="text-sm text-gray-500">
                Use the toolbar to format your text with bold, italic, bullet lists, and numbered lists.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Upload Image {!currentBlog && '*'}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={1000}
                      height={1000}
                      className="max-h-48 mx-auto rounded object-cover"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-purple-600" />
                    <p className="text-sm text-gray-600">
                      Drag and drop or click to upload (JPG or PNG, max 5MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Upload File
                    </Button>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {currentBlog && !imageFile && (
                <p className="text-sm text-green-600">
                  ✓ Keeping existing image
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave} // অথবা handleSaveAlternative ব্যবহার করতে পারেন
              className="bg-primary"
              disabled={
                !title.trim() ||
                !date ||
                !description.trim() ||
                isCreating ||
                isUpdating ||
                (!currentBlog && !imageFile)
              }
            >
              {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentBlog ? 'Update Blog' : 'Create Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl">Delete Blog?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:justify-center">
            <AlertDialogCancel
              className="flex-1 sm:flex-none bg-purple-100 text-primary hover:bg-purple-200"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="flex-1 sm:flex-none bg-primary"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}