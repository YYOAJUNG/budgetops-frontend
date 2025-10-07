'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Cloud, 
  Lightbulb, 
  Calculator, 
  FileText, 
  Bot,
  BarChart3,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Costs', 
    icon: DollarSign,
    children: [
      { name: 'Analyze', href: '/costs/analyze', icon: BarChart3 },
      { name: 'Anomalies', href: '/costs/anomalies', icon: AlertTriangle },
      { name: 'Forecast', href: '/costs/forecast', icon: TrendingUp },
    ]
  },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Accounts', href: '/accounts', icon: Cloud },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Simulators', href: '/simulators/db-billing', icon: Calculator },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Copilot', href: '/copilot', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold">BudgetOps</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      'flex items-center px-6 py-2 text-sm rounded-md transition-colors',
                      pathname === child.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <child.icon className="mr-3 h-4 w-4" />
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
