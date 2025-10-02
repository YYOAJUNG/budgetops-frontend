import React from 'react'
import { Card } from '../../components/ui/Card'

export function AssistantPage(): JSX.Element {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:16}}>
      <div style={{gridColumn:'span 8'}}>
        <Card title="AI 절약 제안 상세">
          <div style={{height:260,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
      <div style={{gridColumn:'span 4'}}>
        <Card title="빠른 액션">
          <ul style={{margin:0,paddingLeft:18,lineHeight:1.8}}>
            <li>저사용 인스턴스 축소</li>
            <li>IP/스냅샷 정리</li>
            <li>스토리지 티어 변경</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}


