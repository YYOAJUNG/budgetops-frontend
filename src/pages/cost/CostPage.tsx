import React from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'

const monthly = [
  { m: '1월', v: 42 }, { m: '2월', v: 48 }, { m: '3월', v: 45 }, { m: '4월', v: 38 }, { m: '5월', v: 41 }, { m: '6월', v: 37 }
]

const byProvider = [
  { name: 'AWS', value: 45, color: '#3b82f6' },
  { name: 'GCP', value: 30, color: '#60a5fa' },
  { name: 'Azure', value: 25, color: '#93c5fd' }
]

export function CostPage(): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold">비용 분석</h1>
        <p className="text-sm text-slate-500">트렌드와 분해, 프리티어 진행률을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">월별 비용 트렌드</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#3b82f6" fillOpacity={1} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-semibold mb-2">클라우드 제공자별 비용</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byProvider} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {byProvider.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm font-semibold mb-2">프리티어 사용량</div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width:'73%'}}/></div>
        <div className="text-xs text-slate-500 mt-1">73% 사용 중 (경고 임계 80%)</div>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div className="text-sm">전월 대비 <b className="text-emerald-600">-12%</b> 감소, 예상 월말 비용 <b>$52</b></div>
        <div className="flex gap-2">
          <button className="btn">CSV 다운로드</button>
          <button className="btn btn-primary">PDF 리포트</button>
        </div>
      </div>
    </div>
  )
}


