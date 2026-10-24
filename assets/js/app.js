/* PlayNova core: storage, shared UI (header/footer), effects, helpers */
(function () {
  'use strict';

  /* ---------- storage ---------- */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var PN = window.PN = { LS: LS };
  var E = PN.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  PN.$ = function (s, r) { return (r || document).querySelector(s); };
  PN.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  PN.config = Object.assign({ adsEnabled: true, passcode: 'playnova', customCategories: [] }, LS.get('pn_config', {}));
  PN.saveConfig = function () { LS.set('pn_config', PN.config); };
  PN.categories = function () { return window.PN_CATEGORIES.concat(PN.config.customCategories || []); };
  PN.catIcon = function (c) { return { 'Puzzle': '🧩', 'Action': '⚔️', 'Racing': '🏎️', 'Arcade': '👾', 'Adventure': '🗺️', 'Brain Training': '🧠', 'Sports': '⚽', 'Board': '🎲' }[c] || '🎮'; };
  PN.fmt = function (n) { n = +n || 0; return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n); };
  PN.today = function () { return new Date().toISOString().slice(0, 10); };

  /* only allow local game files or http(s) – blocks javascript: / data: URLs */
  PN.safeUrl = function (u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|games\/|\.\/games\/)/i.test(u) ? u : '';
  };

  /* ---------- games ---------- */
  PN.games = function () {
    var g = LS.get('pn_games', null);
    if (Array.isArray(g)) {
      if (LS.get('pn_ver', 0) !== window.PN_VER) {
        var have = {}; g.forEach(function (x) { have[x.id] = 1; });
        window.PN_DEFAULT_GAMES.forEach(function (d) { if (!have[d.id]) g.unshift(JSON.parse(JSON.stringify(d))); });
        LS.set('pn_games', g); LS.set('pn_ver', window.PN_VER);
      }
      return g;
    }
    return JSON.parse(JSON.stringify(window.PN_DEFAULT_GAMES));
  };
  PN.saveGames = function (g) { LS.set('pn_games', g); };
  PN.byId = function (id) { return PN.games().filter(function (g) { return g.id === id; })[0]; };
  PN.extraPlays = function () { return LS.get('pn_plays', {}); };
  PN.plays = function (g) { return (+g.plays || 0) + (PN.extraPlays()[g.id] || 0); };
  PN.addPlay = function (id) { var p = PN.extraPlays(); p[id] = (p[id] || 0) + 1; LS.set('pn_plays', p); };

  PN.cleanGame = function (g) {
    if (!g || typeof g !== 'object') return null;
    var id = String(g.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
    var title = String(g.title || '').trim().slice(0, 60);
    var src = PN.safeUrl(g.src);
    if (!id || !title || !src) return null;
    var hex = function (c, d) { return /^#[0-9a-f]{6}$/i.test(c) ? c : d; };
    return {
      id: id, title: title, category: String(g.category || 'Arcade').slice(0, 30),
      type: g.type === 'embed' ? 'embed' : 'local', src: src,
      icon: Array.from(String(g.icon || '🎮')).slice(0, 3).join(''),
      c1: hex(g.c1, '#7c5cff'), c2: hex(g.c2, '#22d3ee'), thumb: PN.safeUrl(g.thumb),
      desc: String(g.desc || '').slice(0, 400), controls: String(g.controls || '').slice(0, 160),
      tags: Array.isArray(g.tags) ? g.tags.map(function (t) { return String(t).slice(0, 20); }).slice(0, 8) : [],
      featured: !!g.featured, popular: !!g.popular, isNew: !!g.isNew,
      plays: Math.max(0, +g.plays || 0), rating: Math.min(5, Math.max(1, +g.rating || 4.5)),
      added: String(g.added || PN.today()).slice(0, 10)
    };
  };

  /* ---------- favourites / recent / player ---------- */
  PN.favs = function () { return LS.get('pn_favs', []); };
  PN.isFav = function (id) { return PN.favs().indexOf(id) > -1; };
  PN.toggleFav = function (id) {
    var f = PN.favs(), i = f.indexOf(id);
    if (i > -1) f.splice(i, 1); else f.unshift(id);
    LS.set('pn_favs', f); return i === -1;
  };
  PN.recent = function () { return LS.get('pn_recent', []); };
  PN.pushRecent = function (id) {
    var r = PN.recent().filter(function (x) { return x !== id; }); r.unshift(id); LS.set('pn_recent', r.slice(0, 8));
  };
  PN.player = function () { return LS.get('pn_name', 'Player'); };
  PN.setPlayer = function (n) { n = String(n || '').replace(/[<>]/g, '').trim().slice(0, 16) || 'Player'; LS.set('pn_name', n); return n; };

  /* ---------- scores ---------- */
  PN.scores = function () {
    var s = LS.get('pn_scores', null);
    return s && typeof s === 'object' ? s : JSON.parse(JSON.stringify(window.PN_SEED_SCORES || {}));
  };
  PN.addScore = function (id, name, score) {
    var s = PN.scores(), a = s[id] || [], prev = a.length ? a[0].score : 0;
    a.push({ name: name, score: score, date: Date.now() });
    a.sort(function (x, y) { return y.score - x.score; });
    s[id] = a.slice(0, 20); LS.set('pn_scores', s);
    return score > prev;
  };
  PN.topScores = function (id, n) { return (PN.scores()[id] || []).slice(0, n || 10); };
  PN.allTop = function (n) {
    var s = PN.scores(), out = [];
    Object.keys(s).forEach(function (id) { s[id].forEach(function (r) { out.push({ game: id, name: r.name, score: r.score, date: r.date }); }); });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, n || 10);
  };

  /* ---------- cards ---------- */
  PN.card = function (g) {
    var fav = PN.isFav(g.id), img = g.thumb && PN.safeUrl(g.thumb), url = 'game.html?id=' + encodeURIComponent(g.id);
    return '<article class="game-card tilt reveal">' +
      '<a class="cover" href="' + url + '" aria-label="Play ' + E(g.title) + '">' +
      '<div class="thumb" style="--c1:' + E(g.c1) + ';--c2:' + E(g.c2) + '">' +
      (img ? '<img loading="lazy" src="' + E(img) + '" alt="' + E(g.title) + ' thumbnail">' : '<span class="ico" aria-hidden="true">' + E(g.icon || '🎮') + '</span>') +
      '<span class="badges">' + (g.isNew ? '<b class="bd new">NEW</b>' : '') + (g.popular ? '<b class="bd hot">HOT</b>' : '') + '</span>' +
      '<span class="playchip">▶ Play</span></div></a>' +
      '<button type="button" class="fav' + (fav ? ' on' : '') + '" data-fav="' + E(g.id) + '" aria-pressed="' + fav + '" aria-label="Favourite ' + E(g.title) + '">' + (fav ? '♥' : '♡') + '</button>' +
      '<a class="meta" href="' + url + '"><h3>' + E(g.title) + '</h3><p><span>' + PN.catIcon(g.category) + ' ' + E(g.category) + '</span><span class="rate">★ ' + (+g.rating || 4.5).toFixed(1) + '</span></p></a></article>';
  };

  /* ---------- ads ---------- */
  PN.ad = function (name, w, h, label) {
    if (!PN.config.adsEnabled) return '';
    var A = window.PN_ADS || {}, inner;
    if (A.client && A.slots && A.slots[name]) {
      inner = '<ins class="adsbygoogle" style="display:inline-block;width:' + (+w) + 'px;height:' + (+h) + 'px" data-ad-client="' + E(A.client) + '" data-ad-slot="' + E(A.slots[name]) + '"></ins>';
    } else {
      inner = '<span>Advertisement</span><small>' + (+w) + '×' + (+h) + ' · ' + E(label || name) + '</small>';
    }
    return '<div class="ad-slot" style="--w:' + (+w) + 'px;--h:' + (+h) + 'px" data-ad="' + E(name) + '">' + inner + '</div>';
  };
  PN.mountAds = function () {
    PN.$$('.ad-mount').forEach(function (el) {
      if (el.getAttribute('data-done')) return;
      el.setAttribute('data-done', '1');
      el.innerHTML = PN.ad(el.getAttribute('data-ad'), el.getAttribute('data-w'), el.getAttribute('data-h'), el.getAttribute('data-label'));
    });
    var A = window.PN_ADS;
    if (A && A.client && PN.config.adsEnabled) {
      if (!document.getElementById('adsjs')) {
        var s = document.createElement('script');
        s.id = 'adsjs'; s.async = true; s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(A.client);
        document.head.appendChild(s);
      }
      PN.$$('.adsbygoogle').forEach(function (el) {
        if (el.getAttribute('data-pushed')) return;
        el.setAttribute('data-pushed', '1');
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      });
    }
  };

  /* ---------- toast ---------- */
  PN.toast = function (msg) {
    var box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 400); }, 2600);
  };

  /* ---------- confetti ---------- */
  PN.confetti = function () {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'); c.className = 'confetti';
    c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
    var x = c.getContext('2d'), P = [], cols = ['#7c5cff', '#22d3ee', '#ff4d8d', '#ffd23f', '#2ee59d'], i;
    for (i = 0; i < 140; i++) P.push({ x: innerWidth / 2, y: innerHeight * 0.4, vx: (Math.random() - .5) * 16, vy: -Math.random() * 15 - 3, s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % 5] });
    var t0 = performance.now();
    (function f(t) {
      var el = t - t0; x.clearRect(0, 0, c.width, c.height);
      P.forEach(function (p) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.globalAlpha = Math.max(0, 1 - el / 2200); x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); x.restore(); });
      if (el < 2200) requestAnimationFrame(f); else c.remove();
    })(t0);
  };

  /* ---------- reveal on scroll ---------- */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.style.setProperty('--d', (n++ * 0.06) + 's'); en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
  }
  PN.observe = function (root) {
    PN.$$('.reveal:not(.in)', root || document).forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  };

  /* ---------- theme ---------- */
  function applyTheme() { document.documentElement.setAttribute('data-theme', LS.get('pn_theme', 'dark')); }

  /* ---------- header / footer ---------- */
  function logo(id) {
    return '<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>' +
      '<rect x="2" y="8" width="36" height="24" rx="12" fill="url(#' + id + ')"/><rect x="10" y="17" width="10" height="3.6" rx="1.8" fill="#fff"/><rect x="13.2" y="13.8" width="3.6" height="10" rx="1.8" fill="#fff"/>' +
      '<circle cx="27" cy="17" r="2.6" fill="#ffd23f"/><circle cx="31.5" cy="22" r="2.6" fill="#ff4d8d"/></svg>';
  }
  function buildChrome() {
    var h = document.getElementById('site-header'), f = document.getElementById('site-footer');
    var page = location.pathname.split('/').pop() || 'index.html';
    var nav = [['index.html', 'Home'], ['index.html#games', 'Games'], ['index.html#new', 'New'], ['index.html#leaderboard', 'Leaderboard'], ['index.html#premium', 'Premium ✨'], ['about.html', 'About']];
    if (h) {
      h.innerHTML = '<header class="site-header"><div class="wrap hdr">' +
        '<a class="logo" href="index.html" aria-label="PlayNova home">' + logo('lgH') + '<span>Play<b>Nova</b></span></a>' +
        '<nav class="nav" id="nav" aria-label="Main">' + nav.map(function (n) {
          var act = (n[0] === page && n[0].indexOf('#') < 0) || (n[0] === 'index.html' && (page === '' || page === 'index.html')) ? ' class="active"' : '';
          return '<a href="' + n[0] + '"' + act + '>' + n[1] + '</a>';
        }).join('') + '</nav>' +
        '<div class="search"><span class="s-ico">🔍</span><input id="q" type="search" placeholder="Search games…  ( / )" autocomplete="off" aria-label="Search games"><div class="suggest" id="suggest" hidden></div></div>' +
        '<button class="icon-btn" id="themeBtn" type="button" title="Toggle light / dark" aria-label="Toggle theme">' + (LS.get('pn_theme', 'dark') === 'dark' ? '🌙' : '☀️') + '</button>' +
        '<button class="icon-btn burger" id="burger" type="button" aria-label="Menu" aria-expanded="false">☰</button></div></header>';
    }
    if (f) {
      f.innerHTML = '<footer class="site-footer"><div class="wrap foot">' +
        '<div class="fcol brand"><a class="logo" href="index.html">' + logo('lgF') + '<span>Play<b>Nova</b></span></a><p>Free browser games for everyone. No downloads, no sign-up – just pick a game and play on desktop, tablet or mobile.</p></div>' +
        '<div class="fcol"><h4>Explore</h4>' + PN.categories().map(function (c) { return '<a href="index.html#cat=' + encodeURIComponent(c) + '">' + PN.catIcon(c) + ' ' + E(c) + '</a>'; }).join('') + '</div>' +
        '<div class="fcol"><h4>Company</h4><a href="about.html">About Us</a><a href="contact.html">Contact</a><a href="index.html#premium">Premium</a><a href="admin.html">Admin</a></div>' +
        '<div class="fcol"><h4>Legal</h4><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a><a href="sitemap.xml">Sitemap</a></div>' +
        '</div><div class="wrap copy">© ' + new Date().getFullYear() + ' PlayNova. All games belong to their respective owners. Made with ♥ for gamers.</div></footer>';
    }
    var tb = document.getElementById('themeBtn');
    if (tb) tb.addEventListener('click', function () {
      var n = LS.get('pn_theme', 'dark') === 'dark' ? 'light' : 'dark'; LS.set('pn_theme', n); applyTheme(); tb.textContent = n === 'dark' ? '🌙' : '☀️';
    });
    var bg = document.getElementById('burger'), nv = document.getElementById('nav');
    if (bg && nv) {
      bg.addEventListener('click', function () { var o = nv.classList.toggle('open'); bg.setAttribute('aria-expanded', o); });
      nv.addEventListener('click', function (e) { if (e.target.tagName === 'A') nv.classList.remove('open'); });
    }
    bindSearch();
  }

  function bindSearch() {
    var q = document.getElementById('q'), box = document.getElementById('suggest');
    if (!q || !box) return;
    function matches(v) {
      v = v.toLowerCase();
      return PN.games().filter(function (g) { return (g.title + ' ' + g.category + ' ' + (g.tags || []).join(' ')).toLowerCase().indexOf(v) > -1; }).slice(0, 6);
    }
    q.addEventListener('input', function () {
      var v = q.value.trim();
      window.dispatchEvent(new CustomEvent('pn:search', { detail: v }));
      if (!v) { box.hidden = true; return; }
      var m = matches(v);
      box.innerHTML = m.length ? m.map(function (g) {
        return '<a href="game.html?id=' + encodeURIComponent(g.id) + '"><span class="si" style="--c1:' + E(g.c1) + ';--c2:' + E(g.c2) + '">' + E(g.icon) + '</span><span><b>' + E(g.title) + '</b><small>' + E(g.category) + '</small></span></a>';
      }).join('') : '<p>No games found for “' + E(v) + '”</p>';
      box.hidden = false;
    });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = q.value.trim(); box.hidden = true;
        var grid = document.getElementById('allGrid');
        if (grid) { window.dispatchEvent(new CustomEvent('pn:search', { detail: v })); document.getElementById('games').scrollIntoView({ behavior: 'smooth' }); }
        else location.href = 'index.html?q=' + encodeURIComponent(v) + '#games';
      }
      if (e.key === 'Escape') { box.hidden = true; q.blur(); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); q.focus(); }
    });
  }

  /* ---------- background particles + cursor glow ---------- */
  function background() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'); c.id = 'bg'; c.setAttribute('aria-hidden', 'true'); document.body.insertBefore(c, document.body.firstChild);
    var x = c.getContext('2d'), w = 0, h = 0, P = [], i;
    function rs() { w = c.width = innerWidth; h = c.height = innerHeight; }
    rs(); addEventListener('resize', rs);
    for (i = 0; i < 48; i++) P.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 1 + Math.random() * 2.4, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, h: 200 + Math.random() * 140 });
    (function f() {
      x.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        x.beginPath(); x.fillStyle = 'hsla(' + p.h + ',90%,68%,.6)'; x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
      });
      for (var a = 0; a < P.length; a++) for (var b = a + 1; b < P.length; b++) {
        var dx = P[a].x - P[b].x, dy = P[a].y - P[b].y, d = dx * dx + dy * dy;
        if (d < 14000) { x.strokeStyle = 'rgba(140,120,255,' + (0.16 * (1 - d / 14000)) + ')'; x.lineWidth = 1; x.beginPath(); x.moveTo(P[a].x, P[a].y); x.lineTo(P[b].x, P[b].y); x.stroke(); }
      }
      requestAnimationFrame(f);
    })();
    if (matchMedia('(hover: hover)').matches) {
      var g = document.createElement('div'); g.className = 'cursor-glow'; g.setAttribute('aria-hidden', 'true'); document.body.appendChild(g);
      addEventListener('mousemove', function (e) { g.style.transform = 'translate(' + (e.clientX - 150) + 'px,' + (e.clientY - 150) + 'px)'; });
    }
  }

  /* ---------- tilt + favourites (delegated) ---------- */
  document.addEventListener('mousemove', function (e) {
    var t = e.target.closest && e.target.closest('.tilt'); if (!t) return;
    var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    t.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg'); t.style.setProperty('--ry', (px * 11).toFixed(2) + 'deg');
    t.style.setProperty('--mx', ((px + .5) * 100).toFixed(1) + '%'); t.style.setProperty('--my', ((py + .5) * 100).toFixed(1) + '%');
  });
  document.addEventListener('mouseout', function (e) {
    var t = e.target.closest && e.target.closest('.tilt');
    if (t && !t.contains(e.relatedTarget)) { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); }
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-fav]'); if (!b) return;
    e.preventDefault();
    var on = PN.toggleFav(b.getAttribute('data-fav'));
    b.classList.toggle('on', on); b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', on);
    PN.toast(on ? 'Added to favourites ♥' : 'Removed from favourites');
    window.dispatchEvent(new CustomEvent('pn:favs'));
  });

  /* ---------- cookie banner (needed for ad networks) ---------- */
  function cookie() {
    if (LS.get('pn_cookie', null)) return;
    var d = document.createElement('div'); d.className = 'cookie'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookie notice');
    d.innerHTML = '<p>🍪 We use cookies and local storage to save your scores and favourites, and to show relevant ads. See our <a href="privacy.html">Privacy Policy</a>.</p><div><button class="btn btn-ghost btn-sm" data-c="no" type="button">Decline</button><button class="btn btn-primary btn-sm" data-c="yes" type="button">Accept</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { var c = e.target.getAttribute && e.target.getAttribute('data-c'); if (c) { LS.set('pn_cookie', c); d.classList.add('out'); setTimeout(function () { d.remove(); }, 400); } });
  }

  /* ---------- init ---------- */
  applyTheme();
  buildChrome();
  background();
  cookie();
  PN.mountAds();
  PN.observe(document);
})();
