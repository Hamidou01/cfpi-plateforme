import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value, options)
          })
          // On s'assure que la réponse est mise à jour avec les nouveaux cookies
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 1. On récupère l'utilisateur de manière ultra-sécurisée
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Si pas de user ou erreur de session -> Retour login
    if (!user || userError) {
      console.log("❌ Middleware: Session non trouvée, redirection login.");
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. On récupère le rôle
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Si pas admin -> Retour dashboard
    if (profile?.role !== 'admin') {
      console.log("🚫 Middleware: Rôle insuffisant (" + profile?.role + "), redirection dashboard.");
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    console.log("✅ Middleware: Accès Admin autorisé pour", user.email);
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}