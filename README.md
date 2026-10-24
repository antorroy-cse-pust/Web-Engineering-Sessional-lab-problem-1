# PlayNova – Free Online Gaming Portal

Static HTML5 / CSS / JavaScript website. **No build step, no server, no install** – open `index.html` in a browser (or upload the folder to any web host).

## Pages
| File | Purpose |
|---|---|
| `index.html` | Homepage: logo + nav, featured banner with **Play** button, category chips, Popular / New sections, thumbnail grid, ad slots, leaderboard, Premium section, footer |
| `game.html?id=…` | Game page with playable game area, ad space, scores, similar games |
| `admin.html` | Game management panel (add / edit / remove / reorder games, categories, ads, backup). Default passcode: `playnova` |
| `about.html`, `contact.html`, `privacy.html`, `terms.html` | Footer pages |
| `games/*.html` | 12 original HTML5 games: Ludo Classic, Penalty Kings (football), Turbo Rush 3D (racing), Neon Racer, Space Defender, Gem Quest, Neon Snake, Merge 2048, Memory Match, Flappy Orb, Simon Pulse, Slide Master |

## Requirement checklist
- Modern gaming look, bright colours, rounded cards, responsive on desktop / tablet / mobile ✔
- Logo + navigation, large featured banner with Play button, categories, Popular & New sections ✔
- Ad-ready spaces (top, in-content, sidebar x2, below game) with real AdSense support ✔
- Premium / ad-free membership section (waiting list) ✔
- Leaderboard (global + per game) ✔
- Footer: About, Contact, Privacy Policy, Terms ✔
- Game portal "plugin" = Admin panel (add / remove / organise games, no developer) ✔
- Embed legitimate third-party HTML5 games (admin → source type "Embed") ✔
- Basic SEO: titles, meta descriptions, canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt` ✔
- Performance: no framework, no images (CSS/emoji art), lazy-loaded thumbnails, tiny JS ✔
- Security: output escaping, URL allow-list, sandboxed game iframes ✔

## Add a game (no coding)
Admin → **＋ Add game** → fill the form (live preview) → Save. Hosted games: put the file in `games/` and use `games/name.html`. Third-party games: choose *Embed* and paste the https URL (only use games you have permission to embed).

## Switch on real ads (when eligible)
Open `assets/js/data.js`, set `PN_ADS.client = 'ca-pub-XXXXXXXX'` and the slot ids. Placeholders turn into real ads automatically.

## Notes
Scores, favourites and admin edits are stored in the browser (`localStorage`), so the demo needs no database. For production, replace with a backend API and real server-side admin login.
