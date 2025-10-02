import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Boxes, BadgeDollarSign, Bot } from 'lucide-react'

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link to={to} className={`flex items-center gap-2 h-10 px-3 rounded-lg border ${active ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-900 border-black/10'}`}>
      <Icon size={18} />
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  )
}

export function Sidebar(): JSX.Element {
  return (
    <aside className="w-56 border-r border-black/5 bg-white p-3 flex flex-col gap-2">
      <NavItem to="/dashboard" icon={LayoutDashboard} label="대시보드" />
      <NavItem to="/resources" icon={Boxes} label="리소스 관리" />
      <NavItem to="/cost-analysis" icon={BadgeDollarSign} label="비용 분석" />
      <NavItem to="/ai-assistant" icon={Bot} label="AI 어시스턴스" />
    </aside>
  )
}


