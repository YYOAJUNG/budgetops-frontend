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
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      // 시뮬레이션된 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Account connection data:', data);
      alert(`${data.provider} 계정이 성공적으로 연결되었습니다! (스텁)`);
    } catch (error) {
      console.error('Account connection failed:', error);
      alert('계정 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">클라우드 계정</h1>
        <p className="text-muted-foreground">AWS, GCP, Azure, NCP 계정을 연결하여 비용 데이터를 수집하세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 계정 연결 폼 */}
        <div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CloudProvider)}>
            <TabsList className="grid w-full grid-cols-4">
              {(['AWS', 'GCP', 'AZURE', 'NCP'] as CloudProvider[]).map((provider) => {
                const Icon = providerIcons[provider];
                return (
                  <TabsTrigger key={provider} value={provider} className="flex items-center gap-2">
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
                  onSubmit={handleAccountSubmit}
                  isLoading={isLoading}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* 연결된 계정 목록 */}
        <div>
          <AccountList />
        </div>
      </div>
    </div>
  );
}
