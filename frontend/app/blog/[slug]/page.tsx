'use client';

import { useEffect, useState } from 'react';
import { fetchBlogPost, BlogPost } from '@/services/blogService';
import Link from 'next/link';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBlogPost(params.slug);
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load article.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Article Not Found</h1>
        <p className="text-slate-600 mb-8">{error}</p>
        <Link href="/blog" className="px-6 py-3 bg-green-700 text-white rounded-full font-semibold hover:bg-green-800 transition">
          Return to Blog
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white text-slate-900 min-h-screen">
      <article className="max-w-4xl mx-auto px-8 py-20">
        <Link href="/blog" className="text-green-700 font-semibold hover:underline mb-8 inline-block">
          ← Back to Blog
        </Link>
        
        {post.category && (
          <div className="mb-6">
            <span className="inline-block rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
              {post.category}
            </span>
          </div>
        )}

        <h1 className="text-5xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
          {post.title}
        </h1>

        <div className="text-slate-500 mb-12 flex items-center gap-4">
          <span>Published on {new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        {post.thumbnail && (
          <img src={post.thumbnail} alt={post.title} className="w-full h-[400px] object-cover rounded-[2rem] mb-12 shadow-md" />
        )}

        <div className="prose prose-lg prose-green max-w-none text-slate-700 whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </main>
  );
}
