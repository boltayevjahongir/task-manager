import { HiOutlineClipboardList, HiOutlineClock, HiOutlineEye, HiOutlineExclamation } from 'react-icons/hi';

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Jami vazifalar',
      value: stats.total_tasks,
      icon: HiOutlineClipboardList,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Jarayonda',
      value: stats.by_status?.in_progress || 0,
      icon: HiOutlineClock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Tekshiruvda',
      value: stats.by_status?.review || 0,
      icon: HiOutlineEye,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: "Muddati o'tgan",
      value: stats.overdue_count,
      icon: HiOutlineExclamation,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
