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


