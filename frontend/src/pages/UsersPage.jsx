import { useState, useEffect } from 'react';
import { usersApi } from '../api/users';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import UserCard from '../components/users/UserCard';
import PendingUsers from '../components/users/PendingUsers';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const fetchUsers = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        usersApi.getAll(),
        usersApi.getPending(),
      ]);
      setUsers(allRes.data.items);
      setPendingUsers(pendingRes.data.items);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await usersApi.approve(userId);
      toast.success('Foydalanuvchi tasdiqlandi');
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleReject = async (userId) => {
    try {
      await usersApi.reject(userId);
      toast.success('Foydalanuvchi rad etildi');
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Foydalanuvchilar</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            tab === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Barchasi ({users.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            tab === 'pending' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Kutilmoqda ({pendingUsers.length})
        </button>
      </div>

      {tab === 'all' ? (
        users.length === 0 ? (
          <EmptyState title="Foydalanuvchilar yo'q" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        )
      ) : (
        <PendingUsers
          users={pendingUsers}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
