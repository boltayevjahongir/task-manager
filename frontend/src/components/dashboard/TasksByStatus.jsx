import { TASK_STATUS } from '../../utils/constants';

export default function TasksByStatus({ stats }) {
  const total = stats.total_tasks || 1;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status bo'yicha</h3>
      <div className="space-y-3">
        {Object.entries(TASK_STATUS).map(([key, info]) => {
          const count = stats.by_status?.[key] || 0;
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{info.label}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    key === 'new' ? 'bg-blue-500' :
                    key === 'in_progress' ? 'bg-yellow-500' :
                    key === 'review' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
