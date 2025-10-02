import React from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 grid grid-cols-[14rem_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}


