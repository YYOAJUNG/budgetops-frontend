'use client';

import { useContextStore } from '@/store/context';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

export function DateRangePicker() {
  const { from, to, setDateRange } = useContextStore();

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

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={handlePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        <Button variant="outline" size="sm" onClick={() => handlePreset(7)}>
          7일
        </Button>
        <Button variant="outline" size="sm" onClick={() => handlePreset(30)}>
          30일
        </Button>
        <Button variant="outline" size="sm" onClick={() => handlePreset(90)}>
          90일
        </Button>
      </div>

      <div className="flex items-center space-x-2 px-3 py-1 text-sm border rounded-md">
        <Calendar className="h-4 w-4" />
        <span>{dayjs(from).format('MM/DD')} - {dayjs(to).format('MM/DD')}</span>
      </div>

      <Button variant="outline" size="sm" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
