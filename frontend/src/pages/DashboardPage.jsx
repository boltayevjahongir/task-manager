import { useState, useEffect } from 'react';
import { tasksApi } from '../api/tasks';
import Loading from '../components/common/Loading';
import StatsCards from '../components/dashboard/StatsCards';
import TasksByStatus from '../components/dashboard/TasksByStatus';
import TasksByDeveloper from '../components/dashboard/TasksByDeveloper';
import OverdueTasks from '../components/dashboard/OverdueTasks';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, overdueRes] = await Promise.all([
          tasksApi.getStats(),
          tasksApi.getOverdue(),
        ]);
        setStats(statsRes.data);
        setOverdueTasks(overdueRes.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {stats && (
        <>
          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TasksByStatus stats={stats} />
            <TasksByDeveloper stats={stats} />
          </div>

          {overdueTasks.length > 0 && (
            <div className="mt-6">
              <OverdueTasks tasks={overdueTasks} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
