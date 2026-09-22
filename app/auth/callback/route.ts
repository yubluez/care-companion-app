import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('OAuth callback error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();

      let destination = '/onboarding/role';

      if (user) {
        let role = user.user_metadata?.role;

        if (!role) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            if (profile?.role) {
              role = profile.role;
            }
          } catch {
            // profiles table may not exist
          }
        }

        if (role === 'customer') {
          destination = '/customer';
        } else if (role === 'companion') {
          destination = '/companion';
        } else {
          destination = '/onboarding/role';
        }

        // If user already has a role and requested a specific page
        const requestedNext = searchParams.get('next');
        if (requestedNext && requestedNext !== '/' && requestedNext !== '/onboarding/role' && role) {
          destination = requestedNext;
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    } else {
      console.error('Exchange code error:', exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
