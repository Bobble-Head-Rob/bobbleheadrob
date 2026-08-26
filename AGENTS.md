# Agent Guidance

## Environment and repositories

- The Mac mini is the primary development environment.
- Work in `/Users/rob/CodexWorkspace/bobbleheadrob` for this repository.
- GitHub is the authoritative remote backup and source-collaboration system.
- BobbleheadRob and Disdained EGG are separate repositories and separate public properties. Keep cross-site ownership, status, names, and URLs consistent.
- Never modify the Disdained EGG repository during BobbleheadRob work unless a separately authorized task explicitly says to do so.

## Roles and workflow

Distinct agent roles may include Strategy / Oversight, Utility / Research, Build / Implementer, and Implementation Reviewer.

Prefer this loop:

`discuss → decide → implement small piece → inspect → review → adjust`

Update the governing documents when a decision will matter to future work. Avoid documentation churn for trivial implementation details.

## Product boundary

BobbleheadRob is Rob’s personal workshop for useful tools, small games, experiments, and odd ideas. Disdained EGG owns selected products it intends to finish, release, support, and stand behind.

Use the lifecycle in `VISION.md`: Experiment, Live personal project, Graduated, and Archived. Not every experiment should graduate. When one does, its authoritative product home moves to Disdained EGG; BobbleheadRob may keep a concise entry and crawlable link but must not duplicate the company page. Camp Dice is the first current example.

Hosting and deployment facts remain unsettled. Do not claim Cloudflare Pages, Cloudflare Workers, or automatic GitHub deployment without current evidence; see `ARCHITECTURE.md` and `PROJECT_STATUS.md`.

Production analytics is settled: BobbleheadRob uses Cloudflare Web Analytics with Automatic Setup for aggregate website traffic measurement. The repository intentionally contains no custom application analytics library. Future agents must not remove or replace Cloudflare Web Analytics merely because analytics code is absent from the repository; any analytics configuration change requires separate explicit authorization.
