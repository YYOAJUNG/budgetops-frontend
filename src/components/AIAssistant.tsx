import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingDown, 
  Server, 
  DollarSign,
  Sparkles,
  FileText,
  Download,
  Copy
} from 'lucide-react';
import { trackButtonClick } from '../utils/analytics';
import { SurveyButton } from './SurveyButton';

interface AIAssistantProps {
  onNavigate: (page: string) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: { label: string; type: string; data?: any }[];
}

export function AIAssistant({ onNavigate }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '안녕하세요! 클라우드 리소스 최적화 AI 어시스턴트입니다. 비용 절약과 성능 최적화에 관해 도움을 드릴 수 있어요. 무엇을 도와드릴까요?',
      timestamp: new Date(),
      suggestions: [
        '비용을 줄일 수 있는 방법을 알려주세요',
        '사용하지 않는 리소스를 찾아주세요',
        '성능 개선 방안을 제안해주세요',
        '프리티어 최적화 팁을 알려주세요'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    {
      title: '비용 분석 보고서',
      description: '지난 30일간의 상세한 비용 분석 리포트를 생성합니다',
      icon: FileText,
      action: 'generate_cost_report'
    },
    {
      title: '리소스 최적화 계획',
      description: '현재 리소스 사용 패턴을 분석하여 최적화 계획을 수립합니다',
      icon: TrendingDown,
      action: 'create_optimization_plan'
    },
    {
      title: '미사용 리소스 탐지',
      description: '비용을 발생시키는 미사용 리소스를 자동으로 찾아드립니다',
      icon: Server,
      action: 'detect_unused_resources'
    }
  ];

  const predefinedResponses = {
    cost_reduction: {
      content: `현재 클라우드 환경을 분석한 결과, 다음과 같은 비용 절약 방안을 제안드립니다:

**1. 미사용 리소스 정리 (예상 절약: $45/월)**
- EC2 인스턴스 3개가 7일 이상 중지 상태입니다
- 연결되지 않은 EBS 볼륨 2개를 발견했습니다

**2. 인스턴스 크기 최적화 (예상 절약: $28/월)**
- Web Server 01의 CPU 사용률이 평균 25%로 낮습니다
- t3.medium → t3.small로 다운그레이드를 권장합니다

**3. 예약 인스턴스 활용 (예상 절약: $67/월)**
- 24시간 실행 중인 인스턴스 2개에 1년 예약 인스턴스 적용 권장

**총 예상 절약 금액: $140/월**`,
      suggestions: ['상세한 실행 계획을 알려주세요', '예약 인스턴스에 대해 더 알려주세요', '리소스 정리를 자동화할 수 있나요?'],
      actions: [
        { label: '최적화 계획 실행', type: 'execute_plan' },
        { label: '비용 분석 보기', type: 'navigate', data: 'costs' }
      ]
    },
    unused_resources: {
      content: `미사용 리소스 검사를 완료했습니다:

**🔍 발견된 미사용 리소스:**

**EC2 인스턴스:**
- gce-003 (Compute Engine) - 7일째 중지 상태 💰 $12/월 절약 가능
- 추천: 완전 제거 또는 필요시 재생성

**스토리지:**
- 연결되지 않은 EBS 볼륨 2개 💰 $8/월 절약 가능
- 스냅샷 7개 (90일 이상) 💰 $15/월 절약 가능

**네트워크:**
- 사용하지 않는 로드 밸런서 1개 💰 $18/월 절약 가능

**총 예상 절약: $53/월**

이러한 리소스들을 정리하시겠습니까?`,
      suggestions: ['자동으로 정리해주세요', '각 리소스의 세부 정보를 알려주세요', '안전하게 제거하는 방법은?'],
      actions: [
        { label: '자동 정리 시작', type: 'auto_cleanup' },
        { label: '리소스 관리로 이동', type: 'navigate', data: 'resources' }
      ]
    },
    performance_optimization: {
      content: `성능 분석을 완료했습니다:

**⚡ 성능 개선 권장사항:**

**Database Server (vm-002):**
- CPU 사용률 78% - 메모리 부족이 원인일 수 있습니다
- 권장: RAM 증설 또는 상위 인스턴스로 업그레이드
- 예상 성능 향상: 40-60%

**네트워크 최적화:**
- CDN 미사용으로 인한 로딩 지연 발견
- CloudFront 설정 시 응답 시간 50% 개선 가능

**스토리지 최적화:**
- 자주 접근하는 데이터에 SSD 사용 권장
- 현재 HDD 스토리지 → SSD 변경 시 I/O 성능 3배 향상

이러한 최적화를 진행하시겠습니까?`,
      suggestions: ['비용 대비 효과가 가장 좋은 것은?', 'CDN 설정 방법을 알려주세요', '단계별로 진행하고 싶어요'],
      actions: [
        { label: '최적화 시작', type: 'start_optimization' },
        { label: '성능 모니터링', type: 'navigate', data: 'resources' }
      ]
    },
    freetier_tips: {
      content: `프리티어 최적화 가이드를 제공합니다:

**🎯 현재 프리티어 사용률: 73%**

**주의 필요한 서비스:**
- EC2: 680/750 시간 (90.7%) ⚠️ 한도 임박
- S3: 18/20 GB (90%) ⚠️ 한도 임박

**최적화 팁:**

**1. EC2 사용량 관리**
- 개발/테스트 인스턴스는 사용 후 즉시 중지
- 스케줄러 설정으로 자동 중지/시작
- 예상 절약: 월 $15-25

**2. S3 스토리지 관리**
- 임시 파일 자동 정리 설정
- Lifecycle 정책으로 오래된 파일을 IA로 이동
- 예상 절약: 월 $8-12

**3. 모니터링 설정**
- CloudWatch 알람으로 80% 사용 시 알림
- 일일 사용량 체크 자동화

프리티어 최적화를 도와드릴까요?`,
      suggestions: ['자동 중지 스케줄러 설정하기', 'S3 정리 규칙 만들기', '알림 설정 도움받기'],
      actions: [
        { label: '자동화 설정', type: 'setup_automation' },
        { label: '프리티어 현황 보기', type: 'navigate', data: 'costs' }
      ]
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    // Track chat message
    trackButtonClick('send_chat_message', 'AI Chat', 'ai', {
      message_length: messageText.length,
      is_suggestion: !!message
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse: Message;
      
      if (messageText.includes('비용') || messageText.includes('절약')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: predefinedResponses.cost_reduction.content,
          timestamp: new Date(),
          suggestions: predefinedResponses.cost_reduction.suggestions,
          actions: predefinedResponses.cost_reduction.actions
        };
      } else if (messageText.includes('미사용') || messageText.includes('리소스')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: predefinedResponses.unused_resources.content,
          timestamp: new Date(),
          suggestions: predefinedResponses.unused_resources.suggestions,
          actions: predefinedResponses.unused_resources.actions
        };
      } else if (messageText.includes('성능') || messageText.includes('최적화')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: predefinedResponses.performance_optimization.content,
          timestamp: new Date(),
          suggestions: predefinedResponses.performance_optimization.suggestions,
          actions: predefinedResponses.performance_optimization.actions
        };
      } else if (messageText.includes('프리티어')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: predefinedResponses.freetier_tips.content,
          timestamp: new Date(),
          suggestions: predefinedResponses.freetier_tips.suggestions,
          actions: predefinedResponses.freetier_tips.actions
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: '죄송합니다. 해당 내용에 대해서는 더 구체적인 정보가 필요합니다. 다음 중에서 선택해주시거나 더 자세히 설명해주세요.',
          timestamp: new Date(),
          suggestions: [
            '비용을 줄일 수 있는 방법을 알려주세요',
            '사용하지 않는 리소스를 찾아주세요',
            '성능 개선 방안을 제안해주세요',
            '프리티어 최적화 팁을 알려주세요'
          ]
        };
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleActionClick = (action: { label: string; type: string; data?: any }) => {
    trackButtonClick('ai_action_click', 'AI Action', 'ai', {
      action_label: action.label,
      action_type: action.type,
      action_data: action.data
    });

    if (action.type === 'navigate' && action.data) {
      onNavigate(action.data);
    } else {
      // Handle other actions
      const confirmMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `"${action.label}" 작업을 시작하겠습니다. 잠시만 기다려주세요...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  const handleQuickAction = (actionType: string) => {
    const actionMessages = {
      generate_cost_report: '지난 30일간의 상세한 비용 분석 리포트를 생성해주세요',
      create_optimization_plan: '현재 리소스 사용 패턴을 분석하여 최적화 계획을 수립해주세요',
      detect_unused_resources: '비용을 발생시키는 미사용 리소스를 찾아주세요'
    };
    
    handleSend(actionMessages[actionType] || actionType);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            AI 어시스턴스
          </h1>
          <p className="text-gray-600 mt-1">클라우드 최적화 전문 AI가 도움을 드립니다</p>
        </div>
        <div className="flex items-center gap-3">
          <SurveyButton variant="outline" size="md" textType="short" />
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            온라인
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                빠른 작업
              </CardTitle>
              <CardDescription>자주 사용하는 AI 기능들</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto p-3 flex flex-col items-start gap-2 hover:bg-purple-50 hover:border-purple-200"
                    onClick={() => {
                      trackButtonClick(`quick_action_${action.action}`, 'AI Quick Action', 'ai', {
                        action_title: action.title
                      });
                      handleQuickAction(action.action);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-left">{action.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 text-left">{action.description}</p>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">CloudHub AI</CardTitle>
                  <CardDescription>클라우드 최적화 전문가</CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleActionClick(action)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-500 mb-2">💡 추천 질문:</p>
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="block w-full text-left justify-start h-auto p-2 text-xs text-purple-600 hover:bg-purple-50 border border-purple-200 rounded"
                            onClick={() => handleSend(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {message.timestamp.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  {message.type === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="flex-shrink-0 border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="클라우드 최적화에 대해 질문해보세요..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={() => handleSend()} disabled={!inputValue.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                AI는 실시간 데이터를 기반으로 최적화 제안을 제공합니다
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}