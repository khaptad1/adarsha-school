// ════════════════════════════════════════════════════════════
//  index.js  —  Adarsha Sanothimi School  (public site)
// ════════════════════════════════════════════════════════════

// ── LANGUAGE DATA ──────────────────────────────────────────
const LANG = {
  en: {
    nav_home:'Home', nav_about:'About', nav_programs:'Programs', nav_features:'Facilities',
    nav_notices:'Notices', nav_portal:'Result Portal', nav_calendar:'Calendar',
    nav_faq:'FAQs', nav_contact:'Admission',
    hero_badge:'🇳🇵 Established 2034 BS · Sanothimi, Bhaktapur',
    hero_h1:'Adarsha Sanothimi', hero_h1s:'Higher Secondary School',
    hero_np:'आदर्श सानोठिमी माध्यमिक विद्यालय',
    hero_slogan:'"ज्ञानं परमं भूषणम्" — Knowledge is the Ultimate Ornament',
    hero_p:'A leading government school in Sanothimi, Bhaktapur committed to quality education from ECD to Grade 12 with Science, Management and Humanities streams.',
    hero_btn1:'Apply for Admission', hero_btn2:'Explore School',
    stat1:'1,800+', stat1l:'Students Enrolled',
    stat2:'95.2%',  stat2l:'Pass Rate',
    stat3:'60+',    stat3l:'Teachers',
    stat4:'Grade 1–12', stat4l:'All Levels',
    stat5:'Science & Mgmt', stat5l:'+2 Streams',
    stat6:'40+',    stat6l:'Years of Service',
    about_tag:'About Us', about_h:'Our School',
    about_badge:'Est. 2034 BS',
    about_p1:'Adarsha Sanothimi Higher Secondary School is a government-aided school located in Sanothimi, Bhaktapur. Serving the community since 2034 BS, we provide education from ECD through Grade 12.',
    about_p2:'We offer +2 programs in Science, Management and Humanities under NEB. Our school is known for its dedicated teachers, disciplined environment and strong exam results.',
    prog_tag:'Academic Programs', prog_h:'What We Offer',
    prog_p:'From early childhood to +2 higher secondary.',
    feat_tag:'School Facilities', feat_h:'Our Infrastructure',
    feat_p:'Modern facilities supporting holistic student development.',
    notice_tag:'Latest Updates', notice_h:'Notice Board',
    portal_tag:'Result Portal', portal_h:'Check Your Result',
    portal_p:'Enter your student ID or symbol number to check exam results.',
    portal_btn:'Check Result', portal_input:'Symbol Number / Student ID',
    cal_tag:'Academic Schedule', cal_h:'Calendar & Events',
    faq_tag:'Help & Support', faq_h:'Frequently Asked Questions',
    adm_tag:'Enroll Now', adm_h:'Admission Open – 2081 BS',
    adm_p:'We welcome students for all grades. Complete the steps below and visit school for further process.',
    contact_tag:'Contact Us', contact_h:'Get In Touch',
    footer_brand:'Adarsha Sanothimi H.S. School',
    footer_p:'Quality education for the community of Sanothimi, Bhaktapur since 2034 BS.',
    footer_links:'Quick Links', footer_gov:'Affiliations',
    footer_copy:'© 2081 BS · Adarsha Sanothimi Higher Secondary School · Sanothimi, Bhaktapur · All Rights Reserved',
    ticker:'📢 Admission Open for 2081 BS! | 📝 Grade 11 Entrance Form available at school office | 🏆 SEE Result 2080: Outstanding performance by our students | 📅 First Terminal Exam: Ashadh 5–15 | 🎓 NEB Affiliation renewed successfully'
  },
  np: {
    nav_home:'गृहपृष्ठ', nav_about:'हाम्रोबारे', nav_programs:'कार्यक्रमहरू', nav_features:'सुविधाहरू',
    nav_notices:'सूचना', nav_portal:'नतिजा पोर्टल', nav_calendar:'क्यालेन्डर',
    nav_faq:'सामान्य प्रश्न', nav_contact:'भर्ना',
    hero_badge:'🇳🇵 स्थापना २०३४ BS · सानोठिमी, भक्तपुर',
    hero_h1:'आदर्श सानोठिमी', hero_h1s:'उच्च माध्यमिक विद्यालय',
    hero_np:'Adarsha Sanothimi Higher Secondary School',
    hero_slogan:'"ज्ञानं परमं भूषणम्" — ज्ञान नै सर्वोत्तम आभूषण हो',
    hero_p:'सानोठिमी, भक्तपुरमा अवस्थित एक अग्रणी सरकारी विद्यालय जसले ECD देखि कक्षा १२ सम्म गुणस्तरीय शिक्षा प्रदान गर्दछ।',
    hero_btn1:'भर्नाका लागि आवेदन दिनुहोस्', hero_btn2:'विद्यालय हेर्नुहोस्',
    stat1:'१,८००+', stat1l:'विद्यार्थीहरू भर्ना',
    stat2:'९५.२%',  stat2l:'उत्तीर्ण दर',
    stat3:'६०+',    stat3l:'शिक्षकहरू',
    stat4:'कक्षा १–१२', stat4l:'सबै तह',
    stat5:'विज्ञान र व्यवस्थापन', stat5l:'+२ धाराहरू',
    stat6:'४०+',    stat6l:'सेवाका वर्षहरू',
    about_tag:'हाम्रोबारे', about_h:'हाम्रो विद्यालय',
    about_badge:'स्था. २०३४ BS',
    about_p1:'आदर्श सानोठिमी उच्च माध्यमिक विद्यालय सानोठिमी, भक्तपुरमा अवस्थित एक सरकारी सहायता प्राप्त विद्यालय हो। २०३४ BS देखि समुदायलाई सेवा गर्दै ECD देखि कक्षा १२ सम्म शिक्षा प्रदान गर्दछ।',
    about_p2:'हामी NEB अन्तर्गत विज्ञान, व्यवस्थापन र मानविकीमा +२ कार्यक्रमहरू प्रदान गर्छौं। हाम्रो विद्यालय समर्पित शिक्षकहरू, अनुशासित वातावरण र राम्रो परीक्षा परिणामका लागि परिचित छ।',
    prog_tag:'शैक्षिक कार्यक्रमहरू', prog_h:'हाम्रो प्रस्ताव',
    prog_p:'बाल विकास केन्द्र देखि +२ उच्च माध्यमिक सम्म।',
    feat_tag:'विद्यालय सुविधाहरू', feat_h:'हाम्रो पूर्वाधार',
    feat_p:'समग्र विद्यार्थी विकासलाई समर्थन गर्ने आधुनिक सुविधाहरू।',
    notice_tag:'ताजा अपडेटहरू', notice_h:'सूचना पाटी',
    portal_tag:'नतिजा पोर्टल', portal_h:'आफ्नो नतिजा हेर्नुहोस्',
    portal_p:'परीक्षा नतिजा हेर्न आफ्नो विद्यार्थी ID वा प्रतीक नम्बर प्रविष्ट गर्नुहोस्।',
    portal_btn:'नतिजा हेर्नुहोस्', portal_input:'प्रतीक नम्बर / विद्यार्थी ID',
    cal_tag:'शैक्षिक तालिका', cal_h:'क्यालेन्डर र कार्यक्रमहरू',
    faq_tag:'सहायता', faq_h:'सामान्य रूपमा सोधिने प्रश्नहरू',
    adm_tag:'अहिले नै भर्ना हुनुहोस्', adm_h:'भर्ना खुल्ला – २०८१ BS',
    adm_p:'हामी सबै कक्षाका विद्यार्थीहरूलाई स्वागत गर्दछौं। तलका चरणहरू पूरा गर्नुहोस् र थप प्रक्रियाका लागि विद्यालयमा आउनुहोस्।',
    contact_tag:'सम्पर्क गर्नुहोस्', contact_h:'सम्पर्कमा आउनुहोस्',
    footer_brand:'आदर्श सानोठिमी उ.मा. विद्यालय',
    footer_p:'२०३४ BS देखि सानोठिमी, भक्तपुरको समुदायका लागि गुणस्तरीय शिक्षा।',
    footer_links:'द्रुत लिङ्कहरू', footer_gov:'सम्बद्धताहरू',
    footer_copy:'© २०८१ BS · आदर्श सानोठिमी उच्च माध्यमिक विद्यालय · सानोठिमी, भक्तपुर · सर्वाधिकार सुरक्षित',
    ticker:'📢 २०८१ BS को भर्ना खुला! | 📝 कक्षा ११ को प्रवेश फारम विद्यालय कार्यालयमा उपलब्ध | 🏆 SEE नतिजा २०८०: हाम्रा विद्यार्थीहरूको उत्कृष्ट प्रदर्शन | 📅 प्रथम टर्मिनल परीक्षा: असार ५–१५ | 🎓 NEB सम्बद्धता सफलतापूर्वक नवीकरण'
  }
};

let currentLang = 'en';

// ── HELPERS ────────────────────────────────────────────────
function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function setAttr(id, a, v) { const e = document.getElementById(id); if (e) e.setAttribute(a, v); }
function db() { return window.DB || localStorage; }

// ── LANGUAGE ───────────────────────────────────────────────
function setLang(lang) {
  currentLang = lang;
  const t = LANG[lang];
  document.documentElement.lang = lang === 'np' ? 'ne' : 'en';

  // Nav
  setText('nl-home', t.nav_home); setText('nl-about', t.nav_about);
  setText('nl-programs', t.nav_programs); setText('nl-features', t.nav_features);
  setText('nl-notices', t.nav_notices); setText('nl-portal', t.nav_portal);
  setText('nl-calendar', t.nav_calendar); setText('nl-faq', t.nav_faq);
  setText('nl-contact', t.nav_contact);
  setText('btn-lang-el', lang === 'en' ? 'नेपाली' : 'English');

  // Hero
  setText('hero-badge', t.hero_badge);
  setText('hero-h1', t.hero_h1); setText('hero-h1s', t.hero_h1s);
  setText('hero-np', t.hero_np); setText('hero-slogan', t.hero_slogan);
  setText('hero-p', t.hero_p);
  setText('hero-btn1', t.hero_btn1); setText('hero-btn2', t.hero_btn2);

  // Stats (override with admin data if available)
  const adminStats = JSON.parse(db().getItem('school_stats') || 'null');
  if (adminStats) {
    adminStats.forEach((s, i) => { setText('s'+(i+1)+'n', s.val); setText('s'+(i+1)+'l', s.lbl); });
  } else {
    setText('s1n', t.stat1); setText('s1l', t.stat1l);
    setText('s2n', t.stat2); setText('s2l', t.stat2l);
    setText('s3n', t.stat3); setText('s3l', t.stat3l);
    setText('s4n', t.stat4); setText('s4l', t.stat4l);
    setText('s5n', t.stat5); setText('s5l', t.stat5l);
    setText('s6n', t.stat6); setText('s6l', t.stat6l);
  }

  // Section headings
  setText('about-tag', t.about_tag); setText('about-h', t.about_h);
  setText('about-badge-el', t.about_badge);
  setText('about-p1', t.about_p1); setText('about-p2', t.about_p2);
  setText('prog-tag', t.prog_tag); setText('prog-h', t.prog_h); setText('prog-p', t.prog_p);
  setText('feat-tag', t.feat_tag); setText('feat-h', t.feat_h); setText('feat-p', t.feat_p);
  setText('notice-tag', t.notice_tag); setText('notice-h', t.notice_h);
  setText('portal-tag', t.portal_tag); setText('portal-h', t.portal_h);
  setText('portal-p', t.portal_p); setText('portal-btn', t.portal_btn);
  setAttr('studentSymbolInput', 'placeholder', t.portal_input);
  setText('cal-tag', t.cal_tag); setText('cal-h', t.cal_h);
  setText('faq-tag', t.faq_tag); setText('faq-h', t.faq_h);
  setText('adm-tag', t.adm_tag); setText('adm-h', t.adm_h); setText('adm-p', t.adm_p);
  setText('contact-tag', t.contact_tag); setText('contact-h', t.contact_h);

  // Footer
  setText('footer-brand', t.footer_brand); setText('footer-p', t.footer_p);
  setText('footer-links', t.footer_links); setText('footer-gov', t.footer_gov);
  setText('footer-copy', t.footer_copy);

  // Ticker — prefer saved admin ticker
  const savedTicker = db().getItem(lang === 'en' ? 'school_ticker_en' : 'school_ticker_np');
  setText('ticker-text', savedTicker ? JSON.parse(savedTicker) : t.ticker);
}

function toggleLang() { setLang(currentLang === 'en' ? 'np' : 'en'); }

// ── THEME ──────────────────────────────────────────────────
function toggleTheme() {
  const r = document.documentElement;
  r.setAttribute('data-theme', r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

// ── SCROLL ─────────────────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── RESULT PORTAL ──────────────────────────────────────────
function checkResult() {
  const id  = document.getElementById('studentSymbolInput').value.trim().toUpperCase();
  const box = document.getElementById('resultOutputBox');
  if (!id) { alert('Please enter a valid Symbol Number or Student ID.'); return; }

  const results = JSON.parse(db().getItem('school_results') || '[]');
  const record  = results.find(r => r.id === id);

  box.style.display = 'block';
  if (record) {
    box.innerHTML = `
      <h4>✅ Result Found</h4>
      <p><strong>Symbol / ID:</strong> ${record.id}</p>
      <p><strong>Name:</strong> ${record.name}</p>
      <p><strong>Class:</strong> ${record.grade}</p>
      <p><strong>GPA:</strong> ${record.gpa || '—'}</p>
      <p><strong>Grade:</strong> ${record.div || '—'}</p>
      <p><strong>Status:</strong> ${record.status}</p>`;
  } else {
    box.innerHTML = `
      <h4>❌ No Result Found</h4>
      <p>No result found for <strong>${id}</strong>. Please check the symbol number or contact the school office.</p>`;
  }
}

// ── FAQ TOGGLE ─────────────────────────────────────────────
function toggleFaq(btn) {
  btn.parentElement.classList.toggle('active');
}

// ── PUBLIC DATA RENDERERS ──────────────────────────────────

function renderPublicNotices() {
  const notices = JSON.parse(db().getItem('school_notices') || 'null');
  const wrap = document.getElementById('noticeBoardWrap');
  if (!wrap) return;
  if (!notices || !notices.length) return;

  const official    = notices.filter(n => n.type === 'official');
  const achievement = notices.filter(n => n.type === 'achievement');

  function board(title, items) {
    return '<div class="notice-board">'
      + '<div class="notice-head">' + title + '</div>'
      + items.map(n => '<div class="notice-item"><div class="ndot"></div><div><p>' + n.text + '</p><span>' + n.date + '</span></div></div>').join('')
      + '</div>';
  }

  wrap.innerHTML =
    board('📢 Official Notices',       official.length    ? official    : [{text:'No official notices.', date:''}]) +
    board('🏆 Achievements & Events',  achievement.length ? achievement : [{text:'No achievements yet.', date:''}]);
}

function renderPublicCalendar() {
  const events = JSON.parse(db().getItem('school_calendar') || 'null');
  const tbody = document.getElementById('calTbody');
  if (!events || !events.length || !tbody) return;
  tbody.innerHTML = events.map(e =>
    `<tr><td>${e.date}</td><td>${e.event}</td><td>${e.target}</td><td>${e.status}</td></tr>`
  ).join('');
}

function renderPublicFees() {
  const fees = JSON.parse(db().getItem('school_fees') || 'null');
  const tbody = document.getElementById('feeTbody');
  if (!fees || !fees.length || !tbody) return;
  tbody.innerHTML = fees.map(f =>
    `<tr><td>${f.level}</td><td>${f.adm}</td><td>${f.monthly}</td><td>${f.exam}</td><td>${f.remarks}</td></tr>`
  ).join('');
}

// ── GALLERY ────────────────────────────────────────────────

let galleryData   = [];
let galleryFilter = 'all';

function renderGallery(filter) {
  if (filter) galleryFilter = filter;
  galleryData = JSON.parse(db().getItem('school_gallery') || '[]');
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const items = galleryFilter === 'all'
    ? galleryData
    : galleryData.filter(p => p.category === galleryFilter);

  if (!items.length) {
    grid.innerHTML = '<div class="gallery-empty" style="grid-column:1/-1"><div style="font-size:48px;margin-bottom:12px;">🖼️</div><p>No photos in this category yet.</p></div>';
    return;
  }

  grid.innerHTML = items.map(p => {
    const realIdx = galleryData.indexOf(p);
    return `<div class="gallery-item" onclick="openLightbox(${realIdx})">
      <img src="${p.data}" alt="${p.caption}" loading="lazy">
      <div class="gallery-caption">
        <p>${p.caption}</p>
        <span class="gallery-cat-tag">${p.category}</span>
      </div>
    </div>`;
  }).join('');
}

function filterGallery(cat, btn) {
  document.querySelectorAll('.gtab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderGallery(cat);
}

function openLightbox(index) {
  const p  = galleryData[index];
  const lb = document.getElementById('lightbox');
  document.getElementById('lbImg').src = p.data;
  document.getElementById('lbCaption').textContent = p.caption + ' · ' + p.category;
  lb.classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

// ── TEACHERS ───────────────────────────────────────────────

function renderTeachers() {
  const teachersData = JSON.parse(db().getItem('school_teachers') || '[]');
  const grid = document.getElementById('teachersGrid');
  if (!grid) return;

  if (!teachersData.length) {
    grid.innerHTML = `<div class="gallery-empty" style="grid-column:1/-1">
      <div style="font-size:48px;margin-bottom:12px;">👩‍🏫</div>
      <p>No teachers added yet. Admin can add teacher profiles from the Admin Panel.</p>
    </div>`;
    return;
  }

  grid.innerHTML = teachersData.map(t => `
    <div class="teacher-card">
      ${t.photo
        ? `<img class="teacher-avatar" src="${t.photo}" alt="${t.name}">`
        : `<div class="teacher-avatar-placeholder">👤</div>`}
      <h4>${t.name}</h4>
      <div class="teacher-subject">${t.subject}</div>
      <span class="teacher-qual">${t.qual}</span>
    </div>`).join('');
}

// ── HERO OVERRIDE FROM ADMIN ───────────────────────────────

function applyAdminHero() {
  const h = JSON.parse(db().getItem('school_hero') || 'null');
  if (!h) return;
  setText('hero-h1', h.name);
  setText('hero-h1s', h.sub);
  setText('hero-np', h.np);
  setText('hero-badge', h.badge);
  setText('hero-slogan', h.slogan);
  setText('hero-p', h.desc);
}

// ── REFRESH ALL (called on live Firestore updates) ─────────

function refreshAll() {
  applyAdminHero();
  renderPublicNotices();
  renderPublicCalendar();
  renderPublicFees();
  renderGallery();
  renderTeachers();
  setLang(currentLang);
}

// ── SECRET ADMIN REDIRECT ──────────────────────────────────
// Click the logo in the navbar 10 times within 4 seconds to go to admin.html

let adminKnocks = 0;
function handleAdminKnock() {
  adminKnocks++;
  clearTimeout(window._knockTimer);
  if (adminKnocks >= 10) {
    adminKnocks = 0;
    window.location.href = 'admin.html';
  } else {
    window._knockTimer = setTimeout(() => { adminKnocks = 0; }, 4000);
  }
}

// ── INIT ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const doRender = () => {
    applyAdminHero();
    setLang('en');
    renderGallery();
    renderTeachers();
    renderPublicNotices();
    renderPublicCalendar();
    renderPublicFees();

    // Lightbox close on backdrop click
    const lb = document.getElementById('lightbox');
    if (lb) lb.addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });

    // Secret entry via footer school name: click 10 times in 5 seconds
    const footerBrand = document.getElementById('footer-brand');
    if (footerBrand) {
      let fKnocks = 0, fTimer = null;
      footerBrand.addEventListener('click', () => {
        fKnocks++;
        clearTimeout(fTimer);
        if (fKnocks >= 10) { fKnocks = 0; window.location.href = 'admin.html'; }
        else fTimer = setTimeout(() => { fKnocks = 0; }, 5000);
      });
    }

    // Subscribe to live Firestore updates
    if (window.DB && !window.DB._useFallback) {
      const keys = [
        'school_notices','school_calendar','school_fees','school_gallery',
        'school_teachers','school_hero','school_stats','school_ticker_en','school_ticker_np'
      ];
      keys.forEach(k => window.DB.on(k, refreshAll));
    }
  };

  if (window.DB) window.DB.onReady(doRender);
  else doRender();
});
