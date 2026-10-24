/* PlayNova – contact form (front-end only: stores messages locally; connect to a form service/backend in production) */
(function () {
  'use strict';
  var P = window.PN, f = document.getElementById('cform'), err = document.getElementById('cerr'), msg = document.getElementById('cmsg'), cnt = document.getElementById('ccount');
  msg.addEventListener('input', function () { cnt.textContent = msg.value.length + ' / 1500'; });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = document.getElementById('cname').value.trim(), m = document.getElementById('cmail').value.trim(), s = document.getElementById('csub').value, t = msg.value.trim();
    err.className = 'err';
    if (n.length < 2) { err.textContent = 'Please enter your name.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) { err.textContent = 'Please enter a valid email address.'; return; }
    if (t.length < 10) { err.textContent = 'Your message should be at least 10 characters.'; return; }
    var list = P.LS.get('pn_messages', []);
    list.unshift({ name: n, email: m, topic: s, text: t, date: Date.now() });
    P.LS.set('pn_messages', list.slice(0, 100));
    err.className = 'err ok'; err.textContent = 'Thank you, ' + n + '! Your message has been sent. 🎉';
    f.reset(); cnt.textContent = '0 / 1500'; P.confetti();
  });
})();
