# School

A small, child-friendly web app for practising primary-school maths, made for a 7-year-old who already knows the basics and wants to test herself while having fun. It is designed for tablets and phones and builds to a fully static site that can be hosted anywhere (GitHub Pages out of the box).

**The app's interface is entirely in Greek.** This README uses English translations for the names of screens, stages and games.

It currently has two activities:

- **Multiplication Kingdom:** the times tables, guided by **Kapi**, a capybara in a party hat.
- **Land of Measures:** converting lengths between metres, decimetres, centimetres and millimetres, in a light blue theme, with its own mascot.

The guides cheer on right answers, give gentle hints after mistakes and never punish.

## Features

### Classes and activities

The app opens on a class picker, then an activity picker for that class, so more school subjects and activities can be added over time. For now there is one class, **Maths**, with the two activities below. Each activity keeps its own progress, sticker album and parent corner.

## Multiplication Kingdom

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

## Land of Measures

Length conversion between metres, decimetres, centimetres and millimetres. The app writes them with the abbreviations taught in Greek schools; this README uses m, dm, cm and mm. Every answer is a whole number, since decimals come later in school, and every length stays within 10 m.

### Towers

The levels are towers with the same Pick / Type / Challenge stages, stars and unlock rules as the castles (15 s per question in Challenges, 12 s in the Grand Challenge):

| Tower | Converts |
| --- | --- |
| Metres and centimetres | m ↔ cm |
| Centimetres and millimetres | cm ↔ mm |
| Decimetres | dm ↔ cm, m ↔ dm |
| Big jumps | m ↔ mm, dm ↔ mm |
| All units | every pair |
| Mixed units | e.g. *2 m 35 cm = ? cm*, *235 cm = ? m 35 cm* |
| Grand Challenge | everything, timed |

- Converting to a bigger unit only uses lengths that divide exactly (e.g. 400 cm = 4 m, never 450 cm).
- After a wrong answer, a hint (e.g. *"Think: ? × 100 = 300, because 100 cm make 1 m"*) comes with a **unit staircase** picture: m → dm → cm → mm, with ×10 on each step and the steps between the two units highlighted.
- Wrong answer choices are the classic slips: a zero too many or too few, or not converting at all.

### Extra games

- **Ruler:** read the length of a pencil lying on a 10 cm ruler, in centimetres or millimetres.
- **Longer:** two lengths in different units (e.g. 3 dm and 40 cm); tap the longer one, or "Equal".

### Parent corner and album

The parent corner shows a from-unit / to-unit grid with the share of first-try right answers, the mixed-unit conversions, the hardest conversions, an unlock-all switch and a reset (which only affects this activity). The 18 stickers have a sea and space theme.

## Other details

- Sound effects are synthesised with the Web Audio API, so there are no audio files; a sound on/off toggle remembers the choice.
- All progress is stored in the browser's `localStorage` on the device, separately per activity. There are no accounts, no server and no tracking.
- Touch-first layout with large buttons; a physical keyboard also works on the number pad.

## Tech stack

- [Vite](https://vite.dev/) + TypeScript, no UI framework
- [Comfortaa](https://fonts.google.com/specimen/Comfortaa) (self-hosted via `@fontsource-variable/comfortaa`, includes the Greek character set)
- Hash-based routing (`#/math`, `#/math/multiplication/castle/3`, `#/math/length/level/m-cm`, …) so the site works on static hosting without rewrites
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
  main.ts              top-level router (class → activity) and global click handling
  catalog.ts           the list of classes and their activities (with theme and mascot)
  strings.ts           all user-facing text (in Greek)
  styles.css           layout, the default theme and the light blue length theme
  core/                shared logic: round flow, stages and unlock rules, stickers,
                       per-activity progress storage (localStorage), sound effects
  pads/                answer pads: four bubbles, number pad
  ui/                  shared screens and widgets: class/activity pickers, level screen,
                       results, album, parent corner, mascot images, confetti
  activities/
    multiplication/    router, levels, questions, stickers, castle art, screens, Match and Feed Kapi
    length/            router, levels, units and questions, stickers, mascot, tower art,
                       screens, Ruler and Longer
public/
  favicon.svg
  mascots/             mascot images (see Customising)
```

## Customising

- **Adding a class or activity:** add an entry to `SUBJECTS` in `src/catalog.ts` (with its titles in `src/strings.ts`). An activity provides a `route(app, parts)` function that draws its screens for every URL below `#/<class>/<activity>/` and may return a cleanup function, and can set a `theme` (styled in `styles.css` under `:root[data-theme='…']`) and its own `mascot`. The two existing activities in `src/activities/` show how to reuse the shared round flow, level screen, album and parent corner.
- **Text:** almost every string shown in the app lives in `src/strings.ts`. To change the app's language, also translate the sticker names in each activity's `stickers.ts`, the number-pad button labels in `src/pads/typePad.ts`, and the page title and `lang` attribute in `index.html`.
- **Time limits:** `TIME_LIMIT` in each activity's `levels.ts`.
- **Levels:** `TABLE_ORDER` and `CASTLE_COLORS` in `src/activities/multiplication/levels.ts`; `LEVELS` in `src/activities/length/levels.ts`.
- **Number ranges for lengths:** `MAX_BIG` in `src/activities/length/units.ts`.
- **Star thresholds:** `starsFor` in `src/core/stages.ts`.
- **Stickers:** `STICKERS` in each activity's `stickers.ts`.
- **Mascots:** image files in `public/mascots/`: `menu.svg` (the giraffe on the class and activity pickers), `multiplication.svg` (Kapi) and `length.svg`. Optional `<name>-cheer.svg`, `<name>-think.svg` and `<name>-eat.svg` files are used for those moods and fall back to `<name>.svg`. The browser-tab icon is `public/favicon.svg`.
