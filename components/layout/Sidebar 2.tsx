'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Cloud,
  Lightbulb,
  Calculator,
  FileText,
  Bot,
  BarChart3,
  Activity
} from 'lucide-react';
import { Grid } from '@mynaui/icons-react';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Grid },
  {
    name: 'Costs',
    icon: DollarSign,
    children: [
      { name: 'Analyze', href: '/costs/analyze', icon: BarChart3 },
      { name: 'Anomalies', href: '/costs/anomalies', icon: AlertTriangle },
      { name: 'Forecast', href: '/costs/forecast', icon: TrendingUp },
    ]
  },
  { name: '리소스 관리', href: '/accounts', icon: Cloud },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Simulators', href: '/simulators/db-billing', icon: Calculator },
  { name: 'Reports', href: '/reports', icon: FileText },
  // { name: 'Copilot', href: '/copilot', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-bold text-gray-900">BudgetOps</h1>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      'flex items-center px-6 py-2.5 text-sm rounded-lg transition-all duration-200 group',
                      pathname === child.href
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <child.icon className={cn(
                      'mr-3 h-4 w-4 transition-colors',
                      pathname === child.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )} />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
