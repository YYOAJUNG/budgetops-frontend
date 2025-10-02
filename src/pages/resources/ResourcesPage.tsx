import React from 'react'
import { Card } from '../../components/ui/Card'

export function ResourcesPage(): JSX.Element {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:16}}>
      <div style={{gridColumn:'span 6'}}>
        <Card title="CPU/메모리">
          <div style={{height:220,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
      <div style={{gridColumn:'span 6'}}>
        <Card title="스토리지/네트워크">
          <div style={{height:220,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
      <div style={{gridColumn:'span 12'}}>
        <Card title="자원 리스트">
          <div style={{height:260,border:'1px dashed rgba(255,255,255,0.2)',borderRadius:12}} />
        </Card>
      </div>
    </div>
  )
}


