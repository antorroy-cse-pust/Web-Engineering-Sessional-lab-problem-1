/* PlayNova – admin panel (no coding needed to add / remove / organise games) */
(function () {
  'use strict';
  var P = window.PN, E = P.esc, $ = function (id) { return document.getElementById(id); };
  var games = P.games(), editing = null;

  /* ----- login gate (demo: client-side only) ----- */
  function unlocked() { try { return sessionStorage.getItem('pn_admin') === '1'; } catch (e) { return false; } }
  function showApp() { $('gate').hidden = true; $('app').hidden = false; renderAll(); }
  if (unlocked()) showApp();
  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('pass').value === P.config.passcode) { try { sessionStorage.setItem('pn_admin', '1'); } catch (x) {} showApp(); P.toast('Welcome back, admin 👋'); }
    else { $('loginErr').textContent = 'Wrong passcode – try again.'; $('pass').value = ''; }
  });
  $('logout').addEventListener('click', function () { try { sessionStorage.removeItem('pn_admin'); } catch (e) {} location.reload(); });

  /* ----- tabs ----- */
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]'); if (!b) return;
    P.$$('.tab').forEach(function (t) { t.classList.toggle('on', t === b); });
    P.$$('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== b.getAttribute('data-tab'); });
    if (b.getAttribute('data-tab') === 'dash') animateBars();
  });

  function persist() { P.saveGames(games); renderAll(); }
  function renderAll() { dash(); table(); settings(); inbox(); catSelects(); }

  /* ----- dashboard ----- */
  function dash() {
    var plays = games.reduce(function (a, g) { return a + P.plays(g); }, 0);
    var sc = P.scores(), nScores = Object.keys(sc).reduce(function (a, k) { return a + sc[k].length; }, 0);
    var top = games.slice().sort(function (a, b) { return P.plays(b) - P.plays(a); })[0];
    var k = [[games.length, 'Games'], [P.categories().length, 'Categories'], [P.fmt(plays), 'Total plays'], [nScores, 'Leaderboard scores'], [top ? top.title : '–', 'Most played'], [P.LS.get('pn_waitlist', []).length, 'Premium waiting list']];
    $('kpis').innerHTML = k.map(function (x) { return '<div class="kpi"><b>' + E(x[0]) + '</b><span>' + x[1] + '</span></div>'; }).join('');
    var max = Math.max.apply(null, games.map(P.plays).concat([1]));
    $('bars').innerHTML = games.slice().sort(function (a, b) { return P.plays(b) - P.plays(a); }).map(function (g) {
      return '<div class="bar"><span>' + E(g.icon + ' ' + g.title) + '</span><i data-w="' + Math.round(P.plays(g) / max * 100) + '"></i><b>' + P.fmt(P.plays(g)) + '</b></div>';
    }).join('') || '<p style="color:var(--muted)">No games yet.</p>';
    animateBars();
  }
  function animateBars() { setTimeout(function () { P.$$('.bar i').forEach(function (i) { i.style.width = i.getAttribute('data-w') + '%'; }); }, 60); }

  /* ----- games table ----- */
  function catSelects() {
    var cur = $('gCat').value || 'all';
    $('gCat').innerHTML = '<option value="all">All categories</option>' + P.categories().map(function (c) { return '<option>' + E(c) + '</option>'; }).join('');
    $('gCat').value = P.categories().indexOf(cur) > -1 ? cur : 'all';
    var fc = $('f_cat').value;
    $('f_cat').innerHTML = P.categories().map(function (c) { return '<option>' + E(c) + '</option>'; }).join('');
    if (fc) $('f_cat').value = fc;
  }
  function filtered() {
    var q = $('gSearch').value.trim().toLowerCase(), c = $('gCat').value;
    return games.filter(function (g) { return (c === 'all' || g.category === c) && (!q || (g.title + g.id).toLowerCase().indexOf(q) > -1); });
  }
  function table() {
    var rows = filtered(), canMove = rows.length === games.length;
    $('gBody').innerHTML = rows.map(function (g) {
      var i = games.indexOf(g), img = g.thumb && P.safeUrl(g.thumb);
      function sw(k, on) { return '<label class="sw"><input type="checkbox" data-flag="' + k + '" data-id="' + E(g.id) + '"' + (on ? ' checked' : '') + '><i></i></label>'; }
      return '<tr><td><div class="mini-th" style="--c1:' + E(g.c1) + ';--c2:' + E(g.c2) + '">' + (img ? '<img src="' + E(img) + '" alt="">' : E(g.icon)) + '</div></td>' +
        '<td><strong>' + E(g.title) + '</strong><br><small style="color:var(--muted)">' + E(g.id) + ' · ' + (g.type === 'embed' ? 'embedded' : 'hosted') + '</small></td><td>' + E(g.category) + '</td>' +
        '<td>' + sw('featured', g.featured) + '</td><td>' + sw('popular', g.popular) + '</td><td>' + sw('isNew', g.isNew) + '</td><td class="num">' + P.fmt(P.plays(g)) + '</td>' +
        '<td><div class="acts"><button data-act="up" data-id="' + E(g.id) + '" title="Move up"' + (canMove && i > 0 ? '' : ' disabled') + '>▲</button><button data-act="down" data-id="' + E(g.id) + '" title="Move down"' + (canMove && i < games.length - 1 ? '' : ' disabled') + '>▼</button>' +
        '<button data-act="edit" data-id="' + E(g.id) + '" title="Edit">✏️</button><button data-act="open" data-id="' + E(g.id) + '" title="Open on site">👁</button><button data-act="del" data-id="' + E(g.id) + '" title="Delete">🗑️</button></div></td></tr>';
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted)">No games found.</td></tr>';
  }
  $('gSearch').addEventListener('input', table); $('gCat').addEventListener('change', table);
  function find(id) { return games.filter(function (g) { return g.id === id; })[0]; }
  $('gBody').addEventListener('change', function (e) {
    var f = e.target.getAttribute('data-flag'); if (!f) return;
    var g = find(e.target.getAttribute('data-id')); if (!g) return;
    g[f] = e.target.checked; P.saveGames(games); dash(); P.toast('Updated “' + g.title + '”');
  });
  $('gBody').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var g = find(b.getAttribute('data-id')); if (!g) return; var i = games.indexOf(g), a = b.getAttribute('data-act');
    if (a === 'edit') openModal(g);
    if (a === 'open') window.open('game.html?id=' + encodeURIComponent(g.id), '_blank');
    if (a === 'up' && i > 0) { games.splice(i - 1, 0, games.splice(i, 1)[0]); persist(); }
    if (a === 'down' && i < games.length - 1) { games.splice(i + 1, 0, games.splice(i, 1)[0]); persist(); }
    if (a === 'del' && confirm('Delete “' + g.title + '”? This removes it from the site.')) { games.splice(i, 1); persist(); P.toast('Game deleted'); }
  });

  /* ----- add / edit modal ----- */
  var F = ['title', 'id', 'cat', 'type', 'src', 'icon', 'thumb', 'c1', 'c2', 'desc', 'controls', 'tags', 'rating'].reduce(function (o, k) { o[k] = $('f_' + k); return o; }, {});
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50); }
  var idTouched = false;
  function draft() {
    return { id: F.id.value, title: F.title.value || 'Game title', category: F.cat.value, type: F.type.value, src: F.src.value, icon: F.icon.value || '🎮', c1: F.c1.value, c2: F.c2.value, thumb: F.thumb.value,
      desc: F.desc.value, controls: F.controls.value, tags: F.tags.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
      rating: parseFloat(F.rating.value) || 4.5, featured: $('f_featured').checked, popular: $('f_popular').checked, isNew: $('f_new').checked,
      plays: editing ? editing.plays : 0, added: editing ? editing.added : P.today() };
  }
  function preview() { var d = draft(); d.rating = d.rating || 4.5; $('pv').innerHTML = P.card(Object.assign({}, d, { thumb: P.safeUrl(d.thumb) })); P.$$('#pv .reveal').forEach(function (x) { x.classList.add('in'); }); }
  function openModal(g) {
    editing = g || null; idTouched = !!g; $('fErr').textContent = '';
    $('mTitle').textContent = g ? 'Edit “' + g.title + '”' : 'Add game';
    var d = g || { id: '', title: '', category: P.categories()[0], type: 'local', src: 'games/', icon: '🎮', thumb: '', c1: '#7c5cff', c2: '#22d3ee', desc: '', controls: '', tags: [], rating: 4.5, featured: false, popular: false, isNew: true };
    F.title.value = d.title; F.id.value = d.id; F.id.readOnly = !!g; F.cat.value = d.category; F.type.value = d.type; F.src.value = d.src; F.icon.value = d.icon; F.thumb.value = d.thumb || '';
    F.c1.value = d.c1; F.c2.value = d.c2; F.desc.value = d.desc; F.controls.value = d.controls; F.tags.value = (d.tags || []).join(', '); F.rating.value = d.rating;
    $('f_featured').checked = !!d.featured; $('f_popular').checked = !!d.popular; $('f_new').checked = !!d.isNew;
    $('modal').hidden = false; document.body.style.overflow = 'hidden'; preview(); F.title.focus();
  }
  function closeModal() { $('modal').hidden = true; document.body.style.overflow = ''; }
  $('addBtn').addEventListener('click', function () { openModal(null); });
  $('cancelBtn').addEventListener('click', closeModal);
  $('modal').addEventListener('mousedown', function (e) { if (e.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); });
  $('gForm').addEventListener('input', function (e) {
    if (e.target === F.title && !idTouched) F.id.value = slug(F.title.value);
    if (e.target === F.id) idTouched = true;
    if (e.target === F.type && !editing) { if (F.type.value === 'embed' && F.src.value.indexOf('games/') === 0) F.src.value = 'https://'; if (F.type.value === 'local' && /^https?:/.test(F.src.value)) F.src.value = 'games/'; }
    preview();
  });
  $('f_embed').addEventListener('input', function () {
    var v = $('f_embed').value.trim(), m = v.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i), url = m ? m[1] : (/^https?:\/\/\S+$/i.test(v) ? v : '');
    if (url.indexOf('//') === 0) url = 'https:' + url;
    if (!P.safeUrl(url)) return;
    F.type.value = 'embed'; F.src.value = url;
    var t = v.match(/title\s*=\s*["']([^"']+)["']/i);
    if (!F.title.value) { F.title.value = t ? t[1].slice(0, 60) : ''; if (!idTouched) F.id.value = slug(F.title.value); }
    if (!F.desc.value) F.desc.value = 'Play this free online game right in your browser.';
    preview(); $('fErr').textContent = '';
  });
  $('testBtn').addEventListener('click', function () { var u = P.safeUrl(F.src.value); if (u) window.open(u, '_blank', 'noopener'); else $('fErr').textContent = 'Enter a valid address first (games/… or https://…).'; });
  $('gForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var d = draft(), err = $('fErr'); d.id = slug(d.id);
    if (d.title.trim().length < 2) { err.textContent = 'Please enter a title (at least 2 characters).'; F.title.focus(); return; }
    if (!d.id) { err.textContent = 'Please enter a URL id.'; return; }
    if (!editing && find(d.id)) { err.textContent = 'That id already exists – choose another.'; return; }
    if (!P.safeUrl(d.src) || d.src.trim() === 'games/') { err.textContent = 'Game address must start with games/ or https:// and point to a game.'; return; }
    if (d.thumb && !P.safeUrl(d.thumb)) { err.textContent = 'Thumbnail must be an https:// or games/ address.'; return; }
    var clean = P.cleanGame(d); if (!clean) { err.textContent = 'Some fields are invalid.'; return; }
    if (editing) games[games.indexOf(editing)] = clean; else games.push(clean);
    persist(); closeModal(); P.toast(editing ? 'Game updated ✔' : 'Game added 🎉'); if (!editing) P.confetti();
  });

  /* ----- settings ----- */
  function settings() {
    $('adsToggle').checked = !!P.config.adsEnabled;
    $('customCats').innerHTML = (P.config.customCategories || []).map(function (c) { return '<span>' + E(c) + ' <button type="button" data-rmcat="' + E(c) + '" style="background:none;border:0;color:inherit;cursor:pointer" aria-label="Remove ' + E(c) + '">✕</button></span>'; }).join('') || '<span style="opacity:.6">No custom categories</span>';
  }
  $('adsToggle').addEventListener('change', function (e) { P.config.adsEnabled = e.target.checked; P.saveConfig(); P.toast('Ads ' + (e.target.checked ? 'enabled' : 'disabled')); });
  $('catForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('newCat').value.replace(/[<>]/g, '').trim();
    if (v.length < 2) { P.toast('Enter a category name'); return; }
    if (P.categories().map(function (c) { return c.toLowerCase(); }).indexOf(v.toLowerCase()) > -1) { P.toast('Category already exists'); return; }
    P.config.customCategories = (P.config.customCategories || []).concat([v]); P.saveConfig(); $('newCat').value = ''; renderAll(); P.toast('Category added');
  });
  $('customCats').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rmcat]'); if (!b) return; var c = b.getAttribute('data-rmcat');
    if (games.some(function (g) { return g.category === c; })) { P.toast('Move or delete games in that category first'); return; }
    P.config.customCategories = P.config.customCategories.filter(function (x) { return x !== c; }); P.saveConfig(); renderAll();
  });
  $('passForm').addEventListener('submit', function (e) {
    e.preventDefault(); var v = $('newPass').value;
    if (v.length < 6) { P.toast('Passcode must be at least 6 characters'); return; }
    P.config.passcode = v; P.saveConfig(); $('newPass').value = ''; P.toast('Passcode updated 🔑');
  });

  /* ----- messages ----- */
  function inbox() {
    var m = P.LS.get('pn_messages', []);
    $('inbox').innerHTML = m.length ? m.map(function (x) { return '<div class="msg"><strong>' + E(x.name) + '</strong> · <a href="mailto:' + E(x.email) + '">' + E(x.email) + '</a> · <em>' + E(x.topic) + '</em><br><small>' + new Date(x.date).toLocaleString() + '</small><p style="margin:8px 0 0;white-space:pre-wrap">' + E(x.text) + '</p></div>'; }).join('') : '<div class="empty">No messages yet. Messages sent from the Contact page appear here.</div>';
  }

  /* ----- backup ----- */
  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'playnova-games.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
    P.toast('Exported ' + games.length + ' games');
  });
  $('importFile').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var arr = JSON.parse(r.result); if (!Array.isArray(arr)) throw new Error('not a list');
        var seen = {}, ok = arr.map(P.cleanGame).filter(function (g) { if (!g || seen[g.id]) return false; seen[g.id] = 1; return true; });
        if (!ok.length) throw new Error('empty'); games = ok; persist(); P.toast('Imported ' + ok.length + ' games ✔');
      } catch (x) { P.toast('Import failed – invalid file'); }
    };
    r.readAsText(f); e.target.value = '';
  });
  $('resetGames').addEventListener('click', function () { if (confirm('Restore the original game list? Your changes will be lost.')) { P.LS.del('pn_games'); games = P.games(); renderAll(); P.toast('Defaults restored'); } });
  $('clearScores').addEventListener('click', function () { if (confirm('Delete ALL leaderboard scores?')) { P.LS.set('pn_scores', {}); renderAll(); P.toast('Leaderboard cleared'); } });
})();
