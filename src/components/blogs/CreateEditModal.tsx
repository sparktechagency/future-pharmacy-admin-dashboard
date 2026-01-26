import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCreateBlogMutation, useUpdateBlogMutation } from '../../features/blog/blogApi';
import TipTapEditor from '../../TipTapEditor/TipTapEditor';
import { baseURL } from '../../utils/BaseURL';
import { Blog } from '../../utils/blogs';

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlog: Blog | null;
  onSuccess: () => void;
}

const parseCustomDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;

  try {
    if (dateString.includes('--')) {
      const parts = dateString.split('--');
      if (parts.length === 3) {
        const [month, day, year] = parts;
        const standardDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const date = new Date(standardDateStr);
        return isNaN(date.getTime()) ? undefined : date;
      }
    }

    const possibleFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd-MM-yyyy', 'MM--dd-yyyy'];
    for (const fmt of possibleFormats) {
      try {
        const parsed = parse(dateString, fmt, new Date());
        if (!isNaN(parsed.getTime())) return parsed;
      } catch {
        continue;
      }
    }

    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
};

export default function CreateEditModal({ isOpen, onClose, currentBlog, onSuccess }: CreateEditModalProps) {
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hasExistingImage, setHasExistingImage] = useState(false); // Track if blog has existing image

  useEffect(() => {
    if (currentBlog && isOpen) {
      setTitle(currentBlog.title);
      const parsedDate = parseCustomDate(currentBlog.date);
      setDate(parsedDate);
      setDescription(currentBlog.description);

      let imageUrl = '';
      if (currentBlog.image) {
        imageUrl = currentBlog.image.startsWith('http')
          ? currentBlog.image
          : `${baseURL}/${currentBlog.image.replace(/\\/g, '/')}`;
        setHasExistingImage(true);
      } else {
        setHasExistingImage(false);
      }
      setImagePreview(imageUrl);
      setImageFile(null); // Reset new image file
    } else {
      resetForm();
    }
  }, [currentBlog, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDate(undefined);
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setHasExistingImage(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add safety check for files
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    console.log("image file here:", file);
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
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

  const handleRemoveImage = () => {
    setImageFile(null);

    // If editing and has existing image, restore it
    if (currentBlog?.image) {
      const imageUrl = currentBlog.image.startsWith('http')
        ? currentBlog.image
        : `${baseURL}/${currentBlog.image.replace(/\\/g, '/')}`;
      setImagePreview(imageUrl);
      setHasExistingImage(true);
    } else {
      setImagePreview(null);
      setHasExistingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !date || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const formattedDate = format(date, 'MM--dd-yyyy');
      if (currentBlog) {
        // Update existing blog
        console.log("update blog here :");
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('date', formattedDate);
        formData.append('description', description.trim());
        if (imageFile) {
          formData.append('image', imageFile);
        }
        await updateBlog({
          data: formData,
          id: currentBlog._id
        }).unwrap();

        toast.success('Blog updated successfully!');
      } else {
        // Create new blog
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('date', formattedDate);
        formData.append('description', description.trim());
        formData.append('image', imageFile!);

        await createBlog(formData).unwrap();
        toast.success('Blog created successfully!');
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to save blog');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col w-full h-[90vh] max-h-[90vh] p-0">
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
                  className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
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
            <TipTapEditor
              content={description}
              onChange={setDescription}
              minHeight="300px"
              maxHeight="500px"
            />
            <p className="text-sm text-gray-500">
              Use the toolbar to format your text with bold, italic, bullet lists, and numbered lists.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Upload Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
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
                      onClick={handleRemoveImage}
                    >
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
            {currentBlog && !imageFile && hasExistingImage && (
              <p className="text-sm text-green-600">✓ Keeping existing image</p>
            )}
            {imageFile && (
              <p className="text-sm text-blue-600">✓ New image selected</p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isCreating || isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#9c4a8f]"
            disabled={!date || !title || !description}
          >
            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {currentBlog ? 'Update Blog' : 'Create Blog'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}