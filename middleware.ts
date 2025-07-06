// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './src/i18n-config';

const { locales, defaultLocale } = i18n;

/**
 * 从请求头中解析出最匹配的语言区域设置。
 * 遵循原子设计原则，这是一个纯粹的功能单元，其唯一职责是语言协商。
 * @param {NextRequest} request - Next.js 请求对象。
 * @returns {string} - 计算出的最佳语言环境字符串 (例如 'en' 或 'zh')。
 */
function getLocale(request: NextRequest): string {
  // 从请求头中提取 'Accept-Language'，这是浏览器告诉服务器其偏好语言的方式。
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // 使用 negotiator 库解析出语言列表。
  // @ts-ignore - negotiator 的类型定义存在一个已知的小问题，此处忽略以确保平稳运行。
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  // 使用 @formatjs/intl-localematcher 从我们的支持语言列表中，
  // 找到与用户偏好列表最匹配的一项。
  return match(languages, locales, defaultLocale);
}

/**
 * Next.js 中间件，用于处理国际化 (i18n) 路由。
 * 它的核心职责是拦截不带语言前缀的请求，并将其重定向到正确的语言路径。
 * @param {NextRequest} request - Next.js 请求对象。
 * @returns {NextResponse | undefined} - 如果需要重定向，则返回一个 NextResponse 对象；否则不返回任何内容。
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. 检查路径是否已包含语言前缀 (例如 /en/blog, /zh)。
  // 如果是，说明路由正确，无需任何操作，中间件直接放行。
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  // 2. 确定用户的最佳语言。
  // 优先从 cookie 中读取用户上次访问时选择的语言。
  const cookieLang = request.cookies.get('lang')?.value;
  let locale: string;

  if (cookieLang && locales.includes(cookieLang as any)) {
    locale = cookieLang;
  } else {
    // 如果没有有效的 cookie，则根据请求头的 'Accept-Language' 进行协商。
    locale = getLocale(request);
  }

  // 3. 构建新的重定向 URL 并执行重定向。
  // 核心优化：对根路径 ('/') 进行特殊处理，避免生成 '/zh/' 这样的尾部斜杠路径。
  const newPath = `/${locale}${pathname === '/' ? '' : pathname}`;
  const redirectUrl = new URL(newPath, request.url);

  const response = NextResponse.redirect(redirectUrl);

  // 为了提升后续访问体验，将用户选择的语言存入 cookie，有效期 30 天。
  response.cookies.set('lang', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30天
    sameSite: 'lax',
  });

  return response;
}

/**
 * 中间件的配置对象。
 */
export const config = {
  // 'matcher' 定义了哪些路径需要经过此中间件的处理。
  // 这个正则表达式的含义是：匹配所有路径，除了：
  // - 以 /api/ 开头的路径 (API 路由)
  // - 以 /_next/static/ 开头的路径 (Next.js 静态资源)
  // - 以 /_next/image/ 开头的路径 (Next.js 图片优化)
  // - 包含 '.' 的路径 (通常是静态文件，如 favicon.ico, sitemap.xml 等)
  // 这种方式比在函数体内进行判断更高效。
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
