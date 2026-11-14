'use client';

import { useMemo, useState } from 'react';
import { Activity, BarChart3, Bell, Bookmark, ChevronLeft, CircleHelp, LayoutDashboard, Newspaper, Search, Settings2, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';

type Section = 'overview' | 'stocks' | 'analysis' | 'watchlist' | 'news';
const nav: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'stocks', label: 'الأسهم', icon: BarChart3 },
  { id: 'analysis', label: 'التحليل الذكي', icon: Activity },
  { id: 'watchlist', label: 'قائمة المتابعة', icon: Bookmark },
  { id: 'news', label: 'الأخبار والإفصاحات', icon: Newspaper },
];

export default function Home() {
  const [section, setSection] = useState<Section>('overview');
  const [query, setQuery] = useState('');
  const current = useMemo(() => nav.find((item) => item.id === section), [section]);
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><TrendingUp size={23} /></div><div><strong>EGX <span>AI</span></strong><small>المحلل الذكي للبورصة</small></div></div>
        <div className="market-pill"><span className="pulse" /> السوق المصري <b>EGX</b></div>
        <nav className="nav-list" aria-label="القائمة الرئيسية">{nav.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${section === item.id ? 'active' : ''}`} onClick={() => setSection(item.id)}><Icon size={18} /><span>{item.label}</span>{section === item.id && <ChevronLeft size={16} className="nav-arrow" />}</button>; })}</nav>
        <div className="sidebar-bottom"><div className="secure-note"><ShieldCheck size={17} /><span>بيانات موثقة فقط<br/><small>لا نعرض أسعاراً غير مؤكدة</small></span></div><button className="nav-item"><Settings2 size={18}/><span>الإعدادات</span></button></div>
      </aside>
      <section className="main-area">
        <header className="topbar"><div><div className="eyebrow">منصة التحليل والاستثمار</div><h1>{current?.label ?? 'الرئيسية'}</h1></div><div className="top-actions"><button className="icon-btn" aria-label="التنبيهات"><Bell size={19}/></button><div className="avatar">م</div></div></header>
        <div className="content">
          <section className="welcome-card"><div className="welcome-copy"><div className="welcome-tag"><span className="pulse"/> إصدار جديد · Next</div><h2>قرارات استثمارية<br/><em>على أساس البيانات</em></h2><p>تابع أسهم البورصة المصرية، وافهم اتجاهات السوق من خلال أدوات تحليل واضحة ومصادر معلنة.</p><button className="primary-btn" onClick={() => setSection('stocks')}>استكشف الأسهم <ChevronLeft size={17}/></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="chart-symbol"><TrendingUp size={72}/></div><div className="float-card"><span>تحليل منضبط</span><b>بيانات أولاً</b><small>ثم التوصية</small></div></div></section>
          <div className="section-heading"><div><h3>نظرة عامة على السوق</h3><p>لن تظهر أرقام إلا بعد التحقق من مصدرها وتاريخها.</p></div><span className="status-chip"><span className="status-dot"/> في انتظار ربط البيانات</span></div>
          <div className="stats-grid"><article className="stat-card"><div className="stat-top"><span>مؤشر EGX30</span><BarChart3 size={18}/></div><strong className="muted-value">—</strong><small>غير متاح · لم يتم ربط المصدر</small></article><article className="stat-card"><div className="stat-top"><span>عدد الأسهم المغطاة</span><Activity size={18}/></div><strong className="muted-value">—</strong><small>سيتم تحميل القائمة الرسمية</small></article><article className="stat-card"><div className="stat-top"><span>آخر تحديث للأسعار</span><ShieldCheck size={18}/></div><strong className="stat-word">بانتظار الربط</strong><small>لن يتم عرض بيانات تجريبية</small></article></div>
          <section className="workspace-card"><div className="workspace-head"><div><h3>{section === 'stocks' ? 'دليل الأسهم' : 'ابدأ من هنا'}</h3><p>{section === 'stocks' ? 'ابحث بالاسم أو رمز التداول أو ISIN.' : 'كل أدوات المنصة في مكان واحد.'}</p></div><span className="outline-icon"><Search size={19}/></span></div>
            {section === 'stocks' ? <><div className="search-box"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن سهم بالاسم أو الرمز أو ISIN..."/><kbd>بحث</kbd></div><div className="empty-state"><div className="empty-icon"><BarChart3 size={25}/></div><b>قائمة الأسهم لم تُحمّل بعد</b><p>سيتم ربط الدليل الرسمي للبورصة المصرية أولاً، ثم عرض الأسهم وبياناتها مع تاريخ آخر تحديث.</p></div></> : <div className="quick-grid"><button onClick={() => setSection('stocks')}><BarChart3/><b>دليل الأسهم</b><small>بحث وتصفية الشركات</small></button><button onClick={() => setSection('analysis')}><Activity/><b>التحليل الفني</b><small>مؤشرات واتجاهات</small></button><button onClick={() => setSection('watchlist')}><Bookmark/><b>قائمة المتابعة</b><small>أسهمك المفضلة</small></button><button onClick={() => setSection('news')}><Newspaper/><b>الأخبار والإفصاحات</b><small>مصادر وتوقيتات واضحة</small></button></div>}
          </section>
          <footer><span>EGX AI Analyst Next</span><span><CircleHelp size={14}/> التحليل للمعلومات فقط وليس توصية مضمونة</span></footer>
        </div>
      </section>
    </main>
  );
}
