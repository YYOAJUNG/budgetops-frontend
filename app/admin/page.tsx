import { redirect } from 'next/navigation';

export default function AdminPage() {
  // 관리자 페이지 기본 경로는 사용자 관리로 리다이렉트
  redirect('/admin/users');
}

