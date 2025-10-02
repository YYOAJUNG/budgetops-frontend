import React from 'react'
import '../../styles/tokens.css'
import './login.css'

export function LoginPage(): JSX.Element {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">BudgetOps 로그인</div>
        <input placeholder="이메일" className="login-input" />
        <input placeholder="비밀번호" type="password" className="login-input" />
        <button className="login-btn">로그인</button>
      </div>
    </div>
  )
}


