import React from 'react'
import './kpi.css'

type KPIProps = {
  label: string
  value: string
  hint?: string
}

export function KPI({ label, value, hint }: KPIProps): JSX.Element {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {hint ? <div className="kpi-hint">{hint}</div> : null}
    </div>
  )
}


