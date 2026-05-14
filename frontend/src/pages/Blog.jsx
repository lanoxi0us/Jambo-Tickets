import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/formatters'

export default function Blog() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['blog', page],
    queryFn: () => api.get('/blog', { params: { page, limit: 9 } }).then(r => r.data.data),
  })

  const posts = data?.posts || []
  const totalPages = data?.totalPages || 1

  return (
    <>
      <Helmet><title>Blog — Jambo Tickets</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="text-center mb-12">
          <h1 className="section-heading mb-3">Stories & Insights</h1>
          <p className="text-text-secondary max-w-xl mx-auto">Event guides, ticketing tips, and Kenya's best entertainment coverage.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <p className="text-center text-text-secondary py-20">No posts yet.</p>
        ) : (
          <>
            {/* Featured first post */}
            {page === 1 && posts[0] && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-10">
                <Link to={`/blog/${posts[0].slug}`} className="group grid md:grid-cols-2 gap-0 card overflow-hidden hover:shadow-card-hover transition-all duration-200">
                  <div className="aspect-[4/3] md:aspect-auto bg-gray-100 overflow-hidden">
                    {posts[0].coverImage
                      ? <img src={posts[0].coverImage} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-gradient-to-br from-navy to-navy-dark" />
                    }
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="badge bg-crimson/10 text-crimson text-xs mb-4">Featured</span>
                    <h2 className="font-extrabold text-navy text-2xl leading-tight mb-3 group-hover:text-crimson transition-colors">{posts[0].title}</h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">{posts[0].excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {posts[0].author?.fullName?.[0]}
                      </div>
                      <span>{posts[0].author?.fullName}</span>
                      <span>·</span>
                      <span>{formatDate(posts[0].publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid of remaining */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(page === 1 ? posts.slice(1) : posts).map((post, i) => (
                <motion.div key={post.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.06 }}>
                  <Link to={`/blog/${post.slug}`} className="card group block hover:shadow-card-hover transition-all duration-200 h-full">
                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                      {post.coverImage
                        ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full bg-gradient-to-br from-navy/80 to-navy" />
                      }
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-navy text-base leading-tight mb-2 group-hover:text-crimson transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border">
                        <span>{post.author?.fullName}</span>
                        <span>{formatDate(post.publishedAt, { month:'short', day:'numeric', year:'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm text-text-secondary px-3">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
