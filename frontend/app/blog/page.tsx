'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchBlogPosts, BlogPost } from '@/services/blogService';

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const posts = await fetchBlogPosts('published');
        setArticles(posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute unique categories
  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filteredArticles = filter === 'All' ? articles : articles.filter((a) => a.category === filter);

  return (
    <main className="bg-white text-slate-900 min-h-screen">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-8 py-28 text-center">
        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Carbon Knowledge Hub
        </p>
        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Education for Sustainable Climate Wealth
        </h1>
        <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
          Empowering farmers, NGOs, enterprises, and climate innovators
          through actionable carbon intelligence.
        </p>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-8 mb-14 flex flex-wrap gap-4 justify-center">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setFilter(category as string)}
            className={`rounded-full border px-6 py-3 text-sm font-medium transition ${
              filter === category
                ? 'bg-green-700 text-white border-green-700'
                : 'border-slate-300 text-slate-600 hover:border-green-700 hover:text-green-700'
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Articles */}
      <section className="max-w-7xl mx-auto px-8 pb-28">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <p className="text-xl">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="rounded-[2rem] bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                {article.thumbnail ? (
                  <div
                    className="h-52 bg-cover bg-center"
                    style={{ backgroundImage: `url(${article.thumbnail})` }}
                  ></div>
                ) : (
                  <div className="h-52 bg-gradient-to-br from-green-100 via-emerald-50 to-slate-100"></div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  {article.category && (
                    <div>
                      <span className="inline-block rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium mb-5">
                        {article.category}
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold leading-snug mb-4 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                    {article.content}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-block text-green-700 font-semibold hover:underline"
                    >
                      Read Article →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}