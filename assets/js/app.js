/* Bookkeeping for First-Timers — shared page code
   - Language (EN/FIL) and light/dark switch
   - Header, progress tracker, Back/Next, disclaimer footer
   - Small helpers used on several pages (saved checklists, quick quizzes)
   Nothing here talks to the internet. Progress is saved only in this browser. */
(function () {
  'use strict';

  /* ---- Safe browser storage: works (without saving) if storage is blocked ---- */
  var PREFIX = 'bft:';
  var store = {
    get: function (k) { try { return window.localStorage.getItem(PREFIX + k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(PREFIX + k, v); } catch (e) { /* not saved */ } },
    remove: function (k) { try { window.localStorage.removeItem(PREFIX + k); } catch (e) { /* ignore */ } },
    getJSON: function (k, fallback) {
      try { var v = JSON.parse(store.get(k)); return v == null ? fallback : v; } catch (e) { return fallback; }
    },
    setJSON: function (k, v) { try { store.set(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  /* ---- The 9 modules, in order. Change titles here to rename them everywhere. ---- */
  var MODULES = [
    { file: 'start-here.html',      en: 'Start here',                       fil: 'Simulan dito' },
    { file: 'documents.html',       en: 'Documents 101',                    fil: 'Mga dokumento 101' },
    { file: 'your-books.html',      en: 'Your books',                       fil: 'Ang mga libro mo' },
    { file: 'recording.html',       en: 'Recording transactions',           fil: 'Pag-record ng mga transaksyon' },
    { file: 'practice-lab.html',    en: 'Practice lab',                     fil: 'Practice lab' },
    { file: 'routine.html',         en: 'Month-end & quarter-end routine',  fil: 'Routine sa katapusan ng buwan at quarter' },
    { file: 'keeping-records.html', en: 'Keeping records',                  fil: 'Pagtatago ng records' },
    { file: 'glossary.html',        en: 'Glossary',                         fil: 'Glosaryo' },
    { file: 'checklists.html',      en: 'Printable checklists',             fil: 'Mga checklist na pang-print' }
  ];

  var root = document.documentElement;

  /* ---- Language: set as early as possible to avoid a flash of both languages ---- */
  var lang = store.get('lang');
  if (lang !== 'en' && lang !== 'fil') {
    var nav = (navigator.language || '').toLowerCase();
    lang = (nav.indexOf('fil') === 0 || nav.indexOf('tl') === 0) ? 'fil' : 'en';
  }
  function applyLang(l) {
    lang = l;
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'fil' ? 'fil' : 'en');
  }
  applyLang(lang);

  /* ---- Theme: follows the device unless the reader picks one ---- */
  var theme = store.get('theme');
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  /* Both-language snippet: b('Hello', 'Kumusta') */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function b(en, fil) {
    return '<span lang="en">' + en + '</span><span lang="fil">' + fil + '</span>';
  }
  function t(obj) { return obj ? (obj[lang] != null ? obj[lang] : obj.en) : ''; }

  function getDone() {
    var d = store.getJSON('done', []);
    return Array.isArray(d) ? d : [];
  }
  function setDone(file, isDone) {
    var d = getDone().filter(function (f) { return f !== file; });
    if (isDone) d.push(file);
    store.setJSON('done', d);
    refreshProgress();
  }

  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  var ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  var LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="4" width="26" height="32" rx="4" fill="var(--primary)"/><rect x="9" y="4" width="22" height="32" rx="3" fill="var(--surface)" stroke="var(--primary)" stroke-width="2"/><path d="M13 13h13M13 18h13M13 23h8" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="29" r="8" fill="var(--accent)"/><path d="M26.5 29l2.5 2.5 4.5-5" stroke="#2a1d00" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildHeader() {
    var h = document.createElement('header');
    h.className = 'site-header';
    h.innerHTML =
      '<a class="skip" href="#main">' + b('Skip to content', 'Lumaktaw sa nilalaman') + '</a>' +
      '<div class="wrap bar">' +
        '<a class="brand" href="index.html">' + LOGO +
          '<span><span class="brand-name">Bookkeeping for First-Timers</span><small>Nice to Know · @missniceph</small></span></a>' +
        '<div class="controls">' +
          '<div class="seg" role="group" aria-label="Language / Wika">' +
            '<button type="button" data-setlang="en" title="English">EN</button>' +
            '<button type="button" data-setlang="fil" title="Filipino">FIL</button>' +
          '</div>' +
          '<button type="button" class="icon-btn" id="themeBtn"></button>' +
        '</div>' +
      '</div>' +
      '<div class="wrap progress" aria-live="polite">' +
        '<div class="ptrack" aria-hidden="true"><div class="pfill"></div></div>' +
        '<span class="ptext"></span>' +
      '</div>';
    document.body.insertBefore(h, document.body.firstChild);
    var mainEl = document.getElementById('main');
    if (mainEl && mainEl.classList.contains('wide')) h.querySelectorAll('.wrap').forEach(function (w) { w.classList.add('wide'); });

    h.querySelectorAll('[data-setlang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = btn.getAttribute('data-setlang');
        store.set('lang', l);
        applyLang(l);
        refreshChrome();
        document.dispatchEvent(new CustomEvent('bft:lang', { detail: l }));
      });
    });
    var tb = h.querySelector('#themeBtn');
    tb.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
      refreshChrome();
    });
  }

  function refreshChrome() {
    document.querySelectorAll('[data-setlang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-setlang') === lang ? 'true' : 'false');
    });
    var tb = document.getElementById('themeBtn');
    if (tb) {
      var dark = currentTheme() === 'dark';
      tb.innerHTML = dark ? ICON_SUN : ICON_MOON;
      var label = dark
        ? (lang === 'fil' ? 'Gawing light mode' : 'Switch to light mode')
        : (lang === 'fil' ? 'Gawing dark mode' : 'Switch to dark mode');
      tb.setAttribute('aria-label', label);
      tb.title = label;
    }
    // Elements whose attributes need translating: data-en-*/data-fil-* pairs
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (attr) {
        var v = el.getAttribute('data-' + lang + '-' + attr);
        if (v != null) el.setAttribute(attr, v);
      });
    });
    refreshProgress();
  }

  function refreshProgress() {
    var done = getDone();
    var count = MODULES.filter(function (m) { return done.indexOf(m.file) !== -1; }).length;
    var fill = document.querySelector('.pfill');
    var text = document.querySelector('.ptext');
    if (fill) fill.style.width = Math.round((count / MODULES.length) * 100) + '%';
    if (text) {
      text.textContent = lang === 'fil'
        ? count + ' sa ' + MODULES.length + ' module ang tapos'
        : count + ' of ' + MODULES.length + ' modules done';
    }
    document.querySelectorAll('[data-module-link]').forEach(function (a) {
      a.classList.toggle('done', done.indexOf(a.getAttribute('data-module-link')) !== -1);
    });
    var cb = document.getElementById('doneToggle');
    if (cb) cb.checked = done.indexOf(cb.getAttribute('data-file')) !== -1;
    var cont = document.getElementById('continueLink');
    if (cont) {
      var next = MODULES.filter(function (m) { return done.indexOf(m.file) === -1; })[0];
      cont.setAttribute('href', next ? next.file : MODULES[0].file);
    }
  }

  function moduleIndex() {
    var path = location.pathname.split('/').pop() || 'index.html';
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].file === path) return i;
    var forced = document.body.getAttribute('data-module');
    return forced ? parseInt(forced, 10) - 1 : -1;
  }

  function buildModuleChrome(idx) {
    var main = document.getElementById('main');
    if (!main || idx < 0) return;
    var m = MODULES[idx];

    // Stepper (progress tracker) at the top
    var steps = '<ol class="stepper" aria-label="Modules">';
    MODULES.forEach(function (mm, i) {
      steps += '<li><a href="' + mm.file + '" data-module-link="' + mm.file + '"' +
        (i === idx ? ' aria-current="page"' : '') +
        ' title="' + esc(mm.en) + ' / ' + esc(mm.fil) + '">' + (i + 1) + '</a></li>';
    });
    steps += '</ol>';
    var eyebrow = '<p class="eyebrow">' + b('Module ' + (idx + 1) + ' of ' + MODULES.length, 'Module ' + (idx + 1) + ' sa ' + MODULES.length) + '</p>';
    main.insertAdjacentHTML('afterbegin', steps + eyebrow);

    // Back / Next with "mark as done"
    var prev = MODULES[idx - 1], next = MODULES[idx + 1];
    var pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Module navigation');
    pager.innerHTML =
      '<label class="done-toggle"><input type="checkbox" id="doneToggle" data-file="' + m.file + '"> ' +
        b('I’m done with this module', 'Tapos ko na ang module na ito') + '</label>' +
      '<div class="nav">' +
        (prev ? '<a class="btn ghost" href="' + prev.file + '">← ' + b('Back', 'Bumalik') + ': ' + b(esc(prev.en), esc(prev.fil)) + '</a>'
              : '<a class="btn ghost" href="index.html">← ' + b('Home', 'Home') + '</a>') +
        (next ? '<a class="btn" id="nextBtn" href="' + next.file + '">' + b('Next', 'Susunod') + ': ' + b(esc(next.en), esc(next.fil)) + ' →</a>'
              : '<a class="btn" id="nextBtn" href="index.html">' + b('Finish — back to home', 'Tapos na — balik sa home') + ' ✓</a>') +
      '</div>';
    main.appendChild(pager);
    pager.querySelector('#doneToggle').addEventListener('change', function (e) { setDone(m.file, e.target.checked); });
    pager.querySelector('#nextBtn').addEventListener('click', function () { setDone(m.file, true); });
  }

  function buildFooter() {
    var f = document.createElement('footer');
    f.className = 'site-footer';
    var wideMain = document.getElementById('main');
    f.innerHTML =
      '<div class="wrap' + (wideMain && wideMain.classList.contains('wide') ? ' wide' : '') + '">' +
        '<p class="disclaimer" role="note">' +
          b('General information only, not tax or accounting advice. Your RDO will confirm which books you need.',
            'Pangkalahatang impormasyon lamang ito, hindi tax o accounting advice. Ang RDO mo ang magkukumpirma kung aling mga libro ang kailangan mo.') +
        '</p>' +
        '<p><strong>' + b('As of November 2026', 'Updated hanggang Nobyembre 2026') + '</strong></p>' +
        '<p>' + b('Made by @missniceph (“Nice to Know”). Not affiliated with the BIR.',
                  'Gawa ni @missniceph (“Nice to Know”). Walang kaugnayan sa BIR.') + '</p>' +
        '<p>' + b('Privacy: no tracking, no accounts. Anything you type in the practice tools stays on this page and is never sent anywhere. Your progress is saved only in this browser.',
                  'Privacy: walang tracking, walang account. Lahat ng ita-type mo sa practice tools ay nasa page lang na ito at hindi ipinapadala kahit saan. Ang progress mo ay naka-save lang sa browser na ito.') + '</p>' +
      '</div>';
    document.body.appendChild(f);
  }

  /* ---- Saved checklists: <ul class="checklist" data-save="key"> with checkboxes ---- */
  function initChecklists() {
    document.querySelectorAll('[data-save]').forEach(function (list) {
      var key = 'check:' + list.getAttribute('data-save');
      var saved = store.getJSON(key, {});
      var boxes = list.querySelectorAll('input[type="checkbox"]');
      boxes.forEach(function (cb, i) {
        cb.checked = !!saved[i];
        cb.addEventListener('change', function () {
          var s = {};
          boxes.forEach(function (c, j) { if (c.checked) s[j] = 1; });
          store.setJSON(key, s);
        });
      });
    });
    document.querySelectorAll('[data-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-reset');
        var list = document.querySelector('[data-save="' + name + '"]');
        if (!list) return;
        list.querySelectorAll('input[type="checkbox"]').forEach(function (c) { c.checked = false; });
        store.remove('check:' + name);
      });
    });
  }

  /* ---- Quick quizzes: <div class="quiz" data-answer="dr"> with buttons data-pick="dr|cr" ---- */
  function initQuizzes() {
    document.querySelectorAll('.quiz').forEach(function (q) {
      var answer = q.getAttribute('data-answer');
      var out = q.querySelector('.result');
      q.querySelectorAll('[data-pick]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var right = btn.getAttribute('data-pick') === answer;
          out.className = 'result ' + (right ? 'good' : 'bad');
          var why = q.querySelector('.why-text');
          out.innerHTML = (right ? b('✓ Correct!', '✓ Tama!') : b('Not quite.', 'Hindi pa.')) + ' ' + (why ? why.innerHTML : '');
        });
      });
    });
  }

  function init() {
    buildHeader();
    buildModuleChrome(moduleIndex());
    buildFooter();
    initChecklists();
    initQuizzes();
    refreshChrome();
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { refreshChrome(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    }
  }

  window.BFT = {
    store: store,
    MODULES: MODULES,
    b: b,
    t: t,
    esc: esc,
    lang: function () { return lang; },
    peso: function (n) {
      var neg = n < 0; n = Math.abs(n);
      var s = n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return (neg ? '−₱' : '₱') + s;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
