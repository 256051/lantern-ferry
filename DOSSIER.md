# Dossier — Lantern Ferry · 灯火渡 (best-game-01)

## Entry (submitted 2026-11-17, accepted; improved version prepared 2026-11-17 for resubmission)

- Competition: best-game-01, "Make the best game", $1,000 pot (1st $400, top 10 share)
- Deadline: 2026-11-19 02:00 CST (2026-11-18 18:00 UTC)
- Entrant: @256051 (GitHub 256051), https://make.fun/profile
- Repo: https://github.com/256051/lantern-ferry (public; first submission 01a1e8a5-5e83-73bc-8a3e-462f7382d13a at commit 92162f8b; this improved version to be pushed as a new commit and resubmitted before 2026-11-19 02:00 CST)

## What changed in the improved version (2026-11-17)

- End screenshot is a genuine loss now: the end-scene pilot is the collecting autopilot
  with a 0.15 s look-ahead, playing until it really loses all 3 lives (seed 1: lost at
  89.6 s, score 971, level 8). The old 80-second cap and the forced lives-to-0 fallback
  are gone; `stageShot` throws instead of staging an outcome it never reached.
- Win screenshot is a genuine win by a collecting pilot now (seed 1: full 90 s, score
  1081, 3 lives left, best combo x51). The old dodge-only pilot and the staged-win
  fallback (forced elapsed/score/lives) are gone. No difficulty change was needed:
  the collecting pilot wins on seeds 1, 2, 3, 7 and 42 at the current balance.
- LICENSE copyright holder is now 256051 (was Jeff yu).
- `game/index.html` gained `<link rel="icon" href="data:,">` so the browser stops
  logging a favicon 404; no network request, no external address.
- Entry fee: $0

## The game

Lantern Ferry is an original arcade game. A ferryman rows a small wooden boat down a
night river under a full moon, carrying paper lanterns to the far shore. The river is
dark teal, the sky is indigo fading to amber at the horizon, and the boat's own paper
lantern glows warm orange. Everything on screen is drawn in canvas code; every sound
is a synthesised Web Audio note. No external files, no network requests, no copied
art, music or game.

- Goal: reach the far shore in 90 seconds.
- Win: survive the 90-second trip. Each life left is +50 points.
- Lose: lose all 3 lives to the rocks.
- Score: lotus lantern +10 (combo bonus up to +5), golden koi +25, dodged rock +1.
- Controls: ← → / A D or mouse to steer, Space / Enter / click to start and restart,
  P / Esc to pause, M to mute.
- Screens: title, play, paused, game over, win. Best score is kept in localStorage.

## Files

- `main.ts` — Node 22 program: copies `game/` and `screenshots/` to the output and
  writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — copied from the kit, unchanged.
- `game/index.html`, `game/src/*.js` — the game (config, world, render, input, sound,
  shots, random, main). No libraries.
- `screenshots/` — 4 real renders: 1-start, 2-play, 3-end, 4-win (seed 1).
- `LICENSE` — MIT. `README.md` — how to play, with the make.fun badges.
- `serve.ts` — local static server (`node serve.ts`, then http://localhost:8080).

## Entry message (template, to be signed at submission)

```
make.fun entry v1
Domain: make.fun
Competition: best-game-01
Repo: {repo_url}
Commit: {commit_sha}
Transcripts: {transcripts_sha256}
Wallet: {wallet}
Nonce: {nonce}
Issued At: {issued_at}
```

## What still needs approval before submission

1. Solana wallet: linked to the @256051 make.fun account (primary wallet, address
   starting 7qkv and ending Zm9g, verified 2026-11-17) — the wallet blocker is cleared
   for @256051. (@cnkker has no wallet linked and is NOT the entry account.)
2. Agent keypair / connect: done — the agent keypair was connected to @256051 on
   2026-11-17 15:39 CST (connect code GVCB-LBMD approved by YY); API key is good
   until 2026-12-17.
3. Public GitHub repo: https://github.com/256051/lantern-ferry already exists (public,
   created 2026-11-17, after the competition opened). For this improved version: push
   the new commit, set the GitHub About description so it names make.fun (see below),
   homepage https://make.fun/bounty/best-game-01 and topics makefun, ai-agents,
   bounties, games (already set).

   New About description for the resubmission: "Lantern Ferry — steer a boat down a
   night river, gather lanterns and dodge rocks to reach the far shore. Built by an AI
   agent for make.fun's 'Make the best game' bounty."
4. Transcripts: submit with the kit's `bundle`/`record` flow from a recorded session.
   This build session is a Muse subagent session; whether the kit's `bundle` finds a
   recorded Muse session log for it must be checked at submission time with
   `bundle --dry-run`. A handed-over session is ranked but takes no paid place
   (`handed_over_places: none`), so a recorded session matters for a paid place.
