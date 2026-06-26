/*!
 * TechNext Asia — Cookie Consent & Visitor Tracking
 * Handles: GDPR consent banner, first-party visitor cookies, public API
 */
(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────── */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var m = document.cookie.match('(?:^|;\\s*)' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }

  function genId() {
    return 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ── Visitor tracking ────────────────────────────── */
  function trackVisit() {
    var now = new Date().toISOString();

    // Unique visitor ID (1 year)
    if (!getCookie('tn_vid')) setCookie('tn_vid', genId(), 365);

    // Visit count (1 year)
    var visits = parseInt(getCookie('tn_visits') || '0', 10) + 1;
    setCookie('tn_visits', visits, 365);

    // First & last visit timestamps
    if (!getCookie('tn_first')) setCookie('tn_first', now, 365);
    setCookie('tn_last', now, 365);

    // Original referrer (only set once per visitor)
    if (document.referrer && !getCookie('tn_ref')) {
      setCookie('tn_ref', document.referrer, 365);
    }

    // Page journey — track last 15 unique paths (30 days)
    var rawPages = getCookie('tn_pages');
    var pages = rawPages ? rawPages.split('|') : [];
    var cur = window.location.pathname;
    if (pages[pages.length - 1] !== cur) {
      pages.push(cur);
      if (pages.length > 15) pages = pages.slice(-15);
      setCookie('tn_pages', pages.join('|'), 30);
    }

    // Device type (30 days)
    setCookie('tn_device', window.innerWidth <= 768 ? 'mobile' : 'desktop', 30);

    // UTM campaign params (30 days)
    try {
      var params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (p) {
        var val = params.get(p);
        if (val) setCookie('tn_' + p.slice(4), val, 30);
      });
    } catch (e) {}

    // Language preference (from localStorage or cookie)
    var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('tn_lang')) || getCookie('tn_lang') || 'en';
    setCookie('tn_lang', lang, 365);

    // Expose to window for use by other scripts / GTM
    window.TechNextVisitor = {
      id:         getCookie('tn_vid'),
      visits:     parseInt(getCookie('tn_visits'), 10),
      firstVisit: getCookie('tn_first'),
      lastVisit:  getCookie('tn_last'),
      referrer:   getCookie('tn_ref') || '(direct)',
      pages:      (getCookie('tn_pages') || cur).split('|'),
      device:     getCookie('tn_device'),
      lang:       lang,
      source:     getCookie('tn_source') || '(none)',
      medium:     getCookie('tn_medium') || '(none)',
      campaign:   getCookie('tn_campaign') || '(none)'
    };

    // Push to GTM dataLayer if available
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'tn_visitor_identified',
        tn_visitor_id:    window.TechNextVisitor.id,
        tn_visit_count:   window.TechNextVisitor.visits,
        tn_first_visit:   window.TechNextVisitor.firstVisit,
        tn_device:        window.TechNextVisitor.device,
        tn_referrer:      window.TechNextVisitor.referrer
      });
    }
  }

  /* ── Cookie banner ───────────────────────────────── */
  var BANNER_ID = 'tn-cookie-banner';

  function removeBanner() {
    var b = document.getElementById(BANNER_ID);
    if (b) {
      b.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      b.style.transform = 'translateY(20px)';
      b.style.opacity = '0';
      setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 420);
    }
  }

  function accept() {
    setCookie('tn_consent', 'yes', 365);
    removeBanner();
    trackVisit();
  }

  function decline() {
    setCookie('tn_consent', 'no', 90);
    removeBanner();
  }

  function createBanner() {
    if (document.getElementById(BANNER_ID)) return;

    var banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.style.cssText = [
      'position:fixed', 'bottom:20px', 'left:50%', 'transform:translateX(-50%) translateY(30px)',
      'width:calc(100% - 40px)', 'max-width:680px', 'z-index:9999',
      'background:#1a1a2e', 'color:#f1f5f9', 'border-radius:16px',
      'padding:18px 22px', 'display:flex', 'align-items:center', 'gap:16px',
      'box-shadow:0 8px 40px rgba(0,0,0,0.25)', 'font-family:\'DM Sans\',Arial,sans-serif',
      'font-size:13px', 'line-height:1.5', 'opacity:0',
      'transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
      'flex-wrap:wrap'
    ].join(';');

    banner.innerHTML =
      '<div style="flex:1;min-width:200px;">' +
        '<strong style="font-size:13px;color:#fff;">🍪 Cookie Notice</strong>' +
        '<p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">' +
          'We use cookies to understand how visitors use our site and improve your experience. ' +
          'No data is shared with third parties.' +
        '</p>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">' +
        '<button id="tn-cookie-accept" style="' +
          'padding:9px 20px;background:#2563eb;color:#fff;border:none;border-radius:50px;' +
          'font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;' +
          'transition:background 0.2s;"' +
          ' onmouseover="this.style.background=\'#1d4ed8\'"' +
          ' onmouseout="this.style.background=\'#2563eb\'">' +
          'Accept' +
        '</button>' +
        '<button id="tn-cookie-decline" style="' +
          'padding:9px 20px;background:rgba(255,255,255,0.08);color:#94a3b8;border:1px solid rgba(255,255,255,0.12);' +
          'border-radius:50px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;' +
          'transition:all 0.2s;"' +
          ' onmouseover="this.style.background=\'rgba(255,255,255,0.14)\';this.style.color=\'#fff\'"' +
          ' onmouseout="this.style.background=\'rgba(255,255,255,0.08)\';this.style.color=\'#94a3b8\'">' +
          'Decline' +
        '</button>' +
      '</div>';

    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.style.transform = 'translateX(-50%) translateY(0)';
        banner.style.opacity = '1';
      });
    });

    document.getElementById('tn-cookie-accept').addEventListener('click', accept);
    document.getElementById('tn-cookie-decline').addEventListener('click', decline);
  }

  /* ── Init ────────────────────────────────────────── */
  function init() {
    var consent = getCookie('tn_consent');
    if (consent === 'yes') {
      trackVisit();
    } else if (!consent) {
      // Show banner after a short delay so it doesn't flash during page load
      setTimeout(createBanner, 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Public API ──────────────────────────────────── */
  window.TechNextCookies = {
    accept:       accept,
    decline:      decline,
    get:          getCookie,
    set:          setCookie,
    getVisitor:   function () { return window.TechNextVisitor || null; }
  };

})();
