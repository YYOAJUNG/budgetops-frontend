import { getAzureVmMetrics } from '@/lib/api/azure';
import { VmMetricsDialog } from './VmMetricsDialog';

interface AzureVmMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  vmName: string;
  resourceGroup: string;
  displayName: string;
  region?: string;
}

export function AzureVmMetricsDialog({
  open,
  onOpenChange,
  accountId,
  vmName,
  resourceGroup,
  displayName,
  region,
}: AzureVmMetricsDialogProps) {
  return (
    <VmMetricsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={displayName || vmName}
      identifier={vmName}
      region={region}
      queryKey={['azure-vm-metrics', accountId, resourceGroup, vmName]}
      fetchMetrics={(hours) => getAzureVmMetrics(accountId, vmName, resourceGroup, hours)}
    />
  );
}

