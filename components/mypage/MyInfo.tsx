'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/api/user';

export function MyInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSave = () => {
    // TODO: API 호출로 사용자 정보 업데이트
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">내 정보</h2>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            편집
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              저장
            </Button>
          </div>
        )}
      </div>

      {/* 프로필 사진 */}
      <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{formData.name}</h3>
          <p className="text-gray-600">{formData.email}</p>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 border-gray-300 text-gray-700"
            >
              사진 변경
            </Button>
          )}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  이름
                </div>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  이메일
                </div>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
