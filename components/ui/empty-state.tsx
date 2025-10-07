import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon && <div className="mb-4 text-gray-400">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 text-center mb-4 max-w-sm">{description}</p>
        {action && (
          <Button 
            onClick={action.onClick}
            className="bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
