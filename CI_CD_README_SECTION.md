# CI/CD Pipeline Documentation

## Overview

The Rara Beauty monorepo uses **GitHub Actions** for automated testing, building, and deployment. This ensures code quality and reliability at every stage.

### Status Badges

```markdown
[![CI Pipeline](https://github.com/your-org/rara-beauty/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/rara-beauty/actions/workflows/ci.yml)
[![Staging Deploy](https://github.com/your-org/rara-beauty/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/your-org/rara-beauty/actions/workflows/deploy-staging.yml)
[![Production Deploy](https://github.com/your-org/rara-beauty/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/your-org/rara-beauty/actions/workflows/deploy-production.yml)
```

---

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers:** Every push to any branch + pull requests

**Purpose:** Validate code quality before merge

**Jobs (Sequential):**

```
install → lint → type-check → test → build → ci-status
```

**What it checks:**

- ✅ **Lint** — ESLint validation, code style, import order
- ✅ **Type Check** — TypeScript compilation errors
- ✅ **Test** — Unit tests with coverage reporting
- ✅ **Build** — Production build of all packages/apps

**Time:** ~15-20 minutes (first run), ~5-10 minutes (with cache)

**Artifacts Uploaded:**

- Coverage reports (30 days retention)
- Build artifacts (7 days retention)

**PR Comments:**

- Test coverage percentage
- Build status

---

### 2. Staging Deploy (`deploy-staging.yml`)

**Triggers:** Push to `staging` branch (automatic) or manual via `workflow_dispatch`

**Purpose:** Deploy to staging environment for QA testing

**Deployment Targets:**

- **Customer App:** https://customer-staging.vercel.app
- **Owner Dashboard:** https://owner-staging.vercel.app

**Process:**

```
Build packages & apps → Deploy to Vercel staging → Add preview URLs to PR
```

**Manual Trigger:**

```bash
# Via GitHub UI: Actions → Deploy to Staging → Run workflow
# Select app: customer | owner | both
```

**Time:** ~10-15 minutes

**PR Comments:**

- Preview URLs for both apps
- Deployment status

---

### 3. Production Deploy (`deploy-production.yml`)

**Triggers:**

- Push to `main` branch (requires approval)
- Git tags starting with `v*` (e.g., `v1.0.0`)
- Manual via `workflow_dispatch`

**Purpose:** Deploy to production with approval gate

**Deployment Targets:**

- **Customer App:** https://customer.rara-beauty.app
- **Owner Dashboard:** https://owner.rara-beauty.app

**Process:**

```
Build packages & apps → [APPROVAL REQUIRED] → Deploy to Vercel production →
Generate GitHub Release → Send Slack notification
```

**Protection Rules:**

- Requires `production` environment approval
- Requires all status checks passing
- Branch must be up to date with main

**Artifacts:**

- GitHub Release with auto-generated changelog
- Deployment metadata

**Time:** ~15-20 minutes (+ approval wait time)

**Notifications:**

- Slack (if `SLACK_WEBHOOK_URL` configured)
- GitHub Release notes

---

## Local Testing

Before pushing code, test the full CI pipeline locally:

```bash
pnpm ci:local
```

This runs: **lint → type-check → test → build**

See [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md) for detailed local testing instructions.

---

## Required GitHub Secrets

Configure these secrets in repository settings for deployments:

### Vercel Deployment

```
VERCEL_TOKEN                    # Vercel authentication token
VERCEL_ORG_ID                   # Vercel organization ID
VERCEL_PROJECT_ID_CUSTOMER      # Vercel project ID for customer app
VERCEL_PROJECT_ID_OWNER         # Vercel project ID for owner dashboard
```

### Optional: Slack Notifications

```
SLACK_WEBHOOK_URL               # Slack webhook for deployment notifications
```

**Setup Instructions:**

1. Go to: https://github.com/your-org/rara-beauty/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret with its value

---

## Workflow Diagram

### CI Pipeline Flow

```
┌─────────────┐
│ Push or PR  │
└──────┬──────┘
       │
       ▼
    ┌────────────────┐
    │ Install Deps   │ ← Cache pnpm store & node_modules
    └────────┬───────┘
             │
       ┌─────┴─────┬─────────┬──────────┐
       ▼           ▼         ▼          ▼
    ┌─────┐   ┌──────┐  ┌──────┐  ┌────────┐
    │Lint │   │Type  │  │ Test │  │ Build  │
    │Check│   │Check │  │Cover │  │Packages│
    └──┬──┘   └──┬───┘  └──┬───┘  └────┬───┘
       │         │         │           │
       └─────────┴─────────┴───────────┘
               │
               ▼
        ┌─────────────────┐
        │  CI Status      │
        │ ✅ All Passed   │
        │ OR              │
        │ ❌ Failed       │
        └─────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ✅ Can Merge  ❌ Fix & Retry
```

### Deployment Flow

```
main branch push
       │
       ▼
┌──────────────┐
│ CI Pipeline  │
│ Must Pass    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Require Approval     │ ← Team lead reviews
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│  Production  │
│  Deploy      │
└──────┬───────┘
       │
    ┌──┴──┐
    ▼     ▼
 Customer Owner
   App    App
```

---

## Monitoring Workflow Runs

### View Results

1. Go to: **Actions** tab in GitHub
2. Select workflow (CI, Staging Deploy, or Production)
3. Click branch/PR to see details

### Understand Status

| Status             | Meaning                   | Action              |
| ------------------ | ------------------------- | ------------------- |
| ✅ **Success**     | All checks passed         | Ready to merge      |
| ⏳ **In Progress** | Currently running         | Wait for completion |
| ❌ **Failed**      | One or more checks failed | Click for details   |
| ⏭️ **Skipped**     | Conditions not met        | Check workflow file |

### Common Failures

**CI Failures:**

- Lint errors → Run `pnpm format` locally
- Type errors → Check TypeScript errors in VS Code
- Test failures → Run `pnpm test:watch` to debug
- Build errors → Check dependency installation

**Deployment Failures:**

- Missing secrets → Check GitHub secrets configuration
- Vercel token expired → Regenerate and update secret
- Out of date branch → Merge main into feature branch

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

---

## Performance Optimization

### Caching Strategy

- **pnpm store:** Cached across all runs
- **node_modules:** Cached per Node.js version
- **TypeScript:** Incremental compilation
- **Build artifacts:** 7 day retention

**Cache invalidation:** Automatic when `pnpm-lock.yaml` changes

### Reducing CI Time

1. **Push to drafts first**

   ```bash
   git push origin feature-branch
   # Fix any CI issues before creating PR
   ```

2. **Local pre-flight checks**

   ```bash
   pnpm ci:local  # Before any push
   ```

3. **Only test changed packages**
   ```bash
   # CI automatically detects changed packages
   # Only affected apps/packages run tests
   ```

---

## Best Practices

### Before Committing

```bash
# 1. Test locally
pnpm ci:local

# 2. Fix any issues
pnpm format        # Auto-fix formatting
pnpm lint --fix    # Fix linting issues
pnpm test          # Run tests

# 3. Commit with proper message
git commit -m "feat(customer): add booking confirmation"
```

### Before Merging to main

- [ ] All CI checks ✅
- [ ] Code review approved
- [ ] Tests pass with >80% coverage
- [ ] No unresolved conversations
- [ ] Branch is up to date with main

### Production Deployment

- [ ] All checks passing in CI
- [ ] Staging deployment successful
- [ ] QA sign-off completed
- [ ] Release version bumped
- [ ] Approval given by team lead
- [ ] Changelog reviewed

---

## Troubleshooting

For detailed troubleshooting guides, see:

- [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md) — Local testing issues
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — GitHub Actions issues

Quick links:

- [GitHub Actions Logs](https://github.com/your-org/rara-beauty/actions)
- [Vercel Deployments](https://vercel.com)
- [Repository Settings](https://github.com/your-org/rara-beauty/settings)

---

## Future Enhancements

- [ ] Weekly dependency updates workflow
- [ ] Performance benchmarking in CI
- [ ] E2E testing on staging
- [ ] Security scanning (SAST/DAST)
- [ ] Database migration testing
- [ ] Load testing before production
