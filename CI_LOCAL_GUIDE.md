# Local CI Testing Guide

## Quick Start

Run the full CI pipeline locally before pushing:

```bash
pnpm ci:local
```

This command executes the exact same checks as GitHub Actions in sequence:

1. **Lint** — ESLint validation across all packages/apps
2. **Type Check** — TypeScript compilation across monorepo
3. **Test** — Vitest with coverage reports
4. **Build** — Full production build of packages and apps

---

## What Each Step Does

### 1. Lint (2-3 min)

```bash
pnpm lint
```

- Runs ESLint across all workspaces
- Checks code style, import order, and best practices
- **Fails if:** ESLint rules violated, imports unsorted

**Fix linting errors:**

```bash
pnpm format  # Auto-fix formatting and imports
```

---

### 2. Type Check (1-2 min)

```bash
pnpm type-check
```

- TypeScript compilation without emit across monorepo
- Validates all `*.ts` and `*.tsx` files
- **Fails if:** TypeScript errors found

**Debug type errors:**

```bash
# Get detailed errors with file locations
pnpm type-check 2>&1 | less
```

---

### 3. Test with Coverage (3-5 min)

```bash
pnpm test:coverage --run
```

- Runs Vitest across all packages/apps
- Generates coverage report
- **Fails if:** Tests fail or coverage below threshold

**View coverage report:**

```bash
# Opens HTML coverage report in browser
open coverage/index.html
```

**Run tests interactively:**

```bash
pnpm test:watch          # Watch mode for development
pnpm test:ui             # Interactive UI for test debugging
```

---

### 4. Build (5-10 min)

```bash
pnpm build
```

- Builds shared packages (`@rara/types`, `@rara/utils`, etc.)
- Builds both Next.js apps with production optimizations
- **Fails if:** Build errors in any package/app

**Build specific app:**

```bash
pnpm build:owner         # Build owner dashboard only
pnpm build:customer      # Build customer app only
pnpm build:packages      # Build shared packages only
```

---

## Full CI Pipeline Output

When you run `pnpm ci:local`, you should see output like:

```
❯ pnpm ci:local
...
> pnpm -r run lint
...
✓ Lint completed successfully

> pnpm -r run type-check
...
✓ Type check completed successfully

> pnpm test:coverage --run
...
✓ All tests passed | Coverage: 75%

> pnpm build
...
✓ Build completed successfully

✅ CI Pipeline passed - Ready to push!
```

---

## Common Issues & Fixes

### Issue: "pnpm: not found"

**Solution:** Install pnpm globally

```bash
npm install -g pnpm@9.1.4
```

### Issue: Lint errors about formatting

**Solution:** Auto-fix with prettier

```bash
pnpm format
git add .
pnpm ci:local  # Re-run to verify
```

### Issue: Type errors in TypeScript

**Solution:** Check types in VS Code first

```bash
# Make sure tsconfig.json extends from base config
# Verify path aliases in tsconfig.json are correct
pnpm type-check
```

### Issue: Tests fail with module not found

**Solution:** Verify monorepo installation

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm ci:local
```

### Issue: Build fails with missing dependencies

**Solution:** Ensure all packages are built first

```bash
pnpm build:packages  # Build shared packages explicitly
pnpm build           # Then build everything
```

### Issue: "ENOSPC: no space left on device"

**Solution:** Clean build artifacts

```bash
pnpm -r exec rm -rf dist .next coverage
pnpm ci:local
```

---

## Before Every Commit

**Recommended workflow:**

```bash
# 1. Make your changes
# 2. Test locally
pnpm ci:local

# 3. If all pass, commit
git add .
git commit -m "feat(customer): add booking confirmation email"

# 4. If commit fails, fix issues and retry
```

---

## GitHub Actions vs Local CI

| Aspect              | Local (`ci:local`)        | GitHub Actions      |
| ------------------- | ------------------------- | ------------------- |
| **Speed**           | 15-25 min                 | 5-10 min (cached)   |
| **Parallelization** | Sequential                | Parallel jobs       |
| **Caching**         | Reuses local node_modules | Fresh pnpm cache    |
| **Cost**            | Free (your machine)       | Free (GitHub quota) |
| **Purpose**         | Pre-push validation       | Final verification  |

**Best practice:** Run `pnpm ci:local` locally, then GitHub Actions validates in parallel for final checks.

---

## CI/CD Workflow Files

All three workflow files have been validated ✅:

### `ci.yml` (269 lines)

- Triggers: Every push and PR
- Jobs: Install → Lint → Type-check → Test → Build → Status
- Caches pnpm store and node_modules
- Uploads coverage artifacts

### `deploy-staging.yml` (160 lines)

- Triggers: Push to `staging` branch
- Deploys to: https://customer-staging.vercel.app, https://owner-staging.vercel.app
- Includes PR comments with preview URLs

### `deploy-production.yml` (239 lines)

- Triggers: Push to `main` or tags starting with `v`
- Requires: Environment approval before deployment
- Deploys to: https://customer.rara-beauty.app, https://owner.rara-beauty.app
- Features: Auto-generated changelog, GitHub releases, Slack notifications

---

## Monitoring CI Runs

**Check GitHub Actions status:**

1. Go to: https://github.com/your-repo/actions
2. Select workflow (CI, Staging Deploy, or Production Deploy)
3. Click branch/PR to see detailed logs

**Local CI status:**

```bash
# Check if you're CI-ready
pnpm ci:local
# Exit code 0 = Ready to push
# Exit code 1 = Fix issues before pushing
```

---

## Next Steps

- [ ] Run `pnpm ci:local` to verify setup
- [ ] Fix any issues and commit
- [ ] Push to a branch and watch GitHub Actions
- [ ] Review GitHub Actions output
- [ ] Create a PR and verify all checks pass
