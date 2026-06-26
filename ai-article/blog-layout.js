/* =============================================================
   TechNext Blog — Layout Engine v2
   Right sidebar: TOC + Share card  |  Below: Recommended grid
   ============================================================= */

const ARTICLES = [
  { title: "GPT-5: OpenAI's Most Capable Agentic AI Model Yet",            url: "gpt5-openai-agentic-ai-2025.html",            img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=225&fit=crop&q=80", cat: "AI & Tech",   date: "May 2, 2026"  },
  { title: "Big Tech AI Infrastructure Spending: Q1 2026 Earnings",         url: "big-tech-ai-infrastructure-2026.html",         img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop&q=80",  cat: "AI & Tech",   date: "May 2, 2026"  },
  { title: "LG and NVIDIA: The Physical AI Era Has Officially Begun",       url: "lg-nvidia-physical-ai-era.html",               img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop&q=80", cat: "AI & Tech",   date: "May 2, 2026"  },
  { title: "AI Agent Governance: Regulators Are Flagging Control Gaps",     url: "ai-agent-governance-2025.html",                img: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=225&fit=crop&q=80", cat: "AI & Tech",   date: "May 2, 2026"  },
  { title: "GitHub Copilot Moves to Per-Token Pricing",                     url: "github-copilot-per-token-pricing.html",        img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&q=80",  cat: "AI & Tech",   date: "May 2, 2026"  },
  { title: "AI Agents in 2026: Reshaping Enterprise Operations",            url: "ai-agents-enterprise-automation.html",         img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop&q=80", cat: "AI & Tech",   date: "Apr 28, 2026" },
  { title: "RAG Systems for Enterprise: The Complete Guide",                url: "rag-systems-enterprise-guide.html",            img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop&q=80",  cat: "AI & Tech",   date: "Apr 25, 2026" },
  { title: "Local LLM Deployment: Running AI On-Premise",                   url: "local-llm-on-premise-enterprise.html",         img: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=225&fit=crop&q=80",  cat: "AI & Tech",   date: "Apr 22, 2026" },
  { title: "Context Engineering: The New Discipline for AI Systems",        url: "context-engineering-new-discipline.html",      img: "https://images.unsplash.com/photo-1673875824513-a07bbbf0e8f7?w=400&h=225&fit=crop&q=80", cat: "AI & Tech",   date: "Apr 18, 2026" },
  { title: "Odoo 18: New Features and the Enterprise Upgrade Decision",     url: "odoo-18-features-upgrade-guide.html",          img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop&q=80", cat: "Odoo ERP",    date: "Apr 15, 2026" },
  { title: "Integrating AI with Odoo ERP: Implementation Guide",           url: "odoo-ai-integration-guide.html",               img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&q=80",  cat: "Odoo ERP",    date: "Apr 12, 2026" },
  { title: "Odoo vs SAP in 2026: Which ERP Is Right for You?",             url: "odoo-vs-sap-enterprise-comparison.html",       img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop&q=80", cat: "Odoo ERP",    date: "Apr 8, 2026"  },
  { title: "Why Southeast Asian SMEs Are Switching to Odoo ERP",           url: "odoo-erp-sme-southeast-asia.html",             img: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=225&fit=crop&q=80",  cat: "Odoo ERP",    date: "Apr 5, 2026"  },
  { title: "Vietnam's Digital Economy in 2026: AI Accelerates",             url: "vietnam-digital-economy-ai-2026.html",         img: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400&h=225&fit=crop&q=80",  cat: "Vietnam",     date: "Apr 28, 2026" },
  { title: "Vietnam's Tech Talent: Why Global Companies Build Dev Hubs",    url: "vietnam-tech-talent-dev-hub.html",             img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop&q=80", cat: "Vietnam",     date: "Apr 20, 2026" },
  { title: "Vietnam Software Exports Hit $8B: Becoming an AI Powerhouse",  url: "vietnam-software-exports-2026.html",           img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop&q=80", cat: "Vietnam",     date: "Apr 10, 2026" },
  { title: "Singapore's National AI Strategy 2.0: What to Know",           url: "singapore-national-ai-strategy-2026.html",     img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=225&fit=crop&q=80", cat: "Singapore",   date: "May 5, 2026"  },
  { title: "Singapore Smart Nation: AI Transforming Government Services",   url: "singapore-smart-nation-enterprise-ai.html",   img: "https://images.unsplash.com/photo-1570867765124-6a22e6631823?w=400&h=225&fit=crop&q=80", cat: "Singapore",   date: "Apr 30, 2026" },
  { title: "Philippines Digital Transformation 2026: AI Beyond BPO",       url: "philippines-digital-transformation-2026.html", img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=225&fit=crop&q=80", cat: "Philippines", date: "May 8, 2026"  },
  { title: "The Philippines BPO Industry's AI Revolution",                  url: "philippines-bpo-ai-revolution.html",           img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop&q=80", cat: "Philippines", date: "May 1, 2026"  },
];

/* ── filename → translation key (add new articles here) ── */
const FILE_KEY_MAP = {
  'gpt5-openai-agentic-ai-2025.html':            'c1_t',
  'big-tech-ai-infrastructure-2026.html':         'c2_t',
  'lg-nvidia-physical-ai-era.html':               'c3_t',
  'ai-agent-governance-2025.html':                'c4_t',
  'github-copilot-per-token-pricing.html':        'c5_t',
  'ai-agents-enterprise-automation.html':         'c6_t',
  'rag-systems-enterprise-guide.html':            'c7_t',
  'local-llm-on-premise-enterprise.html':         'c8_t',
  'context-engineering-new-discipline.html':      'c9_t',
  'odoo-18-features-upgrade-guide.html':          'c10_t',
  'odoo-ai-integration-guide.html':               'c11_t',
  'odoo-vs-sap-enterprise-comparison.html':       'c12_t',
  'odoo-erp-sme-southeast-asia.html':             'c13_t',
  'vietnam-digital-economy-ai-2026.html':         'c14_t',
  'vietnam-tech-talent-dev-hub.html':             'c15_t',
  'vietnam-software-exports-2026.html':           'c16_t',
  'singapore-national-ai-strategy-2026.html':     'c17_t',
  'singapore-smart-nation-enterprise-ai.html':    'c18_t',
  'philippines-digital-transformation-2026.html': 'c19_t',
  'philippines-bpo-ai-revolution.html':           'c20_t',
};

/* ── badge text → translation key ── */
const CAT_KEY_MAP = {
  'AI & Tech':   'cat_ai',
  'Odoo ERP':    'cat_odoo',
  'Vietnam':     'cat_vn',
  'Singapore':   'cat_sg',
  'Philippines': 'cat_ph',
};

const BLOG_LANG = {
  en: {
    nav_about:'About', nav_gallery:'Gallery', nav_blog:'Blog', nav_careers:'Careers', nav_contact:'Contact', nav_book:'Book Now',
    back_blog:'← Back to Blog',
    toc_label:'In This Article',
    share_label:'Share This Article',
    more_articles:'More Articles',
    copy_link:'Copy Link',
    copied:'Copied!',
    cat_ai:'AI &amp; Tech', cat_odoo:'Odoo ERP', cat_vn:'Vietnam', cat_sg:'Singapore', cat_ph:'Philippines',
    c1_t:"GPT-5: OpenAI's Most Capable Agentic AI Model Yet",
    c2_t:"Big Tech AI Infrastructure Spending: Q1 2026 Earnings Breakdown",
    c3_t:"LG and NVIDIA: The Physical AI Era Has Officially Begun",
    c4_t:"AI Agent Governance: Regulators Are Finally Flagging Control Gaps",
    c5_t:"GitHub Copilot Moves to Per-Token Pricing — What It Means for Dev Teams",
    c6_t:"AI Agents in 2026: How Autonomous AI is Reshaping Enterprise Operations",
    c7_t:"RAG Systems for Enterprise: The Complete Implementation Guide",
    c8_t:"Local LLM Deployment: Running AI On-Premise for Enterprise Security",
    c9_t:"Context Engineering: The New Discipline That Makes AI Systems Actually Work",
    c10_t:"Odoo 18: New Features and the Enterprise Upgrade Decision",
    c11_t:"Integrating AI with Odoo ERP: A Step-by-Step Implementation Guide",
    c12_t:"Odoo vs SAP in 2026: Which ERP Is Right for Your Business?",
    c13_t:"Why Southeast Asian SMEs Are Switching to Odoo ERP in 2026",
    c14_t:"Vietnam's Digital Economy in 2026: AI Adoption Accelerates Across Industries",
    c15_t:"Vietnam's Tech Talent: Why Global Companies Are Building Dev Hubs Here",
    c16_t:"Vietnam Software Exports Hit $8B: How the Country is Becoming an AI Powerhouse",
    c17_t:"Singapore's National AI Strategy 2.0: What Every Enterprise Needs to Know",
    c18_t:"Singapore Smart Nation: How AI is Transforming Government and Enterprise Services",
    c19_t:"Philippines Digital Transformation 2026: AI Adoption Beyond BPO",
    c20_t:"The Philippines BPO Industry's AI Revolution: From Headcount to Intelligence",
  },
  vn: {
    nav_about:'Giới Thiệu', nav_gallery:'Thư Viện', nav_blog:'Blog', nav_careers:'Tuyển Dụng', nav_contact:'Liên Hệ', nav_book:'Đặt Lịch',
    back_blog:'← Về Blog',
    toc_label:'Trong Bài Viết Này',
    share_label:'Chia Sẻ Bài Viết',
    more_articles:'Bài Viết Khác',
    copy_link:'Sao Chép Liên Kết',
    copied:'Đã Sao Chép!',
    cat_ai:'AI &amp; Công Nghệ', cat_odoo:'Odoo ERP', cat_vn:'Việt Nam', cat_sg:'Singapore', cat_ph:'Philippines',
    c1_t:'GPT-5: Mô Hình AI Tác Nhân Mạnh Nhất của OpenAI Từ Trước Đến Nay',
    c2_t:'Chi Tiêu Hạ Tầng AI của Big Tech: Phân Tích Kết Quả Q1 2026',
    c3_t:'LG và NVIDIA: Kỷ Nguyên AI Vật Lý Đã Chính Thức Bắt Đầu',
    c4_t:'Quản Trị AI Tác Nhân: Cơ Quan Quản Lý Chỉ Ra Lỗ Hổng Kiểm Soát',
    c5_t:'GitHub Copilot Chuyển Sang Tính Phí Theo Token — Ý Nghĩa Với Các Nhóm Dev',
    c6_t:'AI Tác Nhân Năm 2026: Cách AI Tự Động Định Hình Lại Hoạt Động Doanh Nghiệp',
    c7_t:'Hệ Thống RAG Cho Doanh Nghiệp: Hướng Dẫn Triển Khai Toàn Diện',
    c8_t:'Triển Khai LLM Cục Bộ: Chạy AI On-Premise Để Bảo Mật Doanh Nghiệp',
    c9_t:'Kỹ Thuật Ngữ Cảnh: Kỷ Luật Mới Giúp Hệ Thống AI Thực Sự Hoạt Động',
    c10_t:'Odoo 18: Tính Năng Mới Và Quyết Định Nâng Cấp Cho Doanh Nghiệp',
    c11_t:'Tích Hợp AI Với Odoo ERP: Hướng Dẫn Triển Khai Từng Bước',
    c12_t:'Odoo vs SAP Năm 2026: Phần Mềm ERP Nào Phù Hợp Với Doanh Nghiệp Của Bạn?',
    c13_t:'Tại Sao Doanh Nghiệp Vừa Và Nhỏ Đông Nam Á Chuyển Sang Odoo ERP Năm 2026',
    c14_t:'Kinh Tế Số Việt Nam Năm 2026: Ứng Dụng AI Tăng Tốc Trên Các Ngành',
    c15_t:'Nhân Tài Công Nghệ Việt Nam: Lý Do Các Công Ty Toàn Cầu Xây Dev Hub Tại Đây',
    c16_t:'Xuất Khẩu Phần Mềm Việt Nam Đạt 8 Tỷ USD: Hành Trình Trở Thành Cường Quốc AI',
    c17_t:'Chiến Lược AI Quốc Gia Singapore 2.0: Điều Mỗi Doanh Nghiệp Cần Biết',
    c18_t:'Singapore Smart Nation: AI Chuyển Đổi Dịch Vụ Chính Phủ Và Doanh Nghiệp',
    c19_t:'Chuyển Đổi Số Philippines 2026: Ứng Dụng AI Vượt Ra Ngoài BPO',
    c20_t:'Cuộc Cách Mạng AI Trong Ngành BPO Philippines: Từ Nhân Lực Đến Trí Tuệ',
  },
  ph: {
    nav_about:'Tungkol', nav_gallery:'Galeria', nav_blog:'Blog', nav_careers:'Karera', nav_contact:'Makipag-ugnayan', nav_book:'Mag-book',
    back_blog:'← Bumalik sa Blog',
    toc_label:'Sa Artikulong Ito',
    share_label:'Ibahagi ang Artikulo',
    more_articles:'Higit pang Artikulo',
    copy_link:'Kopyahin ang Link',
    copied:'Nakopya!',
    cat_ai:'AI &amp; Tech', cat_odoo:'Odoo ERP', cat_vn:'Vietnam', cat_sg:'Singapore', cat_ph:'Pilipinas',
    c1_t:"GPT-5: Pinaka-Capable na Agentic AI Model ng OpenAI",
    c2_t:"Paggastos ng Big Tech sa AI Infrastructure: Q1 2026 Earnings Breakdown",
    c3_t:"LG at NVIDIA: Opisyal Nang Nagsimula ang Physical AI Era",
    c4_t:"AI Agent Governance: Tinutukoy ng mga Regulator ang mga Control Gap",
    c5_t:"GitHub Copilot Lumipat sa Per-Token Pricing — Ano ang Ibig Sabihin Para sa Dev Teams",
    c6_t:"AI Agents sa 2026: Paano Binabago ng Autonomous AI ang Enterprise Operations",
    c7_t:"RAG Systems para sa Enterprise: Ang Kumpletong Implementation Guide",
    c8_t:"Local LLM Deployment: Pagpapatakbo ng AI On-Premise para sa Enterprise Security",
    c9_t:"Context Engineering: Ang Bagong Disiplina na Nagpapatakbo ng AI Systems",
    c10_t:"Odoo 18: Mga Bagong Feature at ang Enterprise Upgrade Decision",
    c11_t:"Pag-integrate ng AI sa Odoo ERP: Step-by-Step Implementation Guide",
    c12_t:"Odoo vs SAP sa 2026: Alin ang Tamang ERP para sa Inyong Negosyo?",
    c13_t:"Bakit Lumalipat ang mga SME sa Southeast Asia sa Odoo ERP sa 2026",
    c14_t:"Digital Economy ng Vietnam sa 2026: Nagbibilis ang AI Adoption sa Lahat ng Industriya",
    c15_t:"Tech Talent ng Vietnam: Bakit Nagtatayo ang mga Global na Kumpanya ng Dev Hubs Dito",
    c16_t:"Vietnam Software Exports Umabot sa $8B: Pagiging AI Powerhouse ng Bansa",
    c17_t:"National AI Strategy 2.0 ng Singapore: Ano ang Kailangan Malaman ng Bawat Enterprise",
    c18_t:"Singapore Smart Nation: Paano Binabago ng AI ang Mga Serbisyo ng Gobyerno at Negosyo",
    c19_t:"Digital Transformation ng Pilipinas 2026: AI Adoption Higit Pa sa BPO",
    c20_t:"AI Revolution ng BPO Industry ng Pilipinas: Mula sa Headcount Patungong Intelligence",
  },
  de: {
    nav_about:'Über Uns', nav_gallery:'Galerie', nav_blog:'Blog', nav_careers:'Karriere', nav_contact:'Kontakt', nav_book:'Termin Buchen',
    back_blog:'← Zurück zum Blog',
    toc_label:'In diesem Artikel',
    share_label:'Artikel teilen',
    more_articles:'Weitere Artikel',
    copy_link:'Link kopieren',
    copied:'Kopiert!',
    cat_ai:'KI &amp; Technologie', cat_odoo:'Odoo ERP', cat_vn:'Vietnam', cat_sg:'Singapur', cat_ph:'Philippinen',
    c1_t:'GPT-5: OpenAIs fähigstes agentisches KI-Modell bisher',
    c2_t:'KI-Infrastrukturausgaben der Tech-Giganten: Q1 2026 Ergebnisanalyse',
    c3_t:'LG und NVIDIA: Das Zeitalter der Physischen KI Hat Offiziell Begonnen',
    c4_t:'KI-Agenten-Governance: Regulatoren Weisen auf Kontrollmängel Hin',
    c5_t:'GitHub Copilot Wechselt zur Pro-Token-Preisgestaltung — Was Das für Dev-Teams Bedeutet',
    c6_t:'KI-Agenten 2026: Wie Autonome KI Enterprise-Abläufe Neu Gestaltet',
    c7_t:'RAG-Systeme für Unternehmen: Der Vollständige Implementierungsleitfaden',
    c8_t:'Lokales LLM-Deployment: KI On-Premise für Enterprise-Sicherheit Betreiben',
    c9_t:'Context Engineering: Die Neue Disziplin, die KI-Systeme Tatsächlich Zum Laufen Bringt',
    c10_t:'Odoo 18: Neue Funktionen und die Unternehmens-Upgrade-Entscheidung',
    c11_t:'KI in Odoo ERP Integrieren: Ein Schrittweiser Implementierungsleitfaden',
    c12_t:'Odoo vs SAP 2026: Welches ERP Ist das Richtige für Ihr Unternehmen?',
    c13_t:'Warum Südostasiatische KMU 2026 zu Odoo ERP Wechseln',
    c14_t:'Vietnams Digitale Wirtschaft 2026: KI-Adoption Beschleunigt Sich Branchenübergreifend',
    c15_t:'Vietnams Tech-Talente: Warum Globale Unternehmen Dev-Hubs Hier Aufbauen',
    c16_t:'Vietnam Software-Exporte Erreichen 8 Mrd. $: Aufstieg zur KI-Supermacht',
    c17_t:'Singapurs Nationale KI-Strategie 2.0: Was Jedes Unternehmen Wissen Muss',
    c18_t:'Singapur Smart Nation: Wie KI Regierungs- und Unternehmensservices Transformiert',
    c19_t:'Digitale Transformation der Philippinen 2026: KI-Adoption Jenseits von BPO',
    c20_t:'Die KI-Revolution der Philippinischen BPO-Industrie: Von Headcount zu Intelligenz',
  },
};

/* ── TOC scroll-handler ref so we can remove it on language switch ── */
let _tocScrollHandler = null;

function applyBlogLang(lang) {
  localStorage.setItem('tn_lang', lang);
  const t = BLOG_LANG[lang] || BLOG_LANG.en;

  /* Drive CSS-based body-content switching (.lang-content[lang=...]) */
  document.documentElement.setAttribute('data-lang', lang);
  /* Be Vietnam Pro font for VN diacritics */
  document.documentElement.classList.toggle('lang-vn', lang === 'vn');

  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.textContent.trim().toLowerCase() === lang)
  );
  document.querySelectorAll('[data-k]').forEach(el => {
    const k = el.getAttribute('data-k');
    /* Fall back to English for any key not yet in this language */
    const v = (t[k] !== undefined) ? t[k] : BLOG_LANG.en[k];
    if (v !== undefined) el.innerHTML = v;
  });

  /* Remove old "English only" notice if article now has real translations */
  const oldNotice = document.getElementById('article-lang-notice');
  const hasLangContent = !!document.querySelector('.lang-content');
  if (hasLangContent) {
    if (oldNotice) oldNotice.remove();
  } else if (lang !== 'en') {
    /* Legacy article (not yet wrapped in lang-content): show notice */
    const msgs = {
      vn: '🌐 Bài viết này chỉ có bằng tiếng Anh.',
      ph: '🌐 Ang artikulong ito ay available sa Ingles lamang.',
      de: '🌐 Dieser Artikel ist nur auf Englisch verfügbar.',
    };
    let notice = oldNotice;
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'article-lang-notice';
      notice.style.cssText = 'display:flex;align-items:center;gap:10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:0.875rem;color:#1e40af;margin-bottom:1.5rem;';
      const ab = document.querySelector('.article-body');
      if (ab) ab.insertAdjacentElement('beforebegin', notice);
    }
    notice.textContent = msgs[lang] || '🌐 This article is available in English only.';
    notice.style.display = 'flex';
  } else if (oldNotice) {
    oldNotice.style.display = 'none';
  }

  /* Rebuild TOC headings/links to match the active language */
  rebuildTOC(lang);
}

/* Rebuild the sidebar TOC based on h2s inside the active lang-content block */
function rebuildTOC(lang) {
  const articleWrap = document.querySelector('.article-wrap');
  if (!articleWrap) return;
  /* Prefer active lang-content; fall back to full article-body for legacy articles */
  const activeContent =
    articleWrap.querySelector(`.lang-content[lang="${lang}"]`) ||
    articleWrap.querySelector('.lang-content[lang="en"]') ||
    articleWrap.querySelector('.article-body');
  if (!activeContent) return;
  const headings = Array.from(activeContent.querySelectorAll('h2'));
  headings.forEach((h, i) => { h.id = `s-${lang}-${i}`; });
  const tocNav = document.querySelector('.toc-nav');
  if (!tocNav || headings.length === 0) return;
  tocNav.innerHTML = headings.map(h =>
    `<a href="#${h.id}" class="toc-link">${h.textContent.trim()}</a>`
  ).join('');
  const tocLinks = tocNav.querySelectorAll('.toc-link');
  if (_tocScrollHandler) window.removeEventListener('scroll', _tocScrollHandler, true);
  _tocScrollHandler = function () {
    let idx = 0;
    headings.forEach((h, i) => { if (h.getBoundingClientRect().top < 120) idx = i; });
    tocLinks.forEach((l, i) => l.classList.toggle('active', i === idx));
  };
  window.addEventListener('scroll', _tocScrollHandler, { passive: true });
  _tocScrollHandler();
}

document.addEventListener('DOMContentLoaded', function () {
  const articleWrap = document.querySelector('.article-wrap');
  if (!articleWrap) return;

  // ── Auto-tag translatable elements in the static HTML ─────────
  const fname = window.location.pathname.split('/').pop();

  // Article title h1
  const h1 = articleWrap.querySelector('h1.article-title');
  if (h1 && FILE_KEY_MAP[fname]) h1.setAttribute('data-k', FILE_KEY_MAP[fname]);

  // Category badge
  const catBadge = articleWrap.querySelector('.cat-badge');
  if (catBadge) {
    const ck = CAT_KEY_MAP[catBadge.textContent.trim()];
    if (ck) catBadge.setAttribute('data-k', ck);
  }

  // Back-to-blog link
  const backLink = articleWrap.querySelector('.back-link');
  if (backLink) backLink.setAttribute('data-k', 'back_blog');

  // Remove old share bar
  const oldShareBar = articleWrap.querySelector('.share-bar');
  if (oldShareBar) oldShareBar.remove();

  // ── Initial h2 collection from English block (or full body for legacy articles) ──
  const enBlock = articleWrap.querySelector('.lang-content[lang="en"]') || articleWrap;
  const headings = Array.from(enBlock.querySelectorAll('h2'));
  headings.forEach((h, i) => { if (!h.id) h.id = 'section-' + i; });

  // ── Page layout: article | sidebar ────────────────────────────
  const pageLayout = document.createElement('div');
  pageLayout.className = 'article-page-layout';
  articleWrap.parentNode.insertBefore(pageLayout, articleWrap);

  const articleMain = document.createElement('main');
  articleMain.className = 'article-main';
  articleMain.appendChild(articleWrap);
  pageLayout.appendChild(articleMain);

  // ── Right sidebar ──────────────────────────────────────────────
  const sidebar = document.createElement('aside');
  sidebar.className = 'article-sidebar';

  if (headings.length > 0) {
    const toc = document.createElement('div');
    toc.className = 'toc-card';
    toc.innerHTML = `
      <p class="sidebar-card-label" data-k="toc_label">In This Article</p>
      <nav class="toc-nav">
        ${headings.map(h => `<a href="#${h.id}" class="toc-link">${h.textContent.trim()}</a>`).join('')}
      </nav>`;
    sidebar.appendChild(toc);
  }

  const pageUrl   = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);
  const shareCard = document.createElement('div');
  shareCard.className = 'share-card';
  shareCard.innerHTML = `
    <p class="sidebar-card-label" data-k="share_label">Share This Article</p>
    <div class="share-card-btns">
      <a class="share-card-btn s-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}" target="_blank" rel="noopener">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
      <a class="share-card-btn s-twitter" href="https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}" target="_blank" rel="noopener">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X (Twitter)
      </a>
      <a class="share-card-btn s-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${pageUrl}" target="_blank" rel="noopener">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </a>
      <button class="share-card-btn s-copy" id="shareCopyBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        <span data-k="copy_link">Copy Link</span>
      </button>
    </div>`;
  sidebar.appendChild(shareCard);
  pageLayout.appendChild(sidebar);

  // ── Recommended section below article ─────────────────────────
  const currentFile = fname || window.location.href.split('/').pop().split('?')[0];
  const recommended = ARTICLES.filter(a => a.url !== currentFile).slice(0, 6);

  const recSection = document.createElement('section');
  recSection.className = 'rec-section';
  recSection.innerHTML = `
    <div class="rec-section-inner">
      <h3 class="rec-section-heading" data-k="more_articles">More Articles</h3>
      <div class="rec-grid">
        ${recommended.map(a => {
          const titleKey = FILE_KEY_MAP[a.url] || '';
          const catKey   = CAT_KEY_MAP[a.cat]  || '';
          return `
          <a href="${a.url}" class="rec-article-card">
            <img src="${a.img}" alt="${a.title}" class="rec-article-img" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${a.url.replace('.html','')}/400/225'">
            <div class="rec-article-body">
              <span class="rec-article-cat"${catKey   ? ` data-k="${catKey}"`   : ''}>${a.cat}</span>
              <p class="rec-article-title"${titleKey ? ` data-k="${titleKey}"` : ''}>${a.title}</p>
              <span class="rec-article-date">${a.date}</span>
            </div>
          </a>`;
        }).join('')}
      </div>
    </div>`;

  const footer = document.querySelector('.site-footer');
  if (footer) footer.parentNode.insertBefore(recSection, footer);
  else document.body.appendChild(recSection);

  // ── Copy link handler ──────────────────────────────────────────
  const copyBtn = document.getElementById('shareCopyBtn');
  const copySpan = copyBtn && copyBtn.querySelector('span[data-k]');
  if (copyBtn && copySpan) {
    copyBtn.addEventListener('click', function () {
      const t = BLOG_LANG[localStorage.getItem('tn_lang')] || BLOG_LANG.en;
      const done = () => {
        copySpan.textContent = t.copied;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copySpan.textContent = t.copy_link;
          copyBtn.classList.remove('copied');
        }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).then(done).catch(done);
      else { const ta = document.createElement('textarea'); ta.value = window.location.href; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); }
    });
  }

  /* TOC scroll tracking is handled by rebuildTOC(), called inside applyBlogLang() */

  // ── Load shared booking modal ──────────────────────────────────
  if (!document.getElementById('bookingModal')) {
    const bkScript = document.createElement('script');
    bkScript.src = '../booking-modal.js';
    document.head.appendChild(bkScript);
  }

  // ── Nav: lang switcher (first) then Book Now ───────────────────
  const navRight = document.querySelector('#mainNav .nav-right');
  const navApply = navRight && navRight.querySelector('.nav-apply');
  if (navRight && navApply) {
    navApply.href = '#';
    navApply.removeAttribute('target');
    navApply.removeAttribute('rel');
    navApply.setAttribute('data-k', 'nav_book');
    navApply.setAttribute('onclick', 'applyBlogLang && openBooking();return false;');
    navApply.textContent = 'Book Now';

    const switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Language');
    switcher.innerHTML = '<button class="lang-btn" onclick="applyBlogLang(\'en\')">EN</button><button class="lang-btn" onclick="applyBlogLang(\'vn\')">VN</button><button class="lang-btn" onclick="applyBlogLang(\'ph\')">PH</button><button class="lang-btn" onclick="applyBlogLang(\'de\')">DE</button>';
    navApply.insertAdjacentElement('beforebegin', switcher);
  }

  // ── Nav: hamburger button (mobile) ────────────────────────────
  const navMenu = document.querySelector('#mainNav .nav-links');
  if (navMenu) navMenu.id = 'navMenu';
  if (navRight) {
    const hbtn = document.createElement('button');
    hbtn.className = 'hamburger';
    hbtn.id = 'hamburger';
    hbtn.setAttribute('aria-label', 'Menu');
    hbtn.innerHTML = '<span></span><span></span><span></span>';
    hbtn.addEventListener('click', function() {
      hbtn.classList.toggle('open');
      const nm = document.getElementById('navMenu');
      if (nm) nm.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#mainNav')) {
        hbtn.classList.remove('open');
        const nm = document.getElementById('navMenu');
        if (nm) nm.classList.remove('open');
      }
    });
    navRight.appendChild(hbtn);
  }

  const navLinkMap = { 'About':'nav_about', 'Gallery':'nav_gallery', 'Blog':'nav_blog', 'Careers':'nav_careers', 'Contact':'nav_contact' };
  document.querySelectorAll('.nav-links a').forEach(a => {
    const k = navLinkMap[a.textContent.trim()];
    if (k) a.setAttribute('data-k', k);
  });

  // ── Mobile lang dropdown ───────────────────────────────────────
  (function(){var sw=document.querySelector('.lang-switcher');if(!sw)return;function o(){var r=sw.getBoundingClientRect();sw.classList.add('open');sw.style.cssText='position:fixed;top:'+(r.bottom+8)+'px;right:'+(window.innerWidth-r.right)+'px;left:auto;z-index:200;';}function c(){sw.classList.remove('open');sw.style.cssText='';}sw.addEventListener('click',function(e){if(window.innerWidth>768)return;if(!sw.classList.contains('open')){e.stopPropagation();o();}});document.addEventListener('click',function(){c();});window.addEventListener('resize',function(){if(window.innerWidth>768)c();});})();

  // ── Apply saved/detected language ─────────────────────────────
  const savedLang = localStorage.getItem('tn_lang');
  if (savedLang && BLOG_LANG[savedLang]) applyBlogLang(savedLang);
  else {
    const l = (navigator.language || '').toLowerCase();
    if (l.startsWith('vi')) applyBlogLang('vn');
    else if (l.startsWith('de')) applyBlogLang('de');
    else if (l.startsWith('fil') || l.startsWith('tl')) applyBlogLang('ph');
    else applyBlogLang('en');
  }
});

/* ── Nav hide-on-scroll-down / show-on-scroll-up ── */
(function(){
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  var lastY = 0, ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY || window.pageYOffset;
      if (y > lastY && y > 80) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastY = y < 0 ? 0 : y;
      ticking = false;
    });
  }, { passive: true });
})();
