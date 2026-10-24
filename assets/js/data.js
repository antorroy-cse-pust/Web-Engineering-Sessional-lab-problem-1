/* PlayNova – default catalogue (edit here OR use admin.html – no coding needed) */
window.PN_CATEGORIES = ['Puzzle', 'Action', 'Racing', 'Arcade', 'Adventure', 'Brain Training', 'Sports', 'Board'];

/* Advertising: paste your Google AdSense client id + slot ids here once the site is approved.
   While empty, neat "Advertisement" placeholders are shown in every ad position. */
window.PN_VER = 2;
window.PN_ADS = {
  client: '',               // e.g. 'ca-pub-0000000000000000'
  slots: { top: '', incontent: '', sidebar: '', sidebar2: '', game: '' }
};

window.PN_DEFAULT_GAMES = [
  { id: 'ludo-classic', title: 'Ludo Classic', category: 'Board', type: 'local', src: 'games/ludo.html', icon: '🎲', c1: '#ff4d4d', c2: '#7c5cff',
    desc: 'The world-famous Ludo board game! Roll the dice, race your four pieces home and capture rivals. You play Red against 3 computer players.', controls: 'Click Roll (or Space) then click a glowing piece to move it',
    tags: ['ludo', 'board', 'dice', 'multiplayer', 'classic'], featured: true, popular: true, isNew: true, plays: 33800, rating: 4.9, added: '2026-10-24' },
  { id: 'penalty-kings', title: 'Penalty Kings', category: 'Sports', type: 'local', src: 'games/penalty.html', icon: '⚽', c1: '#1f9d55', c2: '#14427a',
    desc: 'Football penalty shootout! Time your shot past the keeper, then dive to save the CPU’s kicks. Best of five, sudden death if tied.', controls: 'Shooting: tap twice (side, then height) · Defending: tap where to dive',
    tags: ['football', 'soccer', 'penalty', 'sports'], featured: true, popular: true, isNew: true, plays: 29500, rating: 4.8, added: '2026-10-24' },
  { id: 'turbo-rush', title: 'Turbo Rush 3D', category: 'Racing', type: 'local', src: 'games/turbo.html', icon: '🏁', c1: '#ff4d8d', c2: '#5a1a8a',
    desc: 'Full 3D-style highway racing! Weave through traffic, take sharp curves, overtake to fill your nitro and survive three crashes.', controls: 'Arrows / A D steer · Down brake · Space nitro · Touch: hold left / right, middle = nitro',
    tags: ['racing', '3d', 'cars', 'nitro', 'highway'], featured: true, popular: true, isNew: true, plays: 31200, rating: 4.8, added: '2026-10-24' },
  { id: 'neon-racer', title: 'Neon Racer', category: 'Racing', type: 'local', src: 'games/racer.html', icon: '🏎️', c1: '#ff4d8d', c2: '#7c5cff',
    desc: 'Dodge traffic at neon speed, grab coins and survive as the road gets faster every second.', controls: 'Left / Right arrows or A / D · Tap left or right side on mobile',
    tags: ['racing', 'cars', 'endless', 'speed'], featured: true, popular: true, isNew: false, plays: 24310, rating: 4.8, added: '2026-02-02' },
  { id: 'space-defender', title: 'Space Defender', category: 'Action', type: 'local', src: 'games/space.html', icon: '🚀', c1: '#22d3ee', c2: '#3b1fa8',
    desc: 'Protect the galaxy! Blast alien waves, collect power-ups and beat every wave without losing your lives.', controls: 'Mouse / finger drag or arrow keys to move · Ship fires automatically',
    tags: ['shooter', 'space', 'aliens', 'action'], featured: true, popular: true, isNew: false, plays: 21780, rating: 4.7, added: '2026-01-18' },
  { id: 'gem-quest', title: 'Gem Quest', category: 'Adventure', type: 'local', src: 'games/gem.html', icon: '💎', c1: '#2ee59d', c2: '#0b6e8a',
    desc: 'Explore a shadowy, ever-changing dungeon. Collect every gem, avoid the ghosts and escape through the portal.', controls: 'Arrow keys / WASD or swipe to move',
    tags: ['maze', 'dungeon', 'gems', 'adventure'], featured: true, popular: false, isNew: true, plays: 9120, rating: 4.6, added: '2026-09-20' },
  { id: 'neon-snake', title: 'Neon Snake', category: 'Arcade', type: 'local', src: 'games/snake.html', icon: '🐍', c1: '#00f5a0', c2: '#0072ff',
    desc: 'The classic snake, rebuilt with glowing visuals and particle effects. Eat, grow and do not crash.', controls: 'Arrow keys / WASD or swipe',
    tags: ['snake', 'classic', 'retro', 'arcade'], featured: false, popular: true, isNew: false, plays: 30210, rating: 4.7, added: '2026-01-05' },
  { id: 'merge-2048', title: 'Merge 2048', category: 'Puzzle', type: 'local', src: 'games/2048.html', icon: '🔢', c1: '#ffb347', c2: '#ff5e62',
    desc: 'Slide and merge matching tiles to build the legendary 2048 tile. Easy to learn, hard to master.', controls: 'Arrow keys / WASD or swipe',
    tags: ['2048', 'numbers', 'logic', 'puzzle'], featured: false, popular: true, isNew: false, plays: 27650, rating: 4.9, added: '2026-01-12' },
  { id: 'memory-match', title: 'Memory Match', category: 'Brain Training', type: 'local', src: 'games/memory.html', icon: '🃏', c1: '#a18cd1', c2: '#fbc2eb',
    desc: 'Flip the cards and find all the pairs in as few moves as possible. A perfect daily memory workout.', controls: 'Click or tap the cards',
    tags: ['memory', 'cards', 'brain', 'focus'], featured: false, popular: true, isNew: false, plays: 15400, rating: 4.5, added: '2026-03-01' },
  { id: 'flappy-orb', title: 'Flappy Orb', category: 'Arcade', type: 'local', src: 'games/flappy.html', icon: '🔮', c1: '#f093fb', c2: '#f5576c',
    desc: 'Tap to flutter a glowing orb through a field of crystal pillars. One touch, endless fun.', controls: 'Space / Click / Tap to flap',
    tags: ['flappy', 'one-tap', 'casual', 'arcade'], featured: false, popular: false, isNew: true, plays: 8800, rating: 4.4, added: '2026-10-01' },
  { id: 'simon-pulse', title: 'Simon Pulse', category: 'Brain Training', type: 'local', src: 'games/simon.html', icon: '🎵', c1: '#43e97b', c2: '#38f9d7',
    desc: 'Watch the lights, listen to the tones and repeat the growing sequence. How long can you last?', controls: 'Click / tap pads or keys Q W A S',
    tags: ['simon', 'sound', 'memory', 'rhythm'], featured: false, popular: false, isNew: true, plays: 6400, rating: 4.6, added: '2026-10-10' },
  { id: 'slide-master', title: 'Slide Master', category: 'Puzzle', type: 'local', src: 'games/slide.html', icon: '🧩', c1: '#fa709a', c2: '#fee140',
    desc: 'Slide the numbered tiles back into order. Choose 3×3, 4×4 or 5×5 and race the clock.', controls: 'Click / tap a tile or use arrow keys',
    tags: ['sliding', '15-puzzle', 'logic', 'puzzle'], featured: false, popular: false, isNew: true, plays: 5300, rating: 4.5, added: '2026-10-15' }
];

/* Demo leaderboard so the site looks alive on first visit (replace/clear from the admin panel). */
window.PN_SEED_SCORES = {
  'neon-racer': [{ name: 'Rafi', score: 2840, date: 1792300000000 }, { name: 'Nusrat', score: 2310, date: 1792200000000 }, { name: 'Tanvir', score: 1760, date: 1792100000000 }, { name: 'Mim', score: 1120, date: 1792000000000 }],
  'space-defender': [{ name: 'Sakib', score: 3910, date: 1792300000000 }, { name: 'Anika', score: 2980, date: 1792250000000 }, { name: 'Rafi', score: 1840, date: 1792150000000 }],
  'gem-quest': [{ name: 'Nusrat', score: 640, date: 1792350000000 }, { name: 'Mim', score: 410, date: 1792250000000 }, { name: 'Tanvir', score: 220, date: 1792100000000 }],
  'neon-snake': [{ name: 'Tanvir', score: 380, date: 1792300000000 }, { name: 'Sakib', score: 290, date: 1792200000000 }, { name: 'Anika', score: 210, date: 1792100000000 }],
  'merge-2048': [{ name: 'Anika', score: 18240, date: 1792300000000 }, { name: 'Rafi', score: 11620, date: 1792200000000 }, { name: 'Mim', score: 6480, date: 1792100000000 }],
  'memory-match': [{ name: 'Mim', score: 1180, date: 1792300000000 }, { name: 'Nusrat', score: 960, date: 1792200000000 }, { name: 'Sakib', score: 740, date: 1792100000000 }],
  'flappy-orb': [{ name: 'Rafi', score: 34, date: 1792300000000 }, { name: 'Tanvir', score: 21, date: 1792200000000 }, { name: 'Anika', score: 12, date: 1792100000000 }],
  'simon-pulse': [{ name: 'Anika', score: 140, date: 1792300000000 }, { name: 'Mim', score: 90, date: 1792200000000 }, { name: 'Sakib', score: 60, date: 1792100000000 }],
  'ludo-classic': [{ name: 'Anika', score: 1650, date: 1792300000000 }, { name: 'Rafi', score: 1240, date: 1792200000000 }, { name: 'Mim', score: 700, date: 1792100000000 }],
  'penalty-kings': [{ name: 'Sakib', score: 1500, date: 1792300000000 }, { name: 'Nusrat', score: 1100, date: 1792200000000 }, { name: 'Tanvir', score: 600, date: 1792100000000 }],
  'turbo-rush': [{ name: 'Tanvir', score: 980, date: 1792300000000 }, { name: 'Anika', score: 740, date: 1792200000000 }, { name: 'Rafi', score: 410, date: 1792100000000 }],
  'slide-master': [{ name: 'Nusrat', score: 1290, date: 1792300000000 }, { name: 'Tanvir', score: 1010, date: 1792200000000 }, { name: 'Rafi', score: 820, date: 1792100000000 }]
};
