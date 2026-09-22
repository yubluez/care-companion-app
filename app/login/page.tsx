'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const nextParam = searchParams.get('next');

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(errorParam);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = user.user_metadata?.role;
          if (nextParam) {
            router.replace(nextParam);
            return;
          }
          if (role === 'customer') {
            router.replace('/customer');
            return;
          } else if (role === 'companion') {
            router.replace('/companion');
            return;
          } else {
            router.replace('/onboarding/role');
            return;
          }
        }
      } catch (err) {
        console.error('Check auth error:', err);
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [router, nextParam]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const supabase = createClient();
      const redirectUrl = new URL('/auth/callback', window.location.origin);
      if (nextParam) {
        redirectUrl.searchParams.set('next', nextParam);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      }
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl border border-sky-100 shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-sky-600 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-3xl mb-4 shadow-md shadow-sky-200">
          CC
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ยินดีต้อนรับสู่ Care Companion</h2>
        <p className="text-slate-600 text-base mb-6">กรุณาเข้าสู่ระบบด้วย Google Account เพื่อความปลอดภัย</p>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl text-left flex items-start gap-2">
            <span className="text-rose-500 font-bold">⚠️</span>
            <div>
              <p className="font-semibold">เข้าสู่ระบบไม่สำเร็จ</p>
              <p className="text-rose-600 text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-300 hover:border-sky-600 hover:bg-sky-50 active:scale-[0.98] text-slate-800 font-bold py-3.5 px-4 rounded-2xl transition duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-sky-700">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>กำลังเชื่อมต่อกับ Google...</span>
            </div>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}