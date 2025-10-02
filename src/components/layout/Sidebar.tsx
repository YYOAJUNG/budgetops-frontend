import React from 'react'
import { NavLink } from 'react-router-dom'
import './sidebar.css'

export function Sidebar(): JSX.Element {
  return (
    <aside className="sidebar">
      <div className="brand">BudgetOps</div>
      <nav>
        <NavLink to="/login" className="nav">로그인</NavLink>
        <NavLink to="/dashboard" className="nav">대시보드</NavLink>
        <NavLink to="/resources" className="nav">리소스 관리</NavLink>
        <NavLink to="/cost" className="nav">비용 분석</NavLink>
        <NavLink to="/assistant" className="nav">AI 어시스턴스</NavLink>
        <NavLink to="/chatbot" className="nav">GPT 챗봇</NavLink>
      </nav>
    </aside>
  )
}


