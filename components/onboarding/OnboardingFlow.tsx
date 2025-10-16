// 'use client';

// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useRouter } from 'next/navigation';
// import { CheckCircle, ArrowRight } from 'lucide-react';

// export function OnboardingFlow() {
//   const [step, setStep] = useState(1);
//   const [tenantName, setTenantName] = useState('');
//   const router = useRouter();

//   const handleNext = () => {
//     if (step === 1) {
//       setStep(2);
//     } else {
//       router.push('/accounts');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
//       <div className="w-full max-w-md space-y-8">
//         {/* 로고 및 제목 */}
//         <div className="text-center">
//           <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
//             <div className="mx-auto h-16 w-16 rounded-full bg-[#eef2f9] border border-slate-200 flex items-center justify-center mb-4">
//               <span className="text-2xl font-bold text-slate-600">B</span>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900">BudgetOps</h1>
//             <p className="mt-2 text-sm text-gray-600">Multi-Cloud Cost Management Platform</p>
//           </Link>
//         </div>

//         <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//           <CardHeader className="space-y-1 pb-6">
//             <CardTitle className="text-2xl font-semibold text-center">설정</CardTitle>
//             <CardDescription className="text-center text-gray-600">
//               단계 {step}/2
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {step === 1 ? (
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="tenant" className="text-sm font-medium text-gray-700">프로젝트/테넌트 이름</Label>
//                   <Input
//                     id="tenant"
//                     placeholder="예: 메인 프로젝트"
//                     value={tenantName}
//                     onChange={(e) => setTenantName(e.target.value)}
//                     className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>
//                 <Button 
//                   onClick={handleNext} 
//                   disabled={!tenantName.trim()}
//                   className="w-full h-11 bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300"
//                 >
//                   다음 단계
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-4 text-center">
//                 <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
//                 <h3 className="text-lg font-semibold text-gray-900">프로젝트가 생성되었습니다!</h3>
//                 <p className="text-gray-600">
//                   이제 클라우드 계정을 연결하여 비용 데이터를 수집할 수 있습니다.
//                 </p>
//                 <Button 
//                   onClick={handleNext} 
//                   className="w-full h-11 bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300"
//                 >
//                   계정 연결하기
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import Link from 'next/link'; // ✅ 추가
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowRight } from 'lucide-react';

export function OnboardingFlow() {
  const [step, setStep] = useState<number>(1);
  const [tenantName, setTenantName] = useState<string>('');
  const router = useRouter();

  const handleNext = () => {
    if (step === 1) setStep(2);
    else router.push('/accounts');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#eef2f9] border border-slate-200 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-slate-600">B</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">BudgetOps</h1>
            <p className="mt-2 text-sm text-gray-600">Multi-Cloud Cost Management Platform</p>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">설정</CardTitle>
            <CardDescription className="text-center text-gray-600">단계 {step}/2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant" className="text-sm font-medium text-gray-700">
                    프로젝트/테넌트 이름
                  </Label>
                  <Input
                    id="tenant"
                    placeholder="예: 메인 프로젝트"
                    value={tenantName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTenantName(e.target.value)
                    } // ✅ 타입 지정
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={handleNext}
                  disabled={!tenantName.trim()}
                  className="w-full h-11 bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300"
                >
                  다음 단계
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">프로젝트가 생성되었습니다!</h3>
                <p className="text-gray-600">이제 클라우드 계정을 연결하여 비용 데이터를 수집할 수 있습니다.</p>
                <Button
                  onClick={handleNext}
                  className="w-full h-11 bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300"
                >
                  계정 연결하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
