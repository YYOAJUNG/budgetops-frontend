'use client';

import { useState, useCallback } from 'react';
import { useUIStore } from '@/store/ui';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          'max-w-[80%] rounded-2xl px-4 py-2 shadow-sm',
          isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // TODO: AI API 호출
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. AI 기능은 현재 개발 중입니다.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);
  }, [input]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  }, [handleSend]);

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col',
        TRANSITION_CLASS,
        aiChatOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
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
            disabled={!input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
