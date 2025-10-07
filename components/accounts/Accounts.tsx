'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountForm } from './AccountForm';
import { AccountList } from './AccountList';
import { Cloud, Shield, Database, Server } from 'lucide-react';
import type { AccountFormData, CloudProvider } from '@/types/accounts';

const providerIcons = {
  AWS: Shield,
  GCP: Cloud,
  AZURE: Database,
  NCP: Server,
};

export function Accounts() {
  const [activeTab, setActiveTab] = useState<CloudProvider>('AWS');
  const [accounts, setAccounts] = useState<any[]>([]);

  const handleAccountLinked = (newAccount: any) => {
    setAccounts(prev => [...prev, newAccount]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">클라우드 계정</h1>
        <p className="text-gray-600 mt-2">AWS, GCP, Azure, NCP 계정을 연결하여 비용 데이터를 수집하세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 계정 연결 폼 */}
        <div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CloudProvider)}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
              {(['AWS', 'GCP', 'AZURE', 'NCP'] as CloudProvider[]).map((provider) => {
                const Icon = providerIcons[provider];
                return (
                  <TabsTrigger 
                    key={provider} 
                    value={provider} 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 text-gray-600"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{provider}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {(['AWS', 'GCP', 'AZURE', 'NCP'] as CloudProvider[]).map((provider) => (
              <TabsContent key={provider} value={provider}>
                <AccountForm
                  provider={provider}
                  onAccountLinked={handleAccountLinked}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* 연결된 계정 목록 */}
        <div>
          <AccountList accounts={accounts} />
        </div>
      </div>
    </div>
  );
}
