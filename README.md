# taste-sync

Auto-synced mirror of [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT) as a Claude plugin marketplace.

`.github/workflows/sync-upstream.yml` runs daily: validates upstream, then regenerates
`.claude-plugin/`, `skills/`, `LICENSE` and `UPSTREAM_SHA` via `.github/scripts/mirror.mjs`.
Don't edit those by hand; the next sync overwrites them.

## Install

Claude Code:
```
/plugin marketplace add ryndearu/taste-sync
/plugin install taste-skill@taste-sync
```
Claude app: Customize → Plugins → Add marketplace → `ryndearu/taste-sync`.
