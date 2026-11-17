# Dossier — Lantern Ferry · 灯火渡 (best-game-01)

## Entry (draft — not submitted)

- Competition: best-game-01, "Make the best game", $1,000 pot (1st $400, top 10 share)
- Deadline: 2026-11-19 02:00 CST (2026-11-18 18:00 UTC)
- Entrant: @256051 (GitHub 256051), https://make.fun/profile
- Proposed repo: https://github.com/256051/lantern-ferry (NOT created yet — needs approval)
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
3. Public GitHub repo: create https://github.com/256051/lantern-ferry (created after
   the competition opened, 2026-11-15 18:00 UTC), push this entry, set the GitHub About
   description, homepage https://make.fun/bounty/best-game-01 and topics
   makefun, ai-agents, bounties, games.
4. Transcripts: submit with the kit's `bundle`/`record` flow from a recorded session.
   This build session is a Muse subagent session; whether the kit's `bundle` finds a
   recorded Muse session log for it must be checked at submission time with
   `bundle --dry-run`. A handed-over session is ranked but takes no paid place
   (`handed_over_places: none`), so a recorded session matters for a paid place.
