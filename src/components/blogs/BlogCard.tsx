import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { baseURL } from '../../utils/BaseURL';
import { Blog } from '../../utils/blogs';


interface BlogCardProps {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export default function BlogCard({ blog, onEdit, onDelete }: BlogCardProps) {
  console.log("blog :", blog);
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

  const getProcessedDescription = (html: string) => {
    if (!html) return "";

    // Replace images with [Image]
    let text = html.replace(/<img[^>]*>/g, ' [Image] ');

    // Strip all remaining HTML tags
    text = text.replace(/<[^>]*>/g, ' ');

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    const words = text.split(' ');
    if (words.length > 20) {
      return words.slice(0, 20).join(' ') + '...';
    }
    return text;
  };

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 p-0 h-[350px] flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col h-full transition-all duration-300 ${isHovered ? 'blur-sm' : ''}`}>
        <div className="relative h-48 w-full overflow-hidden shrink-0">
          {
            blog.image !== "null" ? (
              <Image
                src={getImageUrl(blog.image)}
                width={1000}
                height={1000}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No Image</p>
              </div>
            )
          }
        </div>
        <CardContent className="p-4 flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-gray-500">Created: {formatCreatedAt(blog.createdAt)}</p>
            <p className="text-xs text-gray-500 font-medium">{blog.blogLikes?.length || 0} Likes</p>
          </div>
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 h-14">{blog.title}</h3>
          <p className="text-sm text-gray-600 overflow-hidden text-pretty">
            {getProcessedDescription(blog.description)}
          </p>
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