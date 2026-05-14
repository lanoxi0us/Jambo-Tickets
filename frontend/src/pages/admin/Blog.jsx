import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/formatters'

function BlogForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', excerpt: '', content: '', publish: false })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('coverImage', file)
      await onSave(fd)
    } finally { setSaving(false) }
  }

  return (
    <div className="card p-6">
      <h2 className="font-bold text-navy text-lg mb-5">{initial ? 'Edit Post' : 'New Blog Post'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" required placeholder="Post title" />
        </div>
        <div>
          <label className="label">Excerpt</label>
          <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Short description..." />
        </div>
        <div>
          <label className="label">Content (HTML)</label>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={10} className="input-field resize-y font-mono text-xs" placeholder="<p>Post content in HTML...</p>" />
        </div>
        <div>
          <label className="label">Cover Image</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="block text-sm text-text-secondary" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="publish" checked={form.publish} onChange={e => setForm(f => ({ ...f, publish: e.target.checked }))} className="w-4 h-4 accent-crimson" />
          <label htmlFor="publish" className="text-sm font-medium text-navy">Publish immediately</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? <><LoadingSpinner size="sm" color="white" /> Saving...</> : 'Save Post'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function AdminBlog() {
  const [editing, setEditing] = useState(null) // null = list, 'new' = new form, id = edit form
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => api.get('/blog/admin/all').then(r => r.data.data.posts),
  })

  const createMutation = useMutation({
    mutationFn: (fd) => api.post('/blog', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries(['admin-blog']); setEditing(null); toast.success('Post created.') },
    onError: () => toast.error('Failed to create post.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => api.put(`/blog/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries(['admin-blog']); setEditing(null); toast.success('Post updated.') },
    onError: () => toast.error('Failed to update post.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/blog/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-blog']); toast.success('Post deleted.') },
    onError: () => toast.error('Failed to delete.'),
  })

  const editPost = editing !== null && editing !== 'new' ? data?.find(p => p.id === editing) : null

  if (editing === 'new') {
    return <BlogForm onSave={(fd) => createMutation.mutateAsync(fd)} onCancel={() => setEditing(null)} />
  }
  if (editing && editPost) {
    return <BlogForm initial={{ title: editPost.title, excerpt: editPost.excerpt, content: editPost.content, publish: !!editPost.publishedAt }}
      onSave={(fd) => updateMutation.mutateAsync({ id: editPost.id, fd })} onCancel={() => setEditing(null)} />
  }

  return (
    <>
      <Helmet><title>Blog — Admin</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Blog Posts</h1>
            <p className="text-text-secondary text-sm mt-0.5">Manage platform blog content</p>
          </div>
          <button onClick={() => setEditing('new')} className="btn-primary text-sm">New Post</button>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-gray-50">
                <tr>
                  {['Title', 'Author', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy line-clamp-1">{post.title}</p>
                      <p className="text-xs text-text-secondary line-clamp-1">{post.excerpt}</p>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{post.author?.fullName}</td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${post.publishedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.publishedAt ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(post.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(post.id)} className="text-xs font-medium text-navy hover:underline">Edit</button>
                        <button onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(post.id) }} className="text-xs font-medium text-crimson hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
