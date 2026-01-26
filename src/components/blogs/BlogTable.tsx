import { Blog } from '../../utils/blogs';
import BlogCard from './BlogCard';


interface BlogTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export default function BlogTable({ blogs, onEdit, onDelete }: BlogTableProps) {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No blogs found. Create your first blog!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard
          key={blog._id}
          blog={blog}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}