/* PlayNova – home page logic */
(function () {
  'use strict';
  var P = window.PN, E = P.esc, $ = P.$;
  var games = P.games();
  var state = { cat: 'All', sort: 'popular', q: '' };

  var params = new URLSearchParams(location.search);
  state.q = (params.get('q') || '').trim().slice(0, 60);
  function readHash() {
    if (location.hash.indexOf('#cat=') === 0) {
      var c = decodeURIComponent(location.hash.slice(5));
      if (P.categories().indexOf(c) > -1) state.cat = c;
    }
  }
  readHash();
  var qEl = document.getElementById('q'); if (qEl && state.q) qEl.value = state.q;

  function byId(id) { return games.filter(function (g) { return g.id === id; })[0]; }
  function fill(el, list, msg) {
    el.innerHTML = list.length ? list.map(P.card).join('') : '<div class="empty">' + E(msg || 'Nothing here yet.') + '</div>';
    P.observe(el);
  }
  function url(g) { return 'game.html?id=' + encodeURIComponent(g.id); }

  /* ----- stats (count-up) ----- */
  function stats() {
    var total = games.reduce(function (a, g) { return a + P.plays(g); }, 0);
    var players = Object.keys(P.scores()).reduce(function (a, k) { return a + P.scores()[k].length; }, 0);
    var items = [[games.length, '🎮', 'games'], [P.categories().length, '🗂️', 'categories'], [total, '▶️', 'plays'], [players, '🏆', 'scores']];
    var box = document.getElementById('stats');
    box.innerHTML = items.map(function (i) { return '<span class="stat">' + i[1] + ' <b data-n="' + i[0] + '">0</b>' + i[2] + '</span>'; }).join('');
    P.$$('b[data-n]', box).forEach(function (b) {
      var n = +b.getAttribute('data-n'), t0 = performance.now();
      (function f(t) { var k = Math.min(1, (t - t0) / 1100); b.textContent = P.fmt(Math.round(n * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(f); })(t0);
    });
  }

  /* ----- hero slider ----- */
  var hero = document.getElementById('hero');
  var feat = games.filter(function (g) { return g.featured; });
  if (!feat.length) feat = games.slice(0, 3);
  var idx = 0, timer = null;
  function heroHTML(g) {
    var img = g.thumb && P.safeUrl(g.thumb);
    var dots = feat.map(function (_, i) { return '<button class="dot' + (i === idx ? ' on' : '') + '" data-i="' + i + '" aria-label="Show slide ' + (i + 1) + '"></button>'; }).join('');
    return '<div class="hero-art" style="--c1:' + E(g.c1) + ';--c2:' + E(g.c2) + '">' + (img ? '<img src="' + E(img) + '" alt="' + E(g.title) + '">' : '<span class="hero-ico" aria-hidden="true">' + E(g.icon) + '</span>') + '<i class="orb o1"></i><i class="orb o2"></i></div>' +
      '<div class="hero-info"><span class="pill">' + P.catIcon(g.category) + ' ' + E(g.category) + ' · Featured</span><h2>' + E(g.title) + '</h2><p>' + E(g.desc) + '</p>' +
      '<div class="meta-row"><span><b>★ ' + (+g.rating).toFixed(1) + '</b> rating</span><span>▶ ' + P.fmt(P.plays(g)) + ' plays</span></div>' +
      '<div><a class="btn btn-play" href="' + url(g) + '"><span class="tri"></span> Play Now</a></div></div>' +
      '<div class="hero-nav"><button class="arrow" data-dir="-1" aria-label="Previous">‹</button>' + dots + '<button class="arrow" data-dir="1" aria-label="Next">›</button></div>';
  }
  function show(i) {
    idx = (i + feat.length) % feat.length;
    hero.classList.remove('swap'); void hero.offsetWidth;
    hero.innerHTML = heroHTML(feat[idx]); hero.classList.add('swap');
  }
  function auto() { clearInterval(timer); if (feat.length > 1) timer = setInterval(function () { show(idx + 1); }, 6500); }
  if (!games.length) {
    hero.innerHTML = '<div class="empty" style="grid-column:1/-1;border:0">No games yet – add some from the <a href="admin.html">admin panel</a>.</div>';
  } else {
    show(0); auto();
    hero.addEventListener('click', function (e) {
      var d = e.target.closest('[data-dir]'), dot = e.target.closest('[data-i]');
      if (d) { show(idx + (+d.getAttribute('data-dir'))); auto(); }
      if (dot) { show(+dot.getAttribute('data-i')); auto(); }
    });
    hero.addEventListener('mouseenter', function () { clearInterval(timer); });
    hero.addEventListener('mouseleave', auto);
  }

  /* ----- trending ----- */
  var top = games.slice().sort(function (a, b) { return P.plays(b) - P.plays(a); }).slice(0, 5);
  document.getElementById('trend').innerHTML = top.map(function (g) {
    return '<li><a href="' + url(g) + '"><span class="rank"></span><span class="si" style="--c1:' + E(g.c1) + ';--c2:' + E(g.c2) + '">' + E(g.icon) + '</span><span><strong>' + E(g.title) + '</strong><small>' + P.fmt(P.plays(g)) + ' plays</small></span></a></li>';
  }).join('');

  /* ----- chips ----- */
  function chips() {
    var cats = ['All'].concat(P.categories());
    document.getElementById('chips').innerHTML = cats.map(function (c) {
      var n = c === 'All' ? games.length : games.filter(function (g) { return g.category === c; }).length;
      return '<button type="button" class="chip' + (state.cat === c ? ' on' : '') + '" data-cat="' + E(c) + '">' + (c === 'All' ? '🌈' : P.catIcon(c)) + ' ' + E(c) + ' <small>' + n + '</small></button>';
    }).join('');
  }
  document.getElementById('chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    state.cat = b.getAttribute('data-cat'); chips(); renderAll();
    document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('hashchange', function () { var o = state.cat; state.cat = 'All'; readHash(); if (o !== state.cat || location.hash.indexOf('#cat=') === 0) { chips(); renderAll(); } });

  /* ----- grids ----- */
  function match(g, q) { return (g.title + ' ' + g.category + ' ' + (g.tags || []).join(' ') + ' ' + g.desc).toLowerCase().indexOf(q.toLowerCase()) > -1; }
  function list() {
    var l = games.filter(function (g) { return (state.cat === 'All' || g.category === state.cat) && (!state.q || match(g, state.q)); });
    var s = state.sort;
    l.sort(function (a, b) {
      if (s === 'new') return String(b.added).localeCompare(String(a.added));
      if (s === 'rating') return b.rating - a.rating;
      if (s === 'az') return a.title.localeCompare(b.title);
      return P.plays(b) - P.plays(a);
    });
    return l;
  }
  function renderAll() {
    var l = list(), t = '🎮 ' + (state.cat === 'All' ? 'All Games' : state.cat + ' Games');
    if (state.q) t += ' · “' + state.q + '”';
    document.getElementById('allTitle').textContent = t + ' (' + l.length + ')';
    fill(document.getElementById('allGrid'), l, 'No games match your search. Try another word or category.');
  }
  function renderRows() {
    fill(document.getElementById('popGrid'), games.filter(function (g) { return g.popular; }).sort(function (a, b) { return P.plays(b) - P.plays(a); }).slice(0, 8), 'Mark games as “Popular” in the admin panel.');
    fill(document.getElementById('newGrid'), games.filter(function (g) { return g.isNew; }).sort(function (a, b) { return String(b.added).localeCompare(String(a.added)); }).slice(0, 8), 'Mark games as “New” in the admin panel.');
    var rec = P.recent().map(byId).filter(Boolean), fav = P.favs().map(byId).filter(Boolean);
    document.getElementById('recentWrap').hidden = !rec.length; if (rec.length) fill(document.getElementById('recentGrid'), rec.slice(0, 6));
    document.getElementById('favWrap').hidden = !fav.length; if (fav.length) fill(document.getElementById('favGrid'), fav);
  }
  document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; renderAll(); });
  window.addEventListener('pn:search', function (e) { state.q = String(e.detail || '').slice(0, 60); renderAll(); });
  window.addEventListener('pn:favs', renderRows);

  /* ----- daily pick ----- */
  if (games.length) {
    var d = games[Math.floor(Date.now() / 864e5) % games.length];
    document.getElementById('daily').innerHTML = '<h3>🎯 Daily pick</h3><a class="game-card" style="display:block;transform:none" href="' + url(d) + '"><div class="thumb" style="--c1:' + E(d.c1) + ';--c2:' + E(d.c2) + '"><span class="ico">' + E(d.icon) + '</span></div><div class="meta"><h3>' + E(d.title) + '</h3><p><span>' + E(d.category) + '</span><span class="rate">★ ' + (+d.rating).toFixed(1) + '</span></p></div></a>';
  }

  /* ----- leaderboard ----- */
  var sel = document.getElementById('lbSel');
  sel.innerHTML = '<option value="all">All games</option>' + games.map(function (g) { return '<option value="' + E(g.id) + '">' + E(g.title) + '</option>'; }).join('');
  function board() {
    var id = sel.value, rows = id === 'all' ? P.allTop(10) : P.topScores(id, 10).map(function (r) { return { game: id, name: r.name, score: r.score, date: r.date }; });
    var medals = ['🥇', '🥈', '🥉'];
    document.getElementById('lbBody').innerHTML = rows.length ? rows.map(function (r, i) {
      var g = byId(r.game);
      return '<tr><td>' + (medals[i] || (i + 1)) + '</td><td>' + E(r.name) + '</td><td>' + (g ? '<a href="' + url(g) + '">' + E(g.icon + ' ' + g.title) + '</a>' : E(r.game)) + '</td><td class="num">' + Number(r.score).toLocaleString() + '</td><td>' + new Date(r.date).toLocaleDateString() + '</td></tr>';
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">No scores yet – be the first to play! 🎮</td></tr>';
  }
  sel.addEventListener('change', board);

  /* ----- premium waiting list ----- */
  document.getElementById('waitForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = document.getElementById('waitEmail').value.trim(), err = document.getElementById('waitErr');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { err.className = 'err'; err.textContent = 'Please enter a valid email address.'; return; }
    var w = P.LS.get('pn_waitlist', []); if (w.indexOf(v) < 0) w.push(v); P.LS.set('pn_waitlist', w);
    err.className = 'err ok'; err.textContent = 'You are on the list – thank you! 🎉';
    document.getElementById('waitEmail').value = ''; P.confetti();
  });

  /* ----- go ----- */
  stats(); chips(); renderRows(); renderAll(); board(); P.observe(document);
  if (location.hash && document.querySelector(location.hash.split('=')[0])) setTimeout(function () { var t = document.querySelector(location.hash.split('=')[0]); if (t) t.scrollIntoView(); }, 60);
})();
