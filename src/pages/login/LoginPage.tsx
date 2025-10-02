import React from 'react'

export function LoginPage(): JSX.Element {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center px-6 py-10 bg-gradient-to-br from-blue-100/60 to-blue-50">
      <div className="hidden lg:flex flex-col gap-6 pl-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">☁️</div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">CloudHub</div>
            <div className="text-sm text-slate-500">학생용 클라우드 관리</div>
          </div>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 bg-blue-50/60 rounded-xl p-3">
            <span>📊</span>
            <div>
              <div className="font-bold">리소스 실시간 모니터링</div>
              <div className="text-sm text-slate-500">CPU/메모리/스토리지를 한 곳에서</div>
            </div>
          </li>
          <li className="flex items-start gap-3 bg-blue-50/60 rounded-xl p-3">
            <span>💡</span>
            <div>
              <div className="font-bold">스마트 비용 분석</div>
              <div className="text-sm text-slate-500">증감을 분석해 최적화 방안 제시</div>
            </div>
          </li>
          <li className="flex items-start gap-3 bg-blue-50/60 rounded-xl p-3">
            <span>🤖</span>
            <div>
              <div className="font-bold">AI 기반 추천</div>
              <div className="text-sm text-slate-500">절약 방안과 우선순위 추천</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white border border-black/10 rounded-2xl shadow-soft p-6 space-y-3">
          <div className="text-xl font-extrabold">로그인</div>
          <div className="text-sm text-slate-500">계정으로 로그인하여 시작하세요.</div>
          <label className="text-xs text-slate-500">이메일</label>
          <input className="h-10 rounded-lg border border-black/10 px-3" placeholder="student@university.edu" />
          <label className="text-xs text-slate-500">비밀번호</label>
          <input className="h-10 rounded-lg border border-black/10 px-3" type="password" placeholder="••••••••" />
          <button className="btn btn-primary w-full">로그인</button>
          <div className="flex justify-end text-xs"><a className="text-blue-600" href="#">비밀번호를 잊으셨나요?</a></div>
          <div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex-1 h-px bg-black/10"/>또는<span className="flex-1 h-px bg-black/10"/></div>
          <button className="btn w-full bg-slate-50">데모 계정으로 체험하기</button>
        </div>
      </div>
    </div>
  )
}


