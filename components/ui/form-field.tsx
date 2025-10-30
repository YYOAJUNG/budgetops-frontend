import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function FormField({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  disabled = false,
  placeholder,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {Icon && (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
          </div>
        )}
        {!Icon && label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-2 border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500'
        )}
      />
    </div>
  );
}
