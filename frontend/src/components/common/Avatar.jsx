import { getInitials } from '../../utils/helpers';

const colors = [
  'bg-indigo-100 text-indigo-600',
  'bg-green-100 text-green-600',
  'bg-yellow-100 text-yellow-600',
  'bg-pink-100 text-pink-600',
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
];

export default function Avatar({ name, size = 'md' }) {
  const sizeClass = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div
      className={`${sizeClass} ${colors[colorIndex]} rounded-full flex items-center justify-center font-medium`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
