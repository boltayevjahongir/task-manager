import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { tasksApi } from '../api/tasks';
import { usersApi } from '../api/users';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import { HiOutlinePlus } from 'react-icons/hi';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const isAdmin = user?.role === 'admin';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, per_page: 20 };
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );
      const { data } = await tasksApi.getAll(params);
      setTasks(data.items);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await usersApi.getDevelopers();
      setDevelopers(data);
    } catch (error) {
      console.error('Error fetching developers:', error);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleCreateTask = async (data) => {
    try {
      await tasksApi.create(data);
      toast.success('Vazifa yaratildi');
      fetchTasks();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vazifalar</h1>
          <p className="text-sm text-gray-500 mt-1">Jami: {pagination.total}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Yangi vazifa
          </button>
        )}
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        developers={isAdmin ? developers : []}
      />

      {loading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="Vazifalar topilmadi"
          description={isAdmin ? "Yangi vazifa yarating" : "Sizga biriktirilgan vazifalar yo'q"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-600">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <TaskForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateTask}
          developers={developers}
        />
      )}
    </div>
  );
}
