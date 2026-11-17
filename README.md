# lantern-ferry

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/256051/lantern-ferry/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/256051/lantern-ferry/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Lantern Ferry · 灯火渡 — steer a small wooden boat down a night river, gather lotus lanterns, dodge the rocks, and reach the far shore before dawn. A complete arcade game: a goal, rules, a way to win, lose or score, a start and a restart. All art is drawn in code and all sound is synthesised with Web Audio; nothing is fetched from the network.

## How to play

- Move: ← → or A / D, or move the mouse left and right of the boat.
- Start / restart: Space, Enter, or click.
- Pause: P or Esc. Mute: M.
- Collect a lotus lantern: +10 points, and a combo bonus up to +5 for lanterns caught in a row without a hit.
- Catch a golden koi: +25 points.
- Hit a rock: lose 1 of 3 lives and break the combo. Dodging a rock past the bottom of the screen is +1 point.
- Win: reach the far shore in 90 seconds. Each life left at the end is +50 points.
- Lose: lose all 3 lives before the far shore. Your best score is kept in this browser.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or open `game/index.html` directly in a desktop browser. No build step and no network request.

---

<sub>Entered on [make.fun](https://make.fun/?ref=99f6h40a&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
