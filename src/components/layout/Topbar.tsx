import React from 'react'
import './topbar.css'

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


