import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'

const Placeholder = ({ title }: { title: string }) => (
  <div className="card p-4">{title} 페이지 준비 중</div>
)

export function AppRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Placeholder title="로그인" />} />
        <Route path="/" element={<Layout><Placeholder title="대시보드" /></Layout>} />
        <Route path="/dashboard" element={<Layout><Placeholder title="대시보드" /></Layout>} />
        <Route path="/resources" element={<Layout><Placeholder title="리소스 관리" /></Layout>} />
        <Route path="/cost-analysis" element={<Layout><Placeholder title="비용 분석" /></Layout>} />
        <Route path="/ai-assistant" element={<Layout><Placeholder title="AI 어시스턴스" /></Layout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


