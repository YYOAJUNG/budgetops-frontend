import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <Dashboard />
      </div>
    </MainLayout>
  );
}
