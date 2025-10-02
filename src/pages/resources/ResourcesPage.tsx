import React, { useMemo, useState } from 'react'

type Provider = 'AWS' | 'GCP' | 'Azure'

type Resource = {
  id: string
  name: string
  provider: Provider
  cpu: number
  mem: number
  storage: string
  network?: string
  status: 'running' | 'stopped'
  ai?: string
}

const DATA: Resource[] = [
  { id: '1', name: 't2.micro', provider: 'AWS', cpu: 45, mem: 60, storage: '30/100GB', status: 'running', ai: '절약 후보' },
  { id: '2', name: 'e2-micro', provider: 'GCP', cpu: 30, mem: 80, storage: '20/60GB', status: 'running' },
  { id: '3', name: 'B1s', provider: 'Azure', cpu: 20, mem: 50, storage: '10/40GB', network: '500Mbps', status: 'stopped' },
]

export function ResourcesPage(): JSX.Element {
  const [filter, setFilter] = useState<Provider | 'ALL'>('ALL')
  const list = useMemo(() => filter === 'ALL' ? DATA : DATA.filter(d => d.provider === filter), [filter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">리소스 관리</h1>
          <p className="text-sm text-slate-500">인스턴스 상태와 사용률을 확인하세요</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['ALL','AWS','GCP','Azure'] as const).map(p => (
          <button key={p} onClick={() => setFilter(p as any)} className={`btn ${filter===p ? 'btn-primary' : ''}`}>{p}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-12 text-sm font-semibold text-slate-500 px-2 py-2">
            <div className="col-span-3">이름</div>
            <div className="col-span-2">클라우드</div>
            <div className="col-span-2">CPU</div>
            <div className="col-span-2">메모리</div>
            <div className="col-span-2">스토리지</div>
            <div className="col-span-1 text-right">상태</div>
          </div>
          <div className="divide-y divide-black/5">
            {list.map(r => (
              <div key={r.id} className="grid grid-cols-12 items-center px-2 py-3">
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-slate-900 font-semibold">{r.name}</span>
                  {r.ai && <span className="ml-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-md px-2 py-0.5">{r.ai}</span>}
                </div>
                <div className="col-span-2">{r.provider}</div>
                <div className="col-span-2">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400" style={{width:`${r.cpu}%`}}/></div>
                  <span className="text-xs text-slate-500">{r.cpu}%</span>
                </div>
                <div className="col-span-2">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{width:`${r.mem}%`}}/></div>
                  <span className="text-xs text-slate-500">{r.mem}%</span>
                </div>
                <div className="col-span-2">{r.storage}</div>
                <div className="col-span-1 text-right">
                  <span className={`text-xs px-2 py-1 rounded-md border ${r.status==='running'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-50 text-slate-600 border-slate-200'}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


