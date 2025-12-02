'use client';

import { useState, useCallback, useMemo } from 'react';
import { useUIStore } from '@/store/ui';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api/client';
import { getAwsAccounts, getAllAwsAccountsCosts, AwsAccount } from '@/lib/api/aws';
import { getAzureAccounts, getAllAzureAccountsCosts, AzureAccountCost } from '@/lib/api/azure';
import { getNcpAccounts, getAllNcpAccountsCostsSummary } from '@/lib/api/ncp';
import { useQuery } from '@tanstack/react-query';

const TRANSITION_CLASS = 'transition-transform duration-300 ease-in-out';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: '안녕하세요! BudgetOps AI 어시스턴트입니다. 클라우드 비용 관리에 대해 무엇이든 물어보세요.',
  timestamp: new Date(),
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 shadow-sm',
          isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p className={cn('text-xs mt-1', isUser ? 'text-indigo-200' : 'text-gray-500')}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export function AIChatPanel() {
  const { aiChatOpen, setAIChatOpen } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedService, setSelectedService] = useState<'all' | 'cost' | 'ec2' | 'azure' | null>(null);
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  // 모든 CSP 계정 조회
  const { data: awsAccounts } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
  });

  const { data: azureAccounts } = useQuery({
    queryKey: ['azureAccounts'],
    queryFn: getAzureAccounts,
  });

  const { data: ncpAccounts } = useQuery({
    queryKey: ['ncpAccounts'],
    queryFn: getNcpAccounts,
  });

  const activeAwsAccounts = useMemo(() => {
    return (awsAccounts || []).filter((account: AwsAccount) => account.active === true);
  }, [awsAccounts]);

  const activeAzureAccounts = useMemo(() => {
    return (azureAccounts || []).filter((account) => account.active === true);
  }, [azureAccounts]);

  const activeNcpAccounts = useMemo(() => {
    return (ncpAccounts || []).filter((account) => account.active === true);
  }, [ncpAccounts]);

  const hasActiveAccounts = activeAwsAccounts.length > 0 || activeAzureAccounts.length > 0 || activeNcpAccounts.length > 0;

  const endDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }, []);

  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }, []);

  // AWS 비용 조회
  const { data: awsAccountCosts } = useQuery({
    queryKey: ['awsAccountCosts', startDate, endDate],
    queryFn: () => getAllAwsAccountsCosts(startDate, endDate),
    enabled: activeAwsAccounts.length > 0,
    retry: 1,
  });

  // Azure 비용 조회
  const { data: azureAccountCosts } = useQuery({
    queryKey: ['azureAccountCosts', startDate, endDate],
    queryFn: () => getAllAzureAccountsCosts(startDate, endDate),
    enabled: activeAzureAccounts.length > 0,
    retry: 1,
  });

  // NCP 비용 조회 (이번 달)
  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }, []);

  const { data: ncpAccountCosts } = useQuery({
    queryKey: ['ncpAccountCosts', currentMonth],
    queryFn: () => getAllNcpAccountsCostsSummary(currentMonth),
    enabled: activeNcpAccounts.length > 0,
    retry: 1,
  });

  // 전체 비용 계산 (USD 기준, NCP는 KRW이므로 대략적인 환율 적용)
  const totalCost = useMemo(() => {
    let total = 0;
    if (awsAccountCosts) {
      total += awsAccountCosts.reduce((sum, account) => sum + account.totalCost, 0);
    }
    if (azureAccountCosts) {
      total += azureAccountCosts.reduce((sum, account) => sum + (account.amount || 0), 0);
    }
    if (ncpAccountCosts) {
      // NCP는 KRW이므로 대략적으로 1300원 = 1달러로 환산 (실제로는 환율 API 사용 권장)
      total += ncpAccountCosts.reduce((sum, account) => sum + (account.totalCost / 1300), 0);
    }
    return total;
  }, [awsAccountCosts, azureAccountCosts, ncpAccountCosts]);

  // 전체 활성 계정 수
  const totalActiveAccounts = activeAwsAccounts.length + activeAzureAccounts.length + activeNcpAccounts.length;

  // 계정별 비용 목록 (프롬프트용)
  const allAccountCosts = useMemo(() => {
    const costs: Array<{ provider: string; accountName: string; cost: number; currency: string }> = [];
    if (awsAccountCosts) {
      awsAccountCosts.forEach(ac => {
        costs.push({ provider: 'AWS', accountName: ac.accountName, cost: ac.totalCost, currency: 'USD' });
      });
    }
    if (azureAccountCosts) {
      azureAccountCosts.forEach(ac => {
        costs.push({ provider: 'Azure', accountName: ac.accountName, cost: ac.amount || 0, currency: ac.currency || 'USD' });
      });
    }
    if (ncpAccountCosts) {
      ncpAccountCosts.forEach(ac => {
        costs.push({ provider: 'NCP', accountName: ac.accountName, cost: ac.totalCost, currency: ac.currency || 'KRW' });
      });
    }
    return costs;
  }, [awsAccountCosts, azureAccountCosts, ncpAccountCosts]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    if (isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      setIsSending(true);
      const res = await api.post('/ai/chat', {
        message: userMessage.content,
        session_id: sessionId ?? undefined,
      });

      const aiText: string = res.data?.response ?? '응답을 가져오지 못했습니다.';
      const returnedSessionId: string | undefined = res.data?.session_id;
      if (returnedSessionId && !sessionId) {
        setSessionId(returnedSessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorText =
        error?.response?.data?.detail ||
        error?.message ||
        '요청 처리 중 오류가 발생했습니다.';
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `오류: ${errorText}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsSending(false);
    }
  }, [input, sessionId, isSending]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  }, [handleSend]);

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col',
        // Desktop: 480px 고정 너비
        'w-full md:w-[480px]',
        TRANSITION_CLASS,
        aiChatOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="font-semibold text-gray-900">AI 어시스턴트</h2>
          <p className="text-xs text-gray-500">비용 관리 도우미</p>
        </div>
        <button
          onClick={() => setAIChatOpen(false)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2 shadow-sm bg-gray-100 text-gray-600">
              <p className="text-sm">답변 생성중입니다...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        {/* 프롬프트 추천 버튼 */}
        {hasActiveAccounts && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">프롬프트 추천</div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setShowServiceSelector(!showServiceSelector);
                  if (!showServiceSelector) {
                    const costBreakdown: string[] = [];
                    if (awsAccountCosts && awsAccountCosts.length > 0) {
                      const awsTotal = awsAccountCosts.reduce((sum, ac) => sum + ac.totalCost, 0);
                      costBreakdown.push(`AWS: $${awsTotal.toFixed(2)} USD`);
                    }
                    if (azureAccountCosts && azureAccountCosts.length > 0) {
                      const azureTotal = azureAccountCosts.reduce((sum, ac) => sum + (ac.amount || 0), 0);
                      costBreakdown.push(`Azure: $${azureTotal.toFixed(2)} ${azureAccountCosts[0]?.currency || 'USD'}`);
                    }
                    if (ncpAccountCosts && ncpAccountCosts.length > 0) {
                      const ncpTotal = ncpAccountCosts.reduce((sum, ac) => sum + ac.totalCost, 0);
                      costBreakdown.push(`NCP: ${ncpTotal.toLocaleString()} ${ncpAccountCosts[0]?.currency || 'KRW'}`);
                    }
                    const costMessage = `최근 30일 전체 클라우드 비용이 ${costBreakdown.join(', ')}입니다. 비용 절감 방안을 알려주세요.`;
                    setInput(costMessage);
                  }
                }}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border transition-colors",
                  showServiceSelector
                    ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
              >
                전체 비용 분석
              </button>
              {activeAwsAccounts.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedService('ec2');
                    setShowServiceSelector(false);
                    const ec2Message = `AWS EC2 인스턴스 최적화 방안을 알려주세요.`;
                    setInput(ec2Message);
                  }}
                  className="px-3 py-2 text-sm rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  EC2 최적화
                </button>
              )}
              {activeAzureAccounts.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedService('azure');
                    setShowServiceSelector(false);
                    const azureMessage = `Azure Virtual Machines 최적화 방안을 알려주세요.`;
                    setInput(azureMessage);
                  }}
                  className="px-3 py-2 text-sm rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Azure VM 최적화
                </button>
              )}
              {allAccountCosts.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedService('cost');
                    setShowServiceSelector(false);
                    const accountList = allAccountCosts.map(ac => {
                      if (ac.currency === 'KRW') {
                        return `${ac.provider} ${ac.accountName}: ${ac.cost.toLocaleString()} ${ac.currency}`;
                      }
                      return `${ac.provider} ${ac.accountName}: $${ac.cost.toFixed(2)} ${ac.currency}`;
                    }).join(', ');
                    const costMessage = `계정별 비용을 분석해주세요. ${accountList}`;
                    setInput(costMessage);
                  }}
                  className="px-3 py-2 text-sm rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  계정별 분석
                </button>
              )}
            </div>
          </div>
        )}

        {/* 유저 정보 */}
        {hasActiveAccounts && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-semibold text-blue-900 mb-2 text-sm">유저 정보</div>
            <div className="text-blue-700 space-y-1 text-sm">
              <div>전체 비용 (30일): <span className="font-semibold">${totalCost.toFixed(2)} USD</span></div>
              <div>활성 계정: <span className="font-semibold">{totalActiveAccounts}개</span>
                {activeAwsAccounts.length > 0 && <span className="ml-1">(AWS: {activeAwsAccounts.length}</span>}
                {activeAzureAccounts.length > 0 && <span className="ml-1">Azure: {activeAzureAccounts.length}</span>}
                {activeNcpAccounts.length > 0 && <span className="ml-1">NCP: {activeNcpAccounts.length}</span>}
                {(activeAwsAccounts.length > 0 || activeAzureAccounts.length > 0 || activeNcpAccounts.length > 0) && <span>)</span>}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
