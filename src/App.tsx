import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ResourceManagement } from './components/ResourceManagement';
import { CostAnalysis } from './components/CostAnalysis';
import { AIAssistant } from './components/AIAssistant';
import { Sidebar } from './components/Sidebar';
import { initAnalytics, trackPageView } from './utils/analytics';
import { getGATrackingId, getGTMContainerId } from './utils/config';

type Page = 'login' | 'dashboard' | 'resources' | 'costs' | 'ai';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize Google Analytics & Google Tag Manager
    // GTM 컨테이너 ID와 GA4 측정 ID는 /utils/config.ts에서 설정하세요
    initAnalytics(getGATrackingId(), getGTMContainerId());
    
    // Check if user is already logged in
    const auth = localStorage.getItem('cloudDashAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      trackPageView('dashboard', '대시보드');
    } else {
      trackPageView('login', '로그인');
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('cloudDashAuth', 'true');
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    trackPageView('dashboard', '대시보드');
  };

  const handleLogout = () => {
    localStorage.removeItem('cloudDashAuth');
    setIsAuthenticated(false);
    setCurrentPage('login');
    trackPageView('login', '로그인');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'resources':
        return <ResourceManagement onNavigate={setCurrentPage} />;
      case 'costs':
        return <CostAnalysis onNavigate={setCurrentPage} />;
      case 'ai':
        return <AIAssistant onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}