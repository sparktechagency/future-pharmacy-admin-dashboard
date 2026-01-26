"use client";

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import BlogTable from '../../../components/blogs/BlogTable';
import CreateEditModal from '../../../components/blogs/CreateEditModal';
import DeleteModal from '../../../components/blogs/DeleteModal';
import {
  useGetAllBlogsQuery,
} from '../../../features/blog/blogApi';
import { Blog } from '../../../utils/blogs';


export default function BlogManagementApp() {
  const { data: blogsData, isLoading, refetch } = useGetAllBlogsQuery({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const blogs = blogsData?.data?.data || [];

  const handleCreateNew = () => {
    setCurrentBlog(null);
    setIsModalOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsModalOpen(true);
  };

  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog);
    setIsDeleteDialogOpen(true);
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

      <BlogTable
        blogs={blogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBlog={currentBlog}
        onSuccess={() => {
          refetch();
          setIsModalOpen(false);
        }}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        blog={blogToDelete}
        onSuccess={() => {
          refetch();
          setIsDeleteDialogOpen(false);
          setBlogToDelete(null);
        }}
      />
    </div>
  );
}