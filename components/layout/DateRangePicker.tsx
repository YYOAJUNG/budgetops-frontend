'use client';

import * as React from 'react';
import { useContextStore } from '@/store/context';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import dayjs from 'dayjs';

export function DateRangePicker() {
  const { from, to, setDateRange } = useContextStore();
  const [draftFrom, setDraftFrom] = React.useState(from);
  const [draftTo, setDraftTo] = React.useState(to);

  const handlePreset = (days: number) => {
    const end = dayjs().format('YYYY-MM-DD');
    const start = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    setDateRange(start, end);
  };

  const handlePrevious = () => {
    const days = dayjs(to).diff(dayjs(from), 'day');
    const newEnd = dayjs(from).subtract(1, 'day').format('YYYY-MM-DD');
    const newStart = dayjs(newEnd).subtract(days, 'day').format('YYYY-MM-DD');
    setDateRange(newStart, newEnd);
  };

  const handleNext = () => {
    const days = dayjs(to).diff(dayjs(from), 'day');
    const newStart = dayjs(to).add(1, 'day').format('YYYY-MM-DD');
    const newEnd = dayjs(newStart).add(days, 'day').format('YYYY-MM-DD');
    setDateRange(newStart, newEnd);
  };

  React.useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
  }, [from, to]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" aria-label="이전 구간" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" aria-label="다음 구간" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="inline-flex rounded-full bg-slate-100 p-1">
        {[7, 30, 90].map((day) => (
          <Button
            key={day}
            size="sm"
            variant="ghost"
            className="rounded-full px-3 text-xs text-slate-600 hover:bg-white"
            onClick={() => handlePreset(day)}
          >
            {day}일
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm">
        <Calendar className="h-4 w-4 text-slate-500" />
        <Input aria-label="시작일" type="date" value={draftFrom} onChange={(e)=>setDraftFrom(e.target.value)} className="h-8 w-36 rounded-full border-0 bg-white" />
        <span className="text-slate-400">~</span>
        <Input aria-label="종료일" type="date" value={draftTo} onChange={(e)=>setDraftTo(e.target.value)} className="h-8 w-36 rounded-full border-0 bg-white" />
        <Button size="sm" className="rounded-full bg-sky-600 text-white hover:bg-sky-700" onClick={()=> setDateRange(draftFrom, draftTo)}>적용</Button>
      </div>
    </div>
  );
}
