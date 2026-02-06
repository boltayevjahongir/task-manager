export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {action && action}
    </div>
  );
}
