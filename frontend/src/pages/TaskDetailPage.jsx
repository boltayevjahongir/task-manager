import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tasksApi } from '../api/tasks';
import { usersApi } from '../api/users';
import TaskStatusBadge from '../components/tasks/TaskStatusBadge';
import TaskPriorityBadge from '../components/tasks/TaskPriorityBadge';
import TaskForm from '../components/tasks/TaskForm';
import CommentSection from '../components/tasks/CommentSection';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Avatar from '../components/common/Avatar';
import Loading from '../components/common/Loading';
import { formatDateTime, isOverdue, getErrorMessage } from '../utils/helpers';
import { TASK_STATUS } from '../utils/constants';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchTask = async () => {
    try {
      const { data } = await tasksApi.getById(id);
      setTask(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      navigate('/tasks');
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
    fetchTask();
    fetchDevelopers();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await tasksApi.updateStatus(id, newStatus);
      setTask(data);
      toast.success('Status yangilandi');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdate = async (data) => {
    try {
      const { data: updated } = await tasksApi.update(id, data);
      setTask(updated);
      toast.success('Vazifa yangilandi');
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await tasksApi.delete(id);
      toast.success("Vazifa o'chirildi");
      navigate('/tasks');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return <Loading />;
  if (!task) return null;

  const overdue = isOverdue(task.deadline) && task.status !== 'done';

  // Determine available status transitions
  const getAvailableStatuses = () => {
    if (isAdmin) {
      return Object.keys(TASK_STATUS).filter((s) => s !== task.status);
    }
    const transitions = {
      new: ['in_progress'],
      in_progress: ['review'],
      review: ['in_progress'],
      done: [],
    };
    return transitions[task.status] || [];
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Vazifalar ro'yxatiga
      </button>

      {/* Task header */}
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${overdue ? 'border-red-300' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {overdue && (
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  Muddati o'tgan
                </span>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <HiOutlinePencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{task.description}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Yaratuvchi</p>
            <div className="flex items-center gap-2">
              <Avatar name={task.creator.full_name} size="sm" />
              <span className="text-sm">{task.creator.full_name}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Bajaruvchi</p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignee.full_name} size="sm" />
                <span className="text-sm">{task.assignee.full_name}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Biriktirilmagan</span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Muddat</p>
            <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : ''}`}>
              {task.deadline ? formatDateTime(task.deadline) : '—'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Yaratilgan</p>
            <span className="text-sm">{formatDateTime(task.created_at)}</span>
          </div>
        </div>

        {/* Status transition buttons */}
        {getAvailableStatuses().length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Statusni o'zgartirish:</p>
            <div className="flex flex-wrap gap-2">
              {getAvailableStatuses().map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {TASK_STATUS[status]?.label || status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
        <CommentSection taskId={id} />
      </div>

      {/* Edit form */}
      {isAdmin && (
        <TaskForm
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={handleUpdate}
          task={task}
          developers={developers}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Vazifani o'chirish"
        message="Haqiqatan ham bu vazifani o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        confirmText="O'chirish"
        danger
      />
    </div>
  );
}
