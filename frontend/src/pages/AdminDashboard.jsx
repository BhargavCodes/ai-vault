import { useState, useEffect } from 'react';
import api from '../api';
import {
  Trash2, Shield, ShieldAlert, Search, User, ArrowLeft,
  Mail, Calendar, Users, X, ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
    role === 'admin'
      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }`}>
    {role === 'admin' ? <Shield size={9} /> : <User size={9} />}
    {role}
  </span>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100');
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user and all their files?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted.');
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.put(`/auth/assign-role/${user.id}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role.');
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="min-h-[80vh]">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-white leading-none flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-400" />
              Admin Console
            </h1>
            <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Manage users and permissions</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/8 border-indigo-500/15' },
          { label: 'Admins', value: adminCount, icon: Shield, color: 'text-violet-400', bg: 'bg-violet-500/8 border-violet-500/15' },
          { label: 'Regular Users', value: users.length - adminCount, icon: User, color: 'text-sky-400', bg: 'bg-sky-500/8 border-sky-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
            className="rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-card p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${bg} shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-zinc-900 dark:text-white leading-none">{value}</p>
              <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.08] shadow-light-card dark:shadow-card overflow-hidden"
      >
        {/* Table toolbar */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl
                bg-zinc-100/80 dark:bg-white/[0.04]
                border border-zinc-200/60 dark:border-white/[0.06]
                text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X size={12} />
              </button>
            )}
          </div>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 shrink-0">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/[0.06]">
                {['User', 'Date of Birth', 'Role', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 ${i === 3 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100/50 dark:border-white/[0.04]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.04] animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-zinc-100 dark:bg-white/[0.04] rounded animate-pulse" />
                          <div className="h-2.5 w-32 bg-zinc-100 dark:bg-white/[0.03] rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    {[...Array(3)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 w-16 bg-zinc-100 dark:bg-white/[0.04] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={28} className="text-zinc-300 dark:text-zinc-700" />
                      <p className="font-mono text-sm text-zinc-400 dark:text-zinc-600">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="border-b border-zinc-100/50 dark:border-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* User identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-white/10 dark:border-white/[0.06] flex items-center justify-center shrink-0">
                            {u.profile_picture ? (
                              <img src={u.profile_picture} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                              <span className="font-mono text-[10px] font-bold text-indigo-400">
                                {(u.full_name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-display font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">{u.full_name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Mail size={10} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                              <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 truncate">{u.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DOB */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-zinc-400 dark:text-zinc-600" />
                          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{u.dob || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleRole(u)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg
                              text-zinc-400 dark:text-zinc-600
                              hover:text-violet-500 dark:hover:text-violet-400
                              hover:bg-violet-500/10 dark:hover:bg-violet-500/8
                              transition-all opacity-0 group-hover:opacity-100"
                            title="Toggle role"
                          >
                            <ShieldCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg
                              text-zinc-400 dark:text-zinc-600
                              hover:text-rose-500 dark:hover:text-rose-400
                              hover:bg-rose-500/10 dark:hover:bg-rose-500/8
                              transition-all opacity-0 group-hover:opacity-100"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
