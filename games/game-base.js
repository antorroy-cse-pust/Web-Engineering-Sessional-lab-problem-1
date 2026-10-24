/* PlayNova shared game helpers */
(function () {
  'use strict';
  var id = (location.pathname.split('/').pop() || 'game').replace('.html', '');
  var GB = window.GB = { id: id, muted: false };
  try { GB.muted = localStorage.getItem('pn_muted') === '1'; } catch (e) {}
  GB.$ = function (i) { return document.getElementById(i); };
  GB.rand = function (a, b) { return a + Math.random() * (b - a); };
  GB.ri = function (a, b) { return Math.floor(GB.rand(a, b + 1)); };
  GB.best = function () { try { return +localStorage.getItem('pn_best_' + id) || 0; } catch (e) { return 0; } };
  GB.saveBest = function (s) { if (s > GB.best()) { try { localStorage.setItem('pn_best_' + id, s); } catch (e) {} return true; } return false; };
  GB.report = function (score) { try { parent.postMessage({ type: 'pn-score', game: id, score: Math.floor(score) }, '*'); } catch (e) {} };
  GB.fit = function (cv, hud) {
    function f() {
      var s = Math.max(.2, Math.min((innerWidth - 12) / cv.width, (innerHeight - (hud || 54)) / cv.height));
      cv.style.width = Math.floor(cv.width * s) + 'px'; cv.style.height = Math.floor(cv.height * s) + 'px';
    }
    f(); addEventListener('resize', f);
  };
  GB.beep = function (f, d, type, v) {
    if (GB.muted) return;
    try {
      var A = GB._a || (GB._a = new (window.AudioContext || window.webkitAudioContext)());
      if (A.state === 'suspended') A.resume();
      var o = A.createOscillator(), g = A.createGain(), t = A.currentTime; d = d || .1; v = v || .05;
      o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d);
    } catch (e) {}
  };
  /* swipe -> callback('L'|'R'|'U'|'D') */
  GB.swipe = function (cb, el) {
    var sx = 0, sy = 0, on = false; el = el || document;
    el.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; on = true; });
    el.addEventListener('pointerup', function (e) {
      if (!on) return; on = false; var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'));
    });
  };
  GB.particles = function () {
    var P = [];
    return {
      burst: function (x, y, col, n) { for (var i = 0; i < (n || 14); i++) { var a = Math.random() * 6.283, s = GB.rand(1, 4.5); P.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, c: col, r: GB.rand(1.5, 3.5) }); } },
      draw: function (ctx, k) {
        k = k || 1;
        for (var i = P.length - 1; i >= 0; i--) {
          var p = P[i]; p.x += p.vx * k; p.y += p.vy * k; p.vy += .05 * k; p.l -= .03 * k;
          if (p.l <= 0) { P.splice(i, 1); continue; }
          ctx.globalAlpha = p.l; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    };
  };
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('button'); b.id = 'mute'; b.type = 'button'; b.setAttribute('aria-label', 'Toggle sound');
    b.textContent = GB.muted ? '🔇' : '🔊';
    b.addEventListener('click', function () { GB.muted = !GB.muted; b.textContent = GB.muted ? '🔇' : '🔊'; try { localStorage.setItem('pn_muted', GB.muted ? '1' : '0'); } catch (e) {} b.blur(); });
    document.body.appendChild(b);
  });
})();
