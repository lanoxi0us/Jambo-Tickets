import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/formatters'

const ROLE_BADGE = {
  ADMIN: 'bg-crimson/10 text-crimson',
  ORGANISER: 'bg-blue-100 text-blue-700',
  USER: 'bg-gray-100 text-gray-600',
}

export default function AdminUsers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => api.get('/users', { params: { page, limit: 20, search, role: roleFilter } }).then(r => r.data.data),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.put(`/users/${id}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Role updated.') },
    onError: () => toast.error('Failed to update role.'),
  })

  const suspendMutation = useMutation({
    mutationFn: (id) => api.put(`/users/${id}/suspend`),
    onSuccess: (res) => { qc.invalidateQueries(['admin-users']); toast.success(res.data.message) },
    onError: () => toast.error('Failed to update user.'),
  })

  return (
    <>
      <Helmet><title>Users — Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Users</h1>
          <p className="text-text-secondary text-sm mt-0.5">Manage platform users and roles</p>
        </div>

        <div className="card p-4 flex flex-wrap gap-3">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name or email..." className="input-field max-w-xs" />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="input-field w-36">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ORGANISER">Organiser</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data?.users?.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-sm flex-shrink-0">{user.fullName[0]}</div>
                          <div>
                            <p className="font-semibold text-navy">{user.fullName}</p>
                            <p className="text-xs text-text-secondary">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={e => roleMutation.mutate({ id: user.id, role: e.target.value })}
                          className={`badge text-xs border-0 cursor-pointer focus:outline-none ${ROLE_BADGE[user.role]}`}
                        >
                          <option value="USER">USER</option>
                          <option value="ORGANISER">ORGANISER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => suspendMutation.mutate(user.id)}
                          className={`text-xs font-medium hover:underline ${user.isActive ? 'text-crimson' : 'text-success'}`}
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-sm text-text-secondary">Page {page} of {data.totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
