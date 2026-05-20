'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, BlogPost } from '@/services/blogService';

export default function BlogCMSPage() {
  const { user, loading: authLoading } = useAuthGuard('admin');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thumbnail: '',
    category: '',
    status: 'draft',
  });

  const loadPosts = async () => {
    try {
      const data = await fetchBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateBlogPost(isEditing, formData);
      } else {
        await createBlogPost(formData);
      }
      setFormData({ title: '', content: '', thumbnail: '', category: '', status: 'draft' });
      setIsEditing(null);
      await loadPosts();
    } catch (err) {
      alert('Error saving post.');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setIsEditing(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail || '',
      category: post.category || '',
      status: post.status,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteBlogPost(id);
        await loadPosts();
      } catch (err) {
        alert('Error deleting post.');
      }
    }
  };

  if (authLoading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Form Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Blog Post' : 'Create New Post'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Title</label>
              <input
                required
                type="text"
                className="w-full border border-slate-300 rounded-lg p-3"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">Category</label>
              <input
                required
                type="text"
                className="w-full border border-slate-300 rounded-lg p-3"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Thumbnail URL</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-3"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Content</label>
            <textarea
              required
              rows={8}
              className="w-full border border-slate-300 rounded-lg p-3"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Status:</label>
              <select
                className="border border-slate-300 rounded-lg p-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-4">
              {isEditing && (
                <button
                  type="button"
                  className="px-6 py-3 rounded-full border border-slate-300 font-medium"
                  onClick={() => {
                    setIsEditing(null);
                    setFormData({ title: '', content: '', thumbnail: '', category: '', status: 'draft' });
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-green-700 text-white font-medium hover:bg-green-800"
              >
                {isEditing ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-2xl font-bold mb-6">Manage Blog Posts</h2>
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-slate-500">No blog posts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Title</th>
                  <th className="p-4 font-semibold text-slate-600">Category</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{post.title}</td>
                    <td className="p-4 text-slate-600">{post.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="p-4 space-x-3">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
