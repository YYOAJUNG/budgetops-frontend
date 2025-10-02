import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Cloud, Shield, BarChart3, Brain } from 'lucide-react';
import { trackButtonClick, trackLogin } from '../utils/analytics';
import { SurveyButton } from './SurveyButton';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for demo
    if (email && password) {
      trackButtonClick('login_submit', 'Authentication', 'login', {
        login_method: 'email'
      });
      trackLogin('email');
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative">
      {/* Survey Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <SurveyButton 
          variant="default" 
          size="md" 
          textType="long"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-0" 
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">CloudHub</h1>
            </div>
            <p className="text-xl text-gray-600">
              멀티클라우드 환경을 <br />
              <span className="text-blue-600 font-semibold">한눈에 관리하세요</span>
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">리소스 실시간 모니터링</h3>
                <p className="text-sm text-gray-600">CPU, 메모리, 스토리지 사용률을 실시간으로 확인하고 관리하세요</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">스마트 비용 분석</h3>
                <p className="text-sm text-gray-600">프리티어 현황과 비용 증감을 분석하여 최적화 방안을 제시합니다</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AI 기반 추천</h3>
                <p className="text-sm text-gray-600">AI가 분석한 절약 방안과 최적화 팁을 받아보세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>
              CloudHub에 오신 것을 환영합니다! <br />
              계정에 로그인하여 시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-4 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                >
                  로그인
                </Button>
                
                <div className="text-center">
                  <button 
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={() => trackButtonClick('forgot_password', 'Authentication', 'login')}
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">또는</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={() => {
                    trackButtonClick('demo_login', 'Authentication', 'login', {
                      login_method: 'demo'
                    });
                    trackLogin('demo');
                    setEmail('demo@student.com');
                    setPassword('demo123');
                    setTimeout(onLogin, 500);
                  }}
                >
                  데모 계정으로 체험하기
                </Button>
              </div>
            </form>
            
            {/* Survey Invitation */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-blue-800">
                  💡 더 나은 서비스를 위해 여러분의 의견이 필요해요!
                </p>
                <SurveyButton 
                  variant="outline" 
                  textType="long"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}