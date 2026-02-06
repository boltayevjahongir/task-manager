import api from './axios';

export const commentsApi = {
  getAll: (taskId) => api.get(`/tasks/${taskId}/comments/`),
  create: (taskId, data) => api.post(`/tasks/${taskId}/comments/`, data),
  delete: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};
