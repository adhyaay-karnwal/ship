# Contributing to Ship

Thanks for your interest in contributing to Ship! Here's how to get started.

## Development Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/dylansteck/ship.git
   cd ship
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local` in `apps/web/`
   - Copy `.dev.vars.example` to `.dev.vars` in `apps/api/`
   - Fill in the required values

   For production, set `ALLOWED_ORIGINS` on your Cloudflare Worker (comma-separated origins):
   ```bash
   npx wrangler secret put ALLOWED_ORIGINS --env production
   # Enter: http://localhost:3000,https://your-domain.com
   ```

4. **Run the dev server**
   ```bash
   pnpm dev
   ```

## Project Structure

- `apps/web` — Next.js frontend
- `apps/api` — Cloudflare Worker API
- `packages/ui` — Shared UI components (`@ship/ui`)
- `packages/types` — Shared TypeScript types (`@ship/types`)
- `packages/config` — Shared configuration (`@ship/config`)

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes and ensure `pnpm build` passes
3. Write clear commit messages
4. Open a PR with a description of what changed and why

## Code Style

- TypeScript strict mode
- Prettier for formatting (config in root `package.json`)
- No semicolons, single quotes, 120 char line width
