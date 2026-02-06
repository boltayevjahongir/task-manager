import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';

export default function TaskFilters({ filters, onChange, developers = [] }) {
  const handleChange = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value || undefined });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Qidirish..."
        value={filters.search || ''}
        onChange={handleChange('search')}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
      />

      <select
        value={filters.status || ''}
        onChange={handleChange('status')}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Barcha statuslar</option>
        {Object.entries(TASK_STATUS).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <select
        value={filters.priority || ''}
        onChange={handleChange('priority')}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Barcha prioritetlar</option>
        {Object.entries(TASK_PRIORITY).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      {developers.length > 0 && (
        <select
          value={filters.assigned_to || ''}
          onChange={handleChange('assigned_to')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Barcha developerlar</option>
          {developers.map((dev) => (
            <option key={dev.id} value={dev.id}>{dev.full_name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
