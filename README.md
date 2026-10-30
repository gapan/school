# Multiplication Kingdom

A small, child-friendly web app for practising the multiplication tables, made for a 7-year-old who already knows the basics and wants to test herself while having fun. It is designed for tablets and phones and builds to a fully static site that can be hosted anywhere (GitHub Pages out of the box).

**The app's interface is entirely in Greek.** This README uses English translations for the names of screens, stages and games.

The guide is **Kapi**, a capybara in a party hat, who cheers on right answers, gives gentle hints after mistakes and never punishes.

## Features

### Classes and activities

The app opens on a class picker, then an activity picker for that class, so more school subjects and activities can be added over time. For now there is one class, **Maths**, with one activity, **Multiplication Kingdom**, described below.

### The castle map

Each times table is a castle, opened in order of difficulty: ×2, ×5, ×10, ×3, ×4, ×6, ×7, ×8, ×9. Every castle has three stages of 10 questions:

| Stage | How it works | Timer |
| --- | --- | --- |
| **Pick** | Pick the right answer out of four bubbles | No |
| **Type** | Type the answer on a big number pad | No |
| **Challenge** | Typed answers mixing this table with the castles already passed | 10 s per question |

- Each stage awards 0–3 stars based on answers that were right on the first try (9–10 → 3, 7–8 → 2, 5–6 → 1).
- A stage opens when the previous one has at least one star; the next castle opens once **Type** is passed.
- After the **Challenge** of every castle has been passed, the **Grand Challenge** opens: all tables mixed, 8 seconds per question.

### Feedback

- Right answer: chime, green highlight, a cheering Kapi.
- First wrong answer: a soft sound and a hint built from the neighbouring fact (e.g. *"Remember: 2 × 8 = 16, and one more 2!"*), then another try.
- Second wrong answer (or time running out): the correct answer is shown and the round moves on.
- Facts that were missed before come up more often in the timed rounds.

### Rewards

- **Stickers:** 18 collectible stickers unlock at total-star milestones, the last one needing every star in the game. They are collected in the **Album**.
- Confetti, star animations and "unlocked!" banners at the end of a round.

### Extra games

Free-play games under **Games**, using any unlocked table (or all of them mixed). They don't award stars, but keep personal records.

- **Match:** memory match, pairing `a × b` cards with their answers.
- **Feed Kapi:** tap the fruit with the right answer and it flies into Kapi's mouth.

### Parent corner

Reached through the small **Parents** link at the bottom of the home screen, behind a simple grown-up gate (a two-digit multiplication). It shows:

- a 10 × 10 grid colour-coding how well each fact is known (based on first-try answers),
- the five hardest facts,
- a switch to unlock every castle (useful if the first ones are too easy),
- a button to reset all progress and start from scratch.

### Other details

- Sound effects are synthesised with the Web Audio API, so there are no audio files; a sound on/off toggle remembers the choice.
- All progress is stored in the browser's `localStorage` on the device. There are no accounts, no server and no tracking.
- Touch-first layout with large buttons; a physical keyboard also works on the number pad.

## Tech stack

- [Vite](https://vite.dev/) + TypeScript, no UI framework
- [Comfortaa](https://fonts.google.com/specimen/Comfortaa) (self-hosted via `@fontsource-variable/comfortaa`, includes the Greek character set)
- Hash-based routing (`#/math`, `#/math/multiplication/castle/3`, …) so the site works on static hosting without rewrites
- Relative asset paths (`base: './'`), so the build works under any sub-path

## Getting started

Requires Node.js (the deploy workflow uses Node 24).

```sh
npm install
npm run dev       # dev server, also reachable from other devices on the local network
npm run build     # type-check and build into dist/
npm run preview   # serve the production build
```

To try it on a tablet, run `npm run dev` and open the network address Vite prints.

## Deployment (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` builds the site and publishes `dist/` on every push to `main` or `master`.

1. Push the repository to GitHub.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

Because the build is plain static files, `dist/` can also be uploaded to any other static host (Netlify, Cloudflare Pages, a web server, …).

## Project structure

```
src/
  main.ts            top-level router (class → activity) and global click handling
  catalog.ts         the list of classes and their activities
  multiplication.ts  router for the multiplication screens
  routes.ts          URL prefix of the multiplication activity
  strings.ts         all user-facing text (in Greek)
  styles.css         theme and layout
  engine/
    levels.ts        table order, stages, unlock rules, time limits
    questions.ts     round generation, answer choices, star thresholds
    stickers.ts      sticker list and milestones
    storage.ts       progress, fact stats, settings, records (localStorage)
    sound.ts         synthesised sound effects
  screens/           class and activity pickers (hub), and the multiplication screens: home, castle, play (round flow), results, album, games hub, parent corner
  games/             answer pads (bubbles, number pad) and the extra games
  ui/                mascot, castle art, confetti, sound toggle
public/favicon.svg
```

## Customising

- **Adding a class or activity:** add an entry to `SUBJECTS` in `src/catalog.ts` (with its titles in `src/strings.ts`). An activity provides a `route(app, parts)` function that draws its screens for every URL below `#/<class>/<activity>/` and may return a cleanup function; see `src/multiplication.ts`.

- **Text:** almost every string shown in the app lives in `src/strings.ts`. To change the app's language, also translate the sticker names in `src/engine/stickers.ts`, the number-pad button labels in `src/games/typePad.ts`, and the page title and `lang` attribute in `index.html`.
- **Time limits:** `TIME_LIMIT` in `src/engine/levels.ts`.
- **Table order and castle colours:** `TABLE_ORDER` and `CASTLE_COLORS` in `src/engine/levels.ts`.
- **Star thresholds:** `starsFor` in `src/engine/questions.ts`.
- **Stickers:** `STICKERS` in `src/engine/stickers.ts`.
- **Mascot:** the SVG in `src/ui/mascot.ts` (and `public/favicon.svg` for the browser tab).
