import React from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import './layout.css'

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Topbar />
        <main className="main">{children}</main>
      </div>
    </div>
  )
}


