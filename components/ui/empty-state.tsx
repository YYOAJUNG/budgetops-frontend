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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
