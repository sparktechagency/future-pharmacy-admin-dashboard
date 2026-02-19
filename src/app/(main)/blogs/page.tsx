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
  const [currentPage, setCurrentPage] = useState(1);
  const { data: blogsData, isLoading, refetch } = useGetAllBlogsQuery(currentPage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const blogs = blogsData?.data?.data || [];
  const totalPages = blogsData?.meta?.totalPage || 1;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

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
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Blog Management</h1>
        <Button variant={"default"} onClick={handleCreateNew} className="bg-[#8E4585] w-full sm:w-auto">
          Create a New Blog
        </Button>
      </div>

      <BlogTable
        blogs={blogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-10 p-4 md:p-6 bg-white border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl shadow-sm">
          <div className="text-xs md:text-sm text-gray-600 font-medium order-2 md:order-1">
            Showing page <span className="text-purple-600 font-bold">{currentPage}</span> of <span className="text-purple-600 font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2 order-1 md:order-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3 text-gray-500 hover:bg-gray-50 font-bold text-xs uppercase tracking-widest disabled:opacity-30"
            >
              Prev
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === '...' ? (
                    <span className="px-2 py-1 text-gray-300 text-xs">...</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={`h-9 w-9 p-0 text-xs font-bold transition-all ${currentPage === page
                        ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-purple-600'
                        }`}
                    >
                      {String(page).padStart(2, '0')}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-3 text-gray-500 hover:bg-gray-50 font-bold text-xs uppercase tracking-widest disabled:opacity-30"
            >
              Next
            </Button>
          </div>
        </div>
      )}

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