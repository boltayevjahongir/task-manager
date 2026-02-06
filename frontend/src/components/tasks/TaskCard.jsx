import { Link } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import Avatar from '../common/Avatar';
import { formatDate, isOverdue } from '../../utils/helpers';
import { HiOutlineChatAlt2, HiOutlineClock } from 'react-icons/hi';

export default function TaskCard({ task }) {
  const overdue = isOverdue(task.deadline) && task.status !== 'done';

  return (
    <Link
      to={`/tasks/${task.id}`}
      className={`block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition ${
        overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
          {task.title}
        </h3>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <TaskStatusBadge status={task.status} />

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task.deadline && (
            <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
              <HiOutlineClock className="w-3.5 h-3.5" />
              {formatDate(task.deadline)}
            </span>
          )}
          {task.comments_count > 0 && (
            <span className="flex items-center gap-1">
              <HiOutlineChatAlt2 className="w-3.5 h-3.5" />
              {task.comments_count}
            </span>
          )}
        </div>
      </div>

      {task.assignee && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Avatar name={task.assignee.full_name} size="sm" />
          <span className="text-xs text-gray-600">{task.assignee.full_name}</span>
        </div>
      )}
    </Link>
  );
}
