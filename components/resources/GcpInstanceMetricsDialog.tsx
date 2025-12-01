import { getGcpInstanceMetrics } from '@/lib/api/gcp';
import { VmMetricsDialog } from './VmMetricsDialog';

interface GcpInstanceMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  instanceName: string;
  region?: string;
}

export function GcpInstanceMetricsDialog({
  open,
  onOpenChange,
  resourceId,
  instanceName,
  region,
}: GcpInstanceMetricsDialogProps) {
  return (
    <VmMetricsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={instanceName || resourceId}
      identifier={resourceId}
      region={region}
      queryKey={['gcp-instance-metrics', resourceId]}
      fetchMetrics={(hours) => getGcpInstanceMetrics(resourceId, hours)}
    />
  );
}

