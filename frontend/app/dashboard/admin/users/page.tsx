'use client';

import { useEffect, useState } from 'react';
import { fetchAllUsers, moderateUser, UserAdminResponse } from '@/services/adminService';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AdminUsersDashboard() {
  const { user, loading: authLoading } = useAuthGuard('admin');
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAllUsers()
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch((err) => setError(err.message || 'Failed to load users.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleModerate = async (userId: string, currentStatus: boolean) => {
    try {
      await moderateUser(userId, !currentStatus, "Admin moderation action");
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading users...</div>;
  }

  const verifiedUsersCount = users.filter(u => u.is_verified).length;
  const pendingUsersCount = users.length - verifiedUsersCount;

  return (
    <>
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-8">
        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Users</p>
          <h3 className="text-4xl font-bold mt-3">{users.length}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Verified</p>
          <h3 className="text-4xl font-bold mt-3">{verifiedUsersCount}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <h3 className="text-4xl font-bold mt-3">{pendingUsersCount}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Fraud Alerts</p>
          <h3 className="text-4xl font-bold mt-3">0</h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10">
        <h2 className="text-3xl font-bold mb-8">Platform Users</h2>
        <div className="space-y-6">
          {users.length === 0 ? (
            <p className="text-slate-500">No users found.</p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center"
              >
                <div>
                  <p className="text-xl font-semibold">{u.full_name}</p>
                  <p className="text-slate-600 mt-2 capitalize">{u.role}</p>
                  <p className="text-sm text-slate-400 mt-1">{u.email}</p>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <span className={`rounded-full px-4 py-2 text-sm font-medium ${u.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {u.is_verified ? 'Verified' : 'Pending'}
                  </span>

                  <button
                    onClick={() => handleModerate(u.id, u.is_active)}
                    className={`rounded-full px-6 py-3 font-semibold transition ${u.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                  >
                    {u.is_active ? 'Suspend User' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}