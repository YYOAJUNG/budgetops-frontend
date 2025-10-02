import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Plus, BadgeDollarSign, Bot } from 'lucide-react'

const costTrend = [
  { month: '1월', cost: 45 },
  { month: '2월', cost: 52 },
  { month: '3월', cost: 49 },
  { month: '4월', cost: 36 },
  { month: '5월', cost: 40 },
  { month: '6월', cost: 33 },
]

const usageTrend = [
  { time: '00:00', cpu: 30, mem: 20 },
  { time: '04:00', cpu: 35, mem: 28 },
  { time: '08:00', cpu: 60, mem: 55 },
  { time: '12:00', cpu: 72, mem: 70 },
  { time: '16:00', cpu: 78, mem: 76 },
  { time: '20:00', cpu: 50, mem: 40 },
]

export function DashboardPage(): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">대시보드</h1>
          <p className="text-sm text-slate-500">멀티클라우드 환경을 한눈에 확인하세요</p>
        </div>
        <div className="flex gap-2">
          <button className="btn flex items-center gap-2"><Plus size={16}/>리소스 추가</button>
          <button className="btn flex items-center gap-2"><BadgeDollarSign size={16}/>비용 분석</button>
          <button className="btn btn-primary flex items-center gap-2"><Bot size={16}/>AI 추천</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">📦</div>
          <div>
            <div className="text-xs text-slate-500">총 리소스</div>
            <div className="text-2xl font-extrabold">24개</div>
            <div className="text-xs text-emerald-600">↗ +3 이번 주</div>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">💵</div>
          <div>
            <div className="text-xs text-slate-500">월 비용</div>
            <div className="text-2xl font-extrabold">$35</div>
            <div className="text-xs text-emerald-600">↘ -16% 전월 대비</div>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">⚡</div>
          <div>
            <div className="text-xs text-slate-500">프리티어 사용률</div>
            <div className="text-2xl font-extrabold">73%</div>
            <div className="text-xs text-amber-600">⚠︎ 한도 주의</div>
          </div>
        </div>
        <div className="card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">🛡️</div>
          <div>
            <div className="text-xs text-slate-500">절약 가능</div>
            <div className="text-2xl font-extrabold">$57</div>
            <div className="text-xs text-violet-600">AI 추천 기반</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">월별 비용 추이</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cost" stroke="#3b82f6" fillOpacity={1} fill="url(#cost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">실시간 리소스 사용률</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mem" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Timeline & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">최근 알림</div>
          <ul className="text-sm space-y-2">
            <li>• EC2 인스턴스 CPU 사용률이 85%를 초과했습니다. <span className="text-slate-400">5분 전</span></li>
            <li>• 프리티어 한도의 80%를 사용했습니다. <span className="text-slate-400">10분 전</span></li>
          </ul>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">AI 추천</div>
          <div className="text-sm">사용하지 않는 3개의 인스턴스를 중지하여 월 <b>$45</b> 절약 가능합니다.</div>
        </div>
      </div>
    </div>
  )
}


