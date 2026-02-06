import { TASK_STATUS } from '../../utils/constants';

export default function TaskStatusBadge({ status }) {
  const info = TASK_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
