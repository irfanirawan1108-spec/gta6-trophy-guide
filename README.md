# Leonida Trophy Atlas — GTA VI trophy guide & tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/irfanirawan1108-spec/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/irfanirawan1108-spec/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI, built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Every trophy** with its official name, description and grade, plus a guide in our own words that names its sources (KeenGamer, GTA Zone, Output Lag, Exophase).
- **Roadmap to the platinum** in six stages — story, strangers, activities, collectibles, money, cleanup — with the facts that matter: ~200 hours, difficulty 4/10, one playthrough, no mission replay, 15 manual saves, cheats disable trophies.
- **The one missable trophy, flagged**: Positive Mental Attitude — Lucia's balcony meditation in Chapter 1 disappears after that chapter. Everything else stays available in free roam.
- **A tracker**: tick trophies off and progress saves in the browser (localStorage); export progress to a file and import it back; filter by kind (story, missable, collectibles, activities, online, meta), grade, or search; a spoiler-free setting hides story trophies until they are earned.
- **Fully offline**: static files under `app/`, no network requests at run time, no Rockstar logo or artwork — the look is our own.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output and writes `dossier.json` with the vendored make.fun library.
