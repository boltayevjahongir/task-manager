import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/helpers';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function PendingUsers({ users, onApprove, onReject }) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="Kutilayotgan foydalanuvchilar yo'q"
        description="Barcha arizalar ko'rib chiqilgan"
      />
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Avatar name={user.full_name} size="lg" />
            <div>
              <p className="font-medium text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">
                Ariza: {formatDate(user.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove(user.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition"
            >
              <HiOutlineCheck className="w-4 h-4" />
              Tasdiqlash
            </button>
            <button
              onClick={() => onReject(user.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition"
            >
              <HiOutlineX className="w-4 h-4" />
              Rad etish
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
