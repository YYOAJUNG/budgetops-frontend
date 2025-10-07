import { MainLayout } from '@/components/layout/MainLayout';
import { DBBillingSimulator } from '@/components/simulators/DBBillingSimulator';

export default function DBBillingPage() {
  return (
    <MainLayout>
      <DBBillingSimulator />
    </MainLayout>
  );
}
