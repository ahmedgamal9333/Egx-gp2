import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EGX AI Analyst | المحلل الذكي للبورصة المصرية',
  description: 'منصة متابعة وتحليل أسهم البورصة المصرية ببيانات موثقة ومؤرخة.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
