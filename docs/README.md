# Documentation Index

<!-- docs/README.md -->

Master index of all project documentation.

## Already Documented

| Doc | What it covers | Priority |
|-----|---------------|----------|
| `AGENTS.md` | Condensed quick-reference for AI agents: stack, commands, code style, project structure, agent guidelines | Required reading for all agents |
| `DEVELOPMENT.md` | Technical reference: code style, project structure, utility functions, database, testing, common patterns, known issues | Technical reference |
| `CONTENT.md` | Full frontmatter reference, MDC syntax, decklist/card-reference syntax, image guidelines, publishing checklist | Content authoring |
| `architecture/author-system-improvements.md` | Author system feature status: completed features and pending improvements | Feature reference |
| `architecture/card-download-database-flow.md` | How card data flows from Scryfall into `server/database/cards.db` and gets resolved at build time by the content transformers | Data pipeline |
| `architecture/2026-07-10-magic-cards-component-research.md` | Reverse-engineering notes for WotC's `<magic-cards>` web component (fan/hand layouts): what's verified live vs. extrapolated, with matched-articles data (`2026-07-10-magic-cards-fan-hand-matches.tsv`) | Component reference |
| `audits/2026-07-11-build-performance-investigation.md` | Investigation into `bun run generate` slowness and a silent exit-code-5 failure; one fix reverted after breaking prod images, one kept | Performance history |
| `PROGRESS.md` | Backward-looking curated architecture/decision history (ADRs); what's actually been done | Architecture history |
| `CHANGELOG.md` | Raw commit-by-commit trail, newest first; the play-by-play behind `PROGRESS.md`'s distilled history | Architecture history |
| `BACKLOG.md` | Forward-looking, committed work items ranked by priority (P1–P3) with effort estimates (S/M/L) | Roadmap |
| `TODO.md` | Forward-looking scratch notes: loose observations, open questions, not yet committed | Roadmap (scratch) |
| `superpowers/specs/` | Dated feature design specs (e.g. editor header button) | Planning (historical) |

`architecture/` groups the docs that explain **how the app works** (data pipeline, component internals) as opposed to `audits/`, which holds one-off investigation/postmortem reports, and the root-level docs, which are entry points/process (this index, agent rules, roadmap, changelog).

`TODO.md`, `BACKLOG.md`, and `PROGRESS.md` have distinct roles — don't blur them:
- **`TODO.md`**: forward-looking, scratch, not yet committed. Loose observations, open questions. Fine for it to be messy. If an observation turns into a real, plannable task, promote it into `BACKLOG.md`.
- **`BACKLOG.md`**: forward-looking, committed. Actionable work items ranked by priority (P1/P2/P3) with a rough effort estimate (S/M/L) — this is where "do next" lives, not `TODO.md`.
- **`PROGRESS.md`**: backward-looking, curated. Once a backlog item is done, fold a summary into `PROGRESS.md` (its own ADR entry, or a line in an existing section) and remove the corresponding `BACKLOG.md` entry.

---

## Documentation by Topic

### For Agent Onboarding

1. Start with `AGENTS.md` — quick reference: stack, commands, conventions
2. Read `DEVELOPMENT.md` — full technical reference (utilities, patterns, testing)
3. Read `CONTENT.md` — content collections, frontmatter, MDC syntax
4. Check the root `CLAUDE.md` — architecture notes that span multiple files (content pipeline, prerendering, component prefixing)

### For Content Work

1. `CONTENT.md` — frontmatter reference, MDC syntax, publishing checklist
2. `architecture/card-download-database-flow.md` — how `[[Card Name]]`/decklist card data resolves at build time
3. `architecture/2026-07-10-magic-cards-component-research.md` — `::magic-cards` fan/hand layout internals

### For Performance/Build Work

1. `audits/2026-07-11-build-performance-investigation.md` — prerender timing, OG-image render timeouts, what was tried and reverted

---

## Quick Reference

### File Paths

All docs live in `docs/` at project root:

```
docs/
├── README.md                    ← you are here
├── AGENTS.md
├── DEVELOPMENT.md
├── CONTENT.md
├── CHANGELOG.md
├── BACKLOG.md
├── PROGRESS.md
├── TODO.md
├── architecture/
│   ├── author-system-improvements.md
│   ├── card-download-database-flow.md
│   ├── 2026-07-10-magic-cards-component-research.md
│   └── 2026-07-10-magic-cards-fan-hand-matches.tsv
├── audits/
│   └── 2026-07-11-build-performance-investigation.md
└── superpowers/
    └── specs/
        └── 2026-05-19-editor-button-design.md
```

### Conventions

- Dated docs (`YYYY-MM-DD-topic.md`) are point-in-time research/investigation notes — the date marks when they were written, not an expiry.
- `architecture/` = lasting reference for how something works; `audits/` = one-off investigation/postmortem reports; root level = entry points and process docs.
- Run `bun run lint` after any file modification.
