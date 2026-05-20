import { apiClient, parseApiError } from '@/lib/api';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  thumbnail: string | null;
  status: string;
  category: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostCreate {
  title: string;
  content: string;
  thumbnail?: string | null;
  status?: string;
  category?: string | null;
}

export async function fetchBlogPosts(status?: string): Promise<BlogPost[]> {
  try {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/blog', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch blog posts.'));
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost> {
  try {
    const response = await apiClient.get(`/api/blog/${slug}`);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to fetch blog post.'));
  }
}

export async function createBlogPost(data: BlogPostCreate): Promise<BlogPost> {
  try {
    const response = await apiClient.post('/api/blog', data);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to create blog post.'));
  }
}

export async function updateBlogPost(id: string, data: Partial<BlogPostCreate>): Promise<BlogPost> {
  try {
    const response = await apiClient.put(`/api/blog/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to update blog post.'));
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/blog/${id}`);
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data?.detail, 'Failed to delete blog post.'));
  }
}
