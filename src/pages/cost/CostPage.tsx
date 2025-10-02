import React from 'react'
import { Card } from '../../components/ui/Card'

export function CostPage(): JSX.Element {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:16}}>
      <div style={{gridColumn:'span 4'}}>
        <Card title="프리티어 사용량">
          <div style={{height:160,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
      <div style={{gridColumn:'span 8'}}>
        <Card title="비용 현황 & 증감 분석">
          <div style={{height:160,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
      <div style={{gridColumn:'span 12'}}>
        <Card title="리포트">
          <div style={{height:220,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
    </div>
  )
}


