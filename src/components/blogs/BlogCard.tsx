import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { baseURL } from '../../utils/BaseURL';
import { Blog } from '../../utils/blogs';


interface BlogCardProps {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export default function BlogCard({ blog, onEdit, onDelete }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${baseURL}/${imagePath.replace(/\\/g, '/')}`;
  };

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
        <img
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
}