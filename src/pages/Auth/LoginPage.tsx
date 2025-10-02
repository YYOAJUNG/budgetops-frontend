import React from 'react'
import '../../styles/tokens.css'
import './login.css'

export function LoginPage(): JSX.Element {
  return (
    <div className="login-hero">
      <section className="hero-left">
        <div className="brand">
          <div className="logo">☁️</div>
          <div className="brand-text">
            <div className="brand-title">CloudHub</div>
            <div className="brand-sub">멀티클라우드 환경을 한눈에 관리하세요</div>
          </div>
        </div>
        <ul className="features">
          <li>
            <span className="ic">📊</span>
            <div>
              <div className="f-title">리소스 실시간 모니터링</div>
              <div className="f-desc">CPU, 메모리, 스토리지 사용률을 한곳에서 확인</div>
            </div>
          </li>
          <li>
            <span className="ic">💡</span>
            <div>
              <div className="f-title">스마트 비용 분석</div>
              <div className="f-desc">증감을 분석하여 최적화 방안을 제시</div>
            </div>
          </li>
          <li>
            <span className="ic">🤖</span>
            <div>
              <div className="f-title">AI 기반 추천</div>
              <div className="f-desc">절약 방안과 우선순위를 자동 제안</div>
            </div>
          </li>
        </ul>
      </section>

      <section className="hero-right">
        <div className="login-card">
          <div className="login-heading">로그인</div>
          <div className="login-sub">CloudHub에 오신 것을 환영합니다. 계정으로 로그인하여 시작하세요.</div>

          <label className="login-label">이메일</label>
          <input placeholder="student@university.edu" className="login-input" />

          <label className="login-label">비밀번호</label>
          <input placeholder="••••••••" type="password" className="login-input" />

          <button className="login-btn">로그인</button>

          <div className="login-links">
            <a href="#">비밀번호를 잊으셨나요?</a>
          </div>

          <div className="divider"><span>또는</span></div>
          <button className="demo-btn">데모 계정으로 체험하기</button>

          <div className="survey-box">
            <div className="survey-text">더 나은 서비스를 위해 여러분의 의견이 필요해요!</div>
            <button className="survey-btn">설문조사 참여하기</button>
          </div>
        </div>
      </section>
    </div>
  )
}


