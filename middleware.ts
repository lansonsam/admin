import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isLoginPage = request.nextUrl.pathname === '/'

    // 如果用户访问登录页面且已经有token，重定向到dashboard
    if (isLoginPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 如果用户访问需要认证的页面但没有token，重定向到登录页面
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// 配置需要进行路由保护的路径
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/'
    ]
}