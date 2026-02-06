import { Link } from 'react-router-dom';
import TaskStatusBadge from '../tasks/TaskStatusBadge';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/helpers';

export default function OverdueTasks({ tasks }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-5">
      <h3 className="text-lg font-semibold text-red-600 mb-4">
        Muddati o'tgan vazifalar ({tasks.length})
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/tasks/${task.id}`}
            className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <TaskStatusBadge status={task.status} />
                <span className="text-xs text-red-600">
                  Muddat: {formatDate(task.deadline)}
                </span>
              </div>
            </div>
            {task.assignee && (
              <Avatar name={task.assignee.full_name} size="sm" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
