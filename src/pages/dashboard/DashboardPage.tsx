import React from 'react'
import { Card } from '../../components/ui/Card'
import { KPI } from '../../components/ui/KPI'
import '../../styles/tokens.css'
import './dashboard.css'

export function DashboardPage(): JSX.Element {
  return (
    <div className="dashboard-grid">
      <div className="db-header">
        <div className="db-title">
          <h1>대시보드</h1>
          <p>멀티클라우드 환경을 한눈에 확인하세요</p>
        </div>
        <div className="db-actions">
          <button className="btn">모든 서비스 정상</button>
          <button className="btn">설문조사</button>
          <button className="btn btn-primary">AI 분석 보기</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="ic">📦</div>
          <div>
            <div className="label">총 리소스</div>
            <div className="value">24개</div>
            <div className="hint">↗ +3 이번 주</div>
          </div>
        </div>
        <div className="stat">
          <div className="ic">💵</div>
          <div>
            <div className="label">월 비용</div>
            <div className="value">$35</div>
            <div className="hint" style={{color:'#059669'}}>↘ -16% 전월 대비</div>
          </div>
        </div>
        <div className="stat">
          <div className="ic">⚡</div>
          <div>
            <div className="label">프리티어 사용률</div>
            <div className="value">73%</div>
            <div className="hint" style={{color:'#ca8a04'}}>⚠︎ 한도 주의</div>
          </div>
        </div>
        <div className="stat">
          <div className="ic">🛡️</div>
          <div>
            <div className="label">절약 가능</div>
            <div className="value">$57</div>
            <div className="hint" style={{color:'#7c3aed'}}>AI 추천 기반</div>
          </div>
        </div>
      </div>
      <div className="dashboard-kpis">
        <KPI label="CPU 사용률" value="32%" hint="전일 대비 +2%" />
        <KPI label="메모리 사용률" value="58%" hint="전일 대비 -1%" />
        <KPI label="스토리지 사용률" value="41%" hint="볼륨 2개 임계치" />
        <KPI label="네트워크 사용률" value="19%" hint="피크 오후 2시" />
      </div>

      <div className="dashboard-main">
        <Card title="리소스 사용률">
          <div className="placeholder" />
        </Card>
      </div>
      <div className="dashboard-side">
        <Card title="AI 절약 제안">
          <ul className="list">
            <li>저사용 인스턴스 t3.small 3대 축소</li>
            <li>미사용 퍼블릭 IP 2개 해제</li>
            <li>S3 Glacier 전환 후보 12개</li>
          </ul>
        </Card>
      </div>

      <div className="dashboard-full">
        <Card title="사용 중인 자원 리스트">
          <div className="list-placeholder" />
        </Card>
      </div>
    </div>
  )
}



