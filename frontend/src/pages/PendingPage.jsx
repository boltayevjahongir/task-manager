import { Link } from 'react-router-dom';

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center bg-white shadow-lg rounded-lg p-8">
        <div className="text-6xl mb-4">&#9203;</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Arizangiz ko'rib chiqilmoqda
        </h2>
        <p className="text-gray-600 mb-6">
          Admin tasdiqlaguncha kuting, iltimos. Tasdiqlangandan so'ng tizimga kirishingiz mumkin.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Login sahifasiga qaytish
        </Link>
      </div>
    </div>
  );
}
