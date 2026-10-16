# Sai Abhilash Mandava — Spider-Man Multiverse Portfolio

**Live site:** https://saiabhilash16.github.io/spider-portfolio/

A cinematic, scroll-driven portfolio. Spider-Man swings into New York, falls backward through glowing portals into a purple multiverse, and lands beside each software project and UX case study.

Unofficial fan project. Spider-Man and related characters © Marvel. Not affiliated with or endorsed by Marvel or Sony.

## Two ways to watch
- **▶ PLAY THE MOVIE**: plays the whole story automatically, pausing at each project and case study. Controls: play/pause, replay, progress bar, exit.
- **EXPLORE BY SCROLLING**: scrolling drives the same timeline, forward and backward.

## Run it locally
```
npm install
npm run dev
```
`npm run build` writes the site to `dist/`.

## Publish on GitHub Pages
1. Push this folder to a GitHub repository (branch `main`).
2. In the repository: **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes the site. The address appears under Settings → Pages, e.g. `https://<username>.github.io/<repo>/`.

## Where things live
| Path | What it is |
|---|---|
| `src/data/content.ts` | All portfolio text (projects, case studies, skills, contact) |
| `src/story/Story.tsx` | The story page: NYC opening → multiverse → contact |
| `src/story/Multiverse.tsx` | The 3D multiverse, portals, Spider-Man's path, swings and landings |
| `src/story/NYCSwing.tsx` | Spider-Man's swing over the New York opening |
| `src/story/MovieMode.tsx` | Movie Mode / Explore Mode controls (one shared timeline) |
| `public/assets/tribute/character/spiderman-animated.glb` | The rigged model with the animations (Swing, Land, FallBackward) |
| `public/resume.pdf` | Resume (web copy, no phone number) |

## Animation credits
Swing and landing: scripted key poses, physics and leg IK in Blender (this project). Fall: Mixamo "Falling Idle" motion capture retargeted onto the model.
