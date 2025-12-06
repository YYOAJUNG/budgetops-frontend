'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { getFeedbackData, calculateSatisfactionStats, type FeedbackResponse } from '@/lib/api/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, MessageSquare, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SatisfactionStats({ data }: { data: FeedbackResponse[] }) {
  const stats = calculateSatisfactionStats(data);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">평균 만족도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-bold">{stats.average}</span>
            <span className="text-gray-500">/ 5</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">총 {stats.total}개 응답</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">만족도 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{rating}점</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}명</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">응답 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">긍정 피드백</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {data.filter(d => d.positivePoints?.trim()).length}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">개선 요청</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {data.filter(d => d.negativePoints?.trim()).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackList({ data }: { data: FeedbackResponse[] }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // 한국어 날짜 형식 파싱: "2025. 11. 6 오후 7:13:31"
      const koreanDateMatch = dateString.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\s*(오전|오후)\s*(\d{1,2}):(\d{2}):(\d{2})/);
      
      if (koreanDateMatch) {
        const [, year, month, day, ampm, hour, minute] = koreanDateMatch;
        let hour24 = parseInt(hour);
        if (ampm === '오후' && hour24 !== 12) {
          hour24 += 12;
        } else if (ampm === '오전' && hour24 === 12) {
          hour24 = 0;
        }
        
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          hour24,
          parseInt(minute)
        );
        
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      
      // ISO 형식 또는 다른 형식 시도
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      
      // 파싱 실패 시 원본 반환
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {data.map((feedback, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                응답 #{index + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{feedback.satisfaction}</span>
                <span className="text-sm text-gray-500">/ 5</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(feedback.timestamp)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.positivePoints && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">가장 마음에 드는 점</span>
                </div>
                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-md">
                  {feedback.positivePoints}
                </p>
              </div>
            )}
            {feedback.negativePoints && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">불편한 점</span>
                </div>
                <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-md">
                  {feedback.negativePoints}
                </p>
              </div>
            )}
            {feedback.additionalComments && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">기타 의견</span>
                </div>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                  {feedback.additionalComments}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['feedbackData'],
    queryFn: getFeedbackData,
    refetchInterval: 30000, // 30초마다 새로고침
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600">피드백 데이터를 불러오는 중 오류가 발생했습니다.</p>
          {error instanceof Error && <p className="text-sm text-gray-500 mt-2">{error.message}</p>}
        </div>
      </AdminLayout>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">피드백 데이터가 없습니다.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">피드백</h1>
          <p className="text-gray-600 mt-1">사용자 피드백을 확인하고 분석할 수 있습니다.</p>
        </div>

        {/* 통계 대시보드 */}
        <SatisfactionStats data={data} />

        {/* 상세 피드백 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 피드백</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="positive">긍정 피드백</TabsTrigger>
                <TabsTrigger value="negative">개선 요청</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <FeedbackList data={data} />
              </TabsContent>
              <TabsContent value="positive" className="mt-4">
                <FeedbackList data={data.filter(d => d.positivePoints?.trim())} />
              </TabsContent>
              <TabsContent value="negative" className="mt-4">
                <FeedbackList data={data.filter(d => d.negativePoints?.trim())} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
