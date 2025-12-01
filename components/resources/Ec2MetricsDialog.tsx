import { getEc2InstanceMetrics } from '@/lib/api/aws';
import { VmMetricsDialog } from './VmMetricsDialog';

interface Ec2MetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  instanceId: string;
  instanceName: string;
  region?: string;
}

export function Ec2MetricsDialog({
  open,
  onOpenChange,
  accountId,
  instanceId,
  instanceName,
  region,
}: Ec2MetricsDialogProps) {
  return (
    <VmMetricsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={instanceName || instanceId}
      identifier={instanceId}
      region={region}
      queryKey={['ec2-metrics', accountId, instanceId]}
      fetchMetrics={(hours) => getEc2InstanceMetrics(accountId, instanceId, region, hours)}
    />
  );
}
