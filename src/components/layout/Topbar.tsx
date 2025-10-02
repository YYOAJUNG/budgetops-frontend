import React from 'react'
import './topbar.css'

export function Topbar(): JSX.Element {
  return (
    <header className="h-14 border-b border-black/5 bg-white flex items-center justify-between px-4">
      <div className="font-extrabold text-slate-900">CloudHub</div>
      <div className="text-sm text-slate-500">학생용 클라우드 관리</div>
    </header>
  )
}

export function Topbar(): JSX.Element {
  return (
    <header className="topbar">
      <div className="title">멀티 클라우드 리소스 대시보드</div>
      <div className="actions">
        <input className="search" placeholder="리소스 검색" />
      </div>
    </header>
  )
}


