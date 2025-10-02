import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { LoginPage } from './login/LoginPage'
import { DashboardPage } from './dashboard/DashboardPage'
import { ResourcesPage } from './resources/ResourcesPage'
import { CostPage } from './cost/CostPage'
import { AssistantPage } from './ai/AssistantPage'

const Placeholder = ({ title }: { title: string }) => (
  <div className="card p-4">{title} 페이지 준비 중</div>
)

export function AppRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/resources" element={<Layout><ResourcesPage /></Layout>} />
        <Route path="/cost-analysis" element={<Layout><CostPage /></Layout>} />
        <Route path="/ai-assistant" element={<Layout><AssistantPage /></Layout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


