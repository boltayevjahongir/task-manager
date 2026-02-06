import Avatar from '../common/Avatar';
import { USER_ROLE, USER_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export default function UserCard({ user }) {
  const roleInfo = USER_ROLE[user.role] || USER_ROLE.developer;
  const statusInfo = USER_STATUS[user.status] || USER_STATUS.pending;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={user.full_name} size="lg" />
        <div>
          <p className="font-medium text-gray-900">{user.full_name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
          {roleInfo.label}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-3">Ro'yxatdan o'tgan: {formatDate(user.created_at)}</p>
    </div>
  );
}
