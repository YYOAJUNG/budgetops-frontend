import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { LoginPage } from './Auth/LoginPage'
import { DashboardPage } from './dashboard/DashboardPage'
import { ResourcesPage } from './resources/ResourcesPage'
import { CostPage } from './cost/CostPage'
import { AssistantPage } from './assistant/AssistantPage'
import { ChatbotPage } from './chatbot/ChatbotPage'

export function AppRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/resources" element={<Layout><ResourcesPage /></Layout>} />
        <Route path="/cost" element={<Layout><CostPage /></Layout>} />
        <Route path="/assistant" element={<Layout><AssistantPage /></Layout>} />
        <Route path="/chatbot" element={<Layout><ChatbotPage /></Layout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


