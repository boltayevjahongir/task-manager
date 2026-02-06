export const TASK_STATUS = {
  new: { label: 'Yangi', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Jarayonda', color: 'bg-yellow-100 text-yellow-800' },
  review: { label: 'Tekshiruvda', color: 'bg-purple-100 text-purple-800' },
  done: { label: 'Tayyor', color: 'bg-green-100 text-green-800' },
};

export const TASK_PRIORITY = {
  low: { label: 'Past', color: 'bg-gray-100 text-gray-800' },
  medium: { label: "O'rta", color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Yuqori', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Shoshilinch', color: 'bg-red-100 text-red-800' },
};

export const USER_STATUS = {
  pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Tasdiqlangan', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rad etilgan', color: 'bg-red-100 text-red-800' },
};

export const USER_ROLE = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  developer: { label: 'Developer', color: 'bg-blue-100 text-blue-800' },
};
