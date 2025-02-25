import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenAndAdmin } from './lib/auth'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const isLoginPage = request.nextUrl.pathname === '/'
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/')

    // 如果是认证相关的路由，直接放行
    if (isAuthRoute) {
        return NextResponse.next()
    }

    // 如果用户已登录且访问登录页面，重定向到dashboard
    if (isLoginPage && token) {
        const url = new URL('/dashboard', request.url)
        return NextResponse.redirect(url, {
            status: 302
        })
    }

    // 如果用户未登录且访问需要认证的页面，重定向到登录页面
    if (!token && !isLoginPage) {
        const url = new URL('/', request.url)
        return NextResponse.redirect(url, {
            status: 302
        })
    }

    // 检查管理员API路由的权限
    if (request.nextUrl.pathname.startsWith('/auth/admin/')) {
        const { isValid, error } = verifyTokenAndAdmin(token)

        if (!isValid) {
            return NextResponse.json(
                { error },
                { status: error === '未登录' ? 401 : 403 }
            )
        }
    }

    return NextResponse.next()
}

// 配置需要进行路由保护的路径
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/auth/admin/:path*',
        '/'
    ]
}