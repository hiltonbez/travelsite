# Notes for coding agents

This site was exported from Lovable but is no longer connected to it. It is
self-hosted: Docker image (nginx serving prerendered HTML) deployed by Coolify
on every push to `main`. See README.md.

- Keep `main` deployable: run `npm run build:static` before pushing.
- New pages must be added to `PAGES` in `scripts/snapshot.mjs`, or they won't exist in production.
- `@lovable.dev/vite-tanstack-config` is still the Vite config wrapper; don't add the
  plugins it already includes (see the comment in vite.config.ts).
