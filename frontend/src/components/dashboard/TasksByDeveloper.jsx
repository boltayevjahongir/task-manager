import Avatar from '../common/Avatar';

export default function TasksByDeveloper({ stats }) {
  const developers = stats.by_developer || [];

  if (developers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer bo'yicha</h3>
        <p className="text-sm text-gray-500">Ma'lumot yo'q</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer bo'yicha</h3>
      <div className="space-y-4">
        {developers.map((dev) => {
          const percentage = dev.total > 0 ? Math.round((dev.done / dev.total) * 100) : 0;

          return (
            <div key={dev.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Avatar name={dev.name} size="sm" />
                  <span className="text-sm text-gray-700">{dev.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {dev.done}/{dev.total} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
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
