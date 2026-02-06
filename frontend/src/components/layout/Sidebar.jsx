import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineUsers, HiOutlineX } from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, adminOnly: true },
  { to: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList, adminOnly: false },
  { to: '/users', label: 'Foydalanuvchilar', icon: HiOutlineUsers, adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b">
        <h1 className="text-xl font-bold text-indigo-600">Task Manager</h1>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
          <HiOutlineX className="w-6 h-6" />
        </button>
      </div>

      <nav className="mt-6 px-3">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
