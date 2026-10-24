/* PlayNova – single game page */
(function () {
  'use strict';
  var P = window.PN, E = P.esc, $ = function (id) { return document.getElementById(id); };
  var id = new URLSearchParams(location.search).get('id') || '';
  var g = P.byId(id);

  if (!g) {
    $('gameLayout').hidden = true; $('notfound').hidden = false; $('crumbTitle').textContent = 'Not found';
    document.title = 'Game not found – PlayNova';
    return;
  }

  /* ----- page details + SEO ----- */
  document.title = 'Play ' + g.title + ' Online Free – PlayNova';
  function setMeta(sel, val) { var m = document.querySelector(sel); if (m) m.setAttribute('content', val); }
  var desc = g.title + ' – ' + g.desc;
  setMeta('meta[name="description"]', desc.slice(0, 158));
  setMeta('meta[property="og:title"]', 'Play ' + g.title + ' on PlayNova');
  setMeta('meta[property="og:description"]', g.desc);
  var can = document.querySelector('link[rel="canonical"]'); if (can) can.setAttribute('href', 'https://www.example.com/game.html?id=' + encodeURIComponent(g.id));
  var ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'VideoGame', name: g.title, description: g.desc, genre: g.category, playMode: 'SinglePlayer', applicationCategory: 'Game', operatingSystem: 'Any (web browser)', aggregateRating: { '@type': 'AggregateRating', ratingValue: (+g.rating).toFixed(1), ratingCount: Math.max(10, Math.round(P.plays(g) / 20)) } });
  document.head.appendChild(ld);

  $('crumbTitle').textContent = g.title;
  var cc = $('crumbCat'); cc.textContent = g.category; cc.href = 'index.html#cat=' + encodeURIComponent(g.category);
  $('gTitle').textContent = g.title;
  var gi = $('gIcon'); gi.textContent = g.icon; gi.style.setProperty('--c1', g.c1); gi.style.setProperty('--c2', g.c2);
  var st = $('start'); st.style.setProperty('--c1', g.c1); st.style.setProperty('--c2', g.c2);
  $('sIcon').textContent = g.icon; $('sTitle').textContent = g.title; $('sDesc').textContent = g.desc;
  $('gDesc').textContent = g.desc; $('gControls').textContent = g.controls || 'Use your mouse, keyboard or touch screen.';
  $('gTags').innerHTML = [g.category].concat(g.tags || []).map(function (t) { return '<span>#' + E(t) + '</span>'; }).join('');
  $('infoCard').innerHTML = '<h3>ℹ️ Game info</h3><p style="margin:4px 0;color:var(--muted)">Category: <b style="color:var(--text)">' + E(g.category) + '</b></p><p style="margin:4px 0;color:var(--muted)">Rating: <b style="color:var(--y)">★ ' + (+g.rating).toFixed(1) + '</b></p><p style="margin:4px 0;color:var(--muted)">Plays: <b style="color:var(--text)">' + P.fmt(P.plays(g)) + '</b></p><p style="margin:4px 0;color:var(--muted)">Added: <b style="color:var(--text)">' + E(g.added) + '</b></p>';

  /* ----- favourites / share ----- */
  function favUI() { var f = P.isFav(g.id); $('favBtn').textContent = (f ? '♥ Favourited' : '♡ Favourite'); }
  favUI();
  $('favBtn').addEventListener('click', function () { var on = P.toggleFav(g.id); favUI(); P.toast(on ? 'Added to favourites ♥' : 'Removed from favourites'); });
  $('shareBtn').addEventListener('click', function () {
    var u = location.href;
    if (navigator.share) { navigator.share({ title: g.title, text: 'Play ' + g.title + ' on PlayNova!', url: u }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { P.toast('Link copied 🔗'); }, function () { P.toast('Copy the link from the address bar'); });
    else P.toast('Copy the link from the address bar');
  });

  /* ----- player name ----- */
  var pn = $('pname'); pn.value = P.player() === 'Player' ? '' : P.player();
  pn.addEventListener('change', function () { pn.value = P.setPlayer(pn.value); P.toast('Playing as ' + pn.value); });

  /* ----- leaderboard ----- */
  function board() {
    var rows = P.topScores(g.id, 8);
    $('board').innerHTML = rows.length ? rows.map(function (r, i) { return '<li><span>' + (['🥇', '🥈', '🥉'][i] || (i + 1) + '.') + ' ' + E(r.name) + '</span><b>' + Number(r.score).toLocaleString() + '</b></li>'; }).join('') : '<li><span>No scores yet – be first!</span></li>';
  }
  board();

  /* ----- start the game ----- */
  var frame = null, started = false;
  function launch() {
    var src = P.safeUrl(g.src);
    if (!src) { P.toast('This game has an invalid address.'); return; }
    if (started) return; started = true;
    var bar = $('loadbar'), fill = $('loadfill'); bar.style.display = 'block'; $('playBtn').style.display = 'none';
    var w = 0, iv = setInterval(function () { w = Math.min(90, w + 12 + Math.random() * 14); fill.style.width = w + '%'; }, 90);
    frame = document.createElement('iframe');
    frame.title = g.title; frame.src = src;
    frame.setAttribute('allow', 'fullscreen; autoplay; gamepad');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms');
    frame.addEventListener('load', function () {
      clearInterval(iv); fill.style.width = '100%';
      setTimeout(function () { st.classList.add('gone'); try { frame.focus(); } catch (e) {} }, 250);
    });
    $('stage').appendChild(frame);
    P.addPlay(g.id); P.pushRecent(g.id);
  }
  $('playBtn').addEventListener('click', launch);
  if (location.hash === '#play') launch();

  $('restartBtn').addEventListener('click', function () { if (frame) { frame.src = frame.src; P.toast('Game restarted'); } else launch(); });
  $('fsBtn').addEventListener('click', function () {
    var s = $('stage');
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (s.requestFullscreen) s.requestFullscreen().catch(function () { P.toast('Fullscreen is not available'); });
    else P.toast('Fullscreen is not supported on this device');
  });

  /* ----- scores sent by the game (postMessage) ----- */
  window.addEventListener('message', function (e) {
    if (!frame || e.source !== frame.contentWindow) return;
    var d = e.data; if (!d || d.type !== 'pn-score') return;
    var s = Math.floor(Number(d.score)); if (!isFinite(s) || s <= 0) return;
    var name = P.player(), top = P.topScores(g.id, 1)[0];
    var best = !top || s > top.score;
    P.addScore(g.id, name, s); board();
    P.toast('Score ' + s.toLocaleString() + ' saved for ' + name + (best ? ' – new #1! 🏆' : ''));
    if (best) P.confetti();
  });

  /* ----- similar games ----- */
  var all = P.games().filter(function (x) { return x.id !== g.id; });
  var same = all.filter(function (x) { return x.category === g.category; });
  var rest = all.filter(function (x) { return x.category !== g.category; });
  var sim = same.concat(rest).slice(0, 6);
  $('similar').innerHTML = sim.length ? sim.map(P.card).join('') : '<div class="empty">More games coming soon!</div>';
  P.observe(document);
})();
