import { useAuth } from '../../hooks/useAuth';
import { HiOutlineMenu, HiOutlineLogout } from 'react-icons/hi';
import { USER_ROLE } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  const roleInfo = USER_ROLE[user?.role] || USER_ROLE.developer;

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <HiOutlineMenu className="w-6 h-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
            {getInitials(user?.full_name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          title="Chiqish"
        >
          <HiOutlineLogout className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
