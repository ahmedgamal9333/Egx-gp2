'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Bell, Bookmark, ChevronLeft, CircleHelp, LayoutDashboard, Newspaper, Search, Settings2, ShieldCheck, TrendingUp } from 'lucide-react';

type Section = 'overview' | 'stocks' | 'analysis' | 'watchlist' | 'news';
type Stock = { id: string; symbol: string; name: string; exchange: string; assetClass: string; status: string; page?: string | null };
type StockResponse = { ok: boolean; code?: string; message?: string; setup?: string; count?: number; updatedAt?: string; stocks?: Stock[] };
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
  const [market, setMarket] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/stocks').then((r) => r.json()).then((data: StockResponse) => {
      if (active) setMarket(data);
    }).catch(() => {
      if (active) setMarket({ ok: false, message: 'تعذر الاتصال بخدمة دليل الأسهم حالياً.' });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const current = useMemo(() => nav.find((item) => item.id === section), [section]);
  const filteredStocks = useMemo(() => (market?.stocks ?? []).filter((stock) =>
    [stock.symbol, stock.name, stock.id].some((value) => value.toLowerCase().includes(query.trim().toLowerCase()))
  ), [market, query]);
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
          <div className="section-heading"><div><h3>نظرة عامة على السوق</h3><p>الأسعار لا تظهر إلا بعد ربط مصدر موثوق والتحقق من توقيتها.</p></div><span className="status-chip"><span className={`status-dot ${market?.ok ? 'online' : ''}`}/>{loading ? 'جارٍ فحص مصدر البيانات' : market?.ok ? 'دليل الأسهم متصل' : 'مصدر الأسعار غير مهيأ'}</span></div>
          <div className="stats-grid"><article className="stat-card"><div className="stat-top"><span>مؤشر EGX30</span><BarChart3 size={18}/></div><strong className="muted-value">—</strong><small>لا توجد بيانات مؤشر موثقة بعد</small></article><article className="stat-card"><div className="stat-top"><span>عدد الأسهم في الدليل</span><Activity size={18}/></div><strong className="muted-value">{market?.ok ? market.count : '—'}</strong><small>{market?.ok ? 'سجل مزود البيانات' : 'بانتظار إعداد مفتاح المصدر'}</small></article><article className="stat-card"><div className="stat-top"><span>آخر فحص للمصدر</span><ShieldCheck size={18}/></div><strong className="stat-word">{loading ? 'جارٍ الفحص' : market?.ok ? 'متصل' : 'غير متصل'}</strong><small>{market?.updatedAt ? new Date(market.updatedAt).toLocaleString('ar-EG') : 'لم يتم تحميل بيانات أسعار'}</small></article></div>
          <section className="workspace-card"><div className="workspace-head"><div><h3>{section === 'stocks' ? 'دليل الأسهم' : 'ابدأ من هنا'}</h3><p>{section === 'stocks' ? 'بحث بالاسم أو رمز التداول أو كود الورقة المالية.' : 'كل أدوات المنصة في مكان واحد.'}</p></div><span className="outline-icon"><Search size={19}/></span></div>
            {section === 'stocks' ? <><div className="search-box"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن سهم بالاسم أو الرمز أو ISIN..."/><kbd>{filteredStocks.length}</kbd></div>
              {loading ? <div className="empty-state"><div className="empty-icon"><Activity size={25}/></div><b>جارٍ تحميل دليل الأسهم</b><p>يتم الاتصال بمزود البيانات من الخادم.</p></div> : market?.ok ? <div className="stock-list">{filteredStocks.map((stock) => <article className="stock-row" key={stock.id}><div><b>{stock.name}</b><small>{stock.id} · {stock.assetClass}</small></div><strong>{stock.symbol}</strong></article>)}{filteredStocks.length === 0 && <div className="empty-state"><b>لا توجد نتائج مطابقة</b><p>جرّب البحث باسم الشركة أو رمزها أو كودها.</p></div>}</div> : <div className="empty-state"><div className="empty-icon"><ShieldCheck size={25}/></div><b>{market?.message ?? 'دليل الأسهم غير متاح حالياً'}</b><p>{market?.setup ?? 'لم يتم عرض قائمة غير مكتملة أو أسعار تجريبية. يلزم تهيئة مزود بيانات مرخص أولاً.'}</p><a className="source-link" href="https://datacedar.com/docs" target="_blank" rel="noreferrer">مواصفات واجهة مزود البيانات</a></div>}
            </> : <div className="quick-grid"><button onClick={() => setSection('stocks')}><BarChart3/><b>دليل الأسهم</b><small>بحث وتصفية الشركات</small></button><button onClick={() => setSection('analysis')}><Activity/><b>التحليل الفني</b><small>مؤشرات واتجاهات</small></button><button onClick={() => setSection('watchlist')}><Bookmark/><b>قائمة المتابعة</b><small>أسهمك المفضلة</small></button><button onClick={() => window.location.assign('/radar')}><TrendingUp/><b>ماسح الصعود المبكر</b><small>اكتشاف الإشارات قبل الحركة</small></button><button onClick={() => setSection('news')}><Newspaper/><b>الأخبار والإفصاحات</b><small>مصادر وتوقيتات واضحة</small></button></div>}
          </section>
          <footer><span>EGX AI Analyst Next</span><span><CircleHelp size={14}/> التحليل للمعلومات فقط وليس توصية مضمونة</span></footer>
        </div>
      </section>
    </main>
  );
}
