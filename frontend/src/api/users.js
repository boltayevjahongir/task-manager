import api from './axios';

export const usersApi = {
  getAll: () => api.get('/users/'),
  getPending: () => api.get('/users/pending'),
  getDevelopers: () => api.get('/users/developers'),
  getById: (id) => api.get(`/users/${id}`),
  approve: (id) => api.patch(`/users/${id}/approve`),
  reject: (id) => api.patch(`/users/${id}/reject`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};
