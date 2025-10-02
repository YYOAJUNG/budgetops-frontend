import React, { useState } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export function AssistantPage(): JSX.Element {
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: '무엇을 도와드릴까요? 비용 절감, 리소스 최적화 질문을 해보세요.' }
  ])

  const onSend = () => {
    if (!input.trim()) return
    const user: Msg = { role: 'user', content: input }
    const reply: Msg = { role: 'assistant', content: '예상 절감: 월 $45. 사용하지 않는 인스턴스 3개 중지 제안합니다.' }
    setMsgs((m) => [...m, user, reply])
    setInput('')
  }

  return (
    <div className="h-[calc(100vh-56px-48px)] card p-0 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5 text-sm font-semibold">AI 어시스턴스</div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {msgs.map((m,i) => (
          <div key={i} className={`${m.role==='assistant' ? 'bg-blue-50 text-slate-900' : 'bg-slate-100'} rounded-xl px-3 py-2 max-w-[70%] ${m.role==='assistant' ? '' : 'ml-auto'}`}>{m.content}</div>
        ))}
      </div>
      <div className="p-3 border-t border-black/5 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="메시지를 입력하세요" className="flex-1 h-10 rounded-lg border border-black/10 px-3" />
        <button onClick={onSend} className="btn btn-primary">보내기</button>
      </div>
    </div>
  )
}


