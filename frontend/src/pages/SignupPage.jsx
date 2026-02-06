import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (formData.fullName.length < 2) {
      newErrors.fullName = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak';
    }
    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Parolda kamida 1 ta katta harf bo\'lishi kerak';
    }
    if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Parolda kamida 1 ta raqam bo\'lishi kerak';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmaydi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await signup(formData.fullName, formData.email, formData.password);
      toast.success(data.message);
      navigate('/pending');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="mt-2 text-gray-600">Ro'yxatdan o'tish</p>
        </div>

        <form className="bg-white shadow-lg rounded-lg p-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange('fullName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="To'liq ism"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={handleChange('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={handleChange('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Kamida 8 ta belgi"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Parolni qayta kiriting"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Akkauntingiz bormi?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Kirish
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
