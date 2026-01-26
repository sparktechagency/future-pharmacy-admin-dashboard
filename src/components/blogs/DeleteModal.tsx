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
import { Loader2, Trash2 } from 'lucide-react';

import { toast } from 'react-hot-toast';

import { useDeleteBlogMutation } from '../../features/blog/blogApi';
import { Blog } from '../../utils/blogs';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
  onSuccess: () => void;
}

export default function DeleteModal({ isOpen, onClose, blog, onSuccess }: DeleteModalProps) {
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const confirmDelete = async () => {
    if (!blog) return;

    try {
      await deleteBlog(blog._id).unwrap();
      toast.success('Blog deleted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete blog');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
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
  );
}