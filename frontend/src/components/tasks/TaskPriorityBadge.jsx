import { TASK_PRIORITY } from '../../utils/constants';

export default function TaskPriorityBadge({ priority }) {
  const info = TASK_PRIORITY[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
