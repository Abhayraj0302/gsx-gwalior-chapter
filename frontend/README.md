# GSX Gwalior Chapter: website

The frontend of the GSX Gwalior Chapter at MITS-DU, Gwalior: a student-led tech community of the GirlScript Foundation. It is a single page: hero, who we are, what we do, events, how to join.

## Running it

Needs Node 20 or newer. Run these from this folder, or use the same script names from the repository root.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build
npm run lint
```

## Editing content

All copy, links and dates live in `src/data/content.ts`. Most updates need only that file.

- **Events.** Add an entry to `events`. The hero's "next up" line, the ticket, the countdown and the join steps all read from it. They switch to the past-event wording by themselves once the date has passed (dates are compared in IST).
- **QR codes.** The ticket's QR code is generated from the event's `registerUrl`, or its `recapUrl` once the event is over. The membership card's QR code follows its main button. Change the link and the code updates with it.
- **Members' group.** Set `site.links.joinGroup` to a WhatsApp or Discord invite. The extra join step and button appear only when it is set.
- **Numbers.** The figures in `stats` are shown as written. Keep them honest, and add an event count once there is a track record.

## How it is put together

- React 19, TypeScript and Vite. Plain CSS files next to each component. Every colour, size and duration comes from `src/styles/tokens.css`.
- Animation uses [Motion](https://motion.dev). Smooth scrolling on desktop uses [Lenis](https://lenis.darkroom.engineering). Touch devices keep native scrolling.
- The 3D mark in the hero uses three.js through @react-three/fiber. It is a separate chunk, loaded after the page is idle and only when WebGL is available.
- With `prefers-reduced-motion` turned on, the loader is skipped and every animation renders in its final state.

```
src/
  data/content.ts        copy, links, events
  styles/                tokens and base styles
  components/
    layout/              navbar, mobile menu, skip link
    preloader/           opening sequence
    sections/            hero, about, whatwedo, events, join (and the footer)
    three/               hero 3D scene
    ui/                  buttons, chips, cards, labels, motion helpers
  hooks/, lib/, context/ small shared utilities
```

## Brand

Black `#000000`, white `#FFFFFF`, deep violet `#451D8D` and violet `#6F3EB7`, with Lime Cream `#E4ED73` and Hyper Magenta `#B64FFB` as small accents. Display type is Bricolage Grotesque. Labels are set in Chakra Petch.
