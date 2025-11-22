import { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, Shield, ShieldAlert, Search, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100');
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure? This will delete the user and ALL their files.")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success("User deleted.");
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.put(`/auth/assign-role/${user.id}`, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error("Failed to update role.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                {/* 👇 FIX: Points to Dashboard instead of Landing Page */}
                <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition dark:text-gray-300 dark:hover:bg-gray-700">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 dark:text-white">
                        <ShieldAlert className="text-red-600 dark:text-red-500" /> Admin Console
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage system users and permissions</p>
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* Stats / Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 w-full md:w-auto dark:bg-gray-800 dark:border-gray-700">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <User size={24} />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{users.length}</p>
                </div>
            </div>

            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-700"
                />
            </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">User ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                                {u.profile_picture ? (
                                                    <img src={u.profile_picture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-gray-400 dark:text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Age: {u.age}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono dark:text-gray-400">#{u.id}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => toggleRole(u)}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition dark:hover:bg-purple-900/20 dark:hover:text-purple-300"
                                                title="Toggle Role"
                                            >
                                                <Shield size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(u.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;