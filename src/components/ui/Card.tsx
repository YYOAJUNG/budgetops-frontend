import React from 'react'
import './card.css'

type CardProps = {
  title?: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps): JSX.Element {
  return (
    <section className="card">
      {title ? <div className="card-title">{title}</div> : null}
      <div className="card-body">{children}</div>
    </section>
  )
}


