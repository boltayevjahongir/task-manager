import { useState, useEffect } from 'react';
import { commentsApi } from '../../api/comments';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi';

export default function CommentSection({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const { data } = await commentsApi.getAll(taskId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await commentsApi.create(taskId, { text });
      setText('');
      await fetchComments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentsApi.delete(taskId, commentId);
      await fetchComments();
      toast.success("Komment o'chirildi");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Kommentlar ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar name={comment.author.full_name} size="md" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author.full_name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                {(user?.role === 'admin' || user?.id === comment.author.id) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">Hali kommentlar yo'q</p>
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Komment yozing..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="self-end px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? '...' : 'Yuborish'}
        </button>
      </form>
    </div>
  );
}
