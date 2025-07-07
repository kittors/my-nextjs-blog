// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { appConfig, type Locale } from './src/lib/config';

const { locales, defaultLocale } = appConfig.language;

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore - negotiator 的类型定义可能与最新版本不完全匹配，但功能正常
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return match(languages, locales, defaultLocale);
}

/**
 * 核心重构：中间件现在将 'lang' cookie 作为语言状态的唯一可靠来源。
 *
 * 1.  **对于带语言前缀的路径**: 中间件的核心职责是确保 'lang' cookie
 * 与 URL 中的语言实时同步。这解决了在客户端导航到 404 页面时，
 * 语言状态落后一步的根本问题。
 *
 * 2.  **对于不带语言前缀的路径**: 逻辑保持不变，中间件会根据 cookie 或
 * 浏览器偏好来确定最佳语言，并重定向到相应的语言路径。
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 场景一：路径已包含语言前缀 (例如 /en/blog, /ja/about)
  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1] as Locale;

    // 创建一个响应对象，以便我们可以附加一个 cookie
    const response = NextResponse.next();

    // 核心修正：无论如何，都将 URL 中的当前语言更新到 cookie 中。
    // 这是确保语言状态始终正确的关键。
    response.cookies.set('lang', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30天
      sameSite: 'lax',
    });

    return response;
  }

  // 场景二：路径不包含语言前缀 (例如 /, /about)
  // 需要确定语言并进行重定向。
  const cookieLang = request.cookies.get('lang')?.value;
  let locale: Locale;

  if (cookieLang && locales.includes(cookieLang as Locale)) {
    locale = cookieLang as Locale;
  } else {
    locale = getLocale(request) as Locale;
  }

  const newPath = `/${locale}${pathname === '/' ? '' : pathname}`;
  const redirectUrl = new URL(newPath, request.url);
  const response = NextResponse.redirect(redirectUrl);

  // 在重定向的同时，设置语言 cookie
  response.cookies.set('lang', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
