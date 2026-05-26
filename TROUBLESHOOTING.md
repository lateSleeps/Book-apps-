# CI/CD Troubleshooting Guide

## Quick Diagnosis

When a GitHub Actions workflow fails:

1. **Check the red ❌** — Click the failed job
2. **Read the error message** — Scroll to the failure point
3. **Find your issue below** — Match the error pattern
4. **Apply the fix** — Run the solution command locally first

---

## Common CI Failures

### 🔴 Lint Errors

**Error Pattern:**

```
error: "X" is never used
warning: import should come before statement
```

**Cause:** ESLint rules violated or imports not sorted

**Solution:**

```bash
# Auto-fix formatting and import order
pnpm format

# Re-run linter to verify
pnpm lint

# Commit the fixes
git add .
git commit -m "chore: fix linting issues"
git push
```

**Details:** Prettier auto-formats code, ESLint auto-fixes common issues. See [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards.

---

### 🔴 TypeScript Errors

**Error Pattern:**

```
src/features/user/types.ts:15
Type 'X' is not assignable to type 'Y'
```

**Cause:** TypeScript type mismatch in your code

**Solution:**

```bash
# Check all type errors
pnpm type-check

# Get detailed errors
pnpm type-check 2>&1 | head -50

# Fix in VS Code (hover over error for suggestion)
# Then re-run:
pnpm type-check
```

**Common Fixes:**

- Add explicit type annotation: `const x: Type = value`
- Check path alias configuration in `tsconfig.json`
- Ensure shared package exports are correct
- Verify generic type parameters: `Array<T>`

**Path Alias Issues:**

```bash
# If "@rara/types" import fails:
# 1. Check tsconfig.json has the path
# 2. Verify package exports in tsconfig.json
# 3. Run: pnpm install
```

---

### 🔴 Test Failures

**Error Pattern:**

```
● Test suite failed to run
TypeError: Cannot read property 'X' of undefined
```

**Cause:** Test setup issue, missing mock, or broken logic

**Solution:**

```bash
# Run tests locally with more verbose output
pnpm test --reporter=verbose

# Run specific test file
pnpm test src/features/auth/__tests__/auth.test.ts

# Debug in watch mode
pnpm test:watch
# Use VS Code Test Explorer to debug

# Check coverage
pnpm test:coverage
open coverage/index.html
```

**Common Fixes:**

- Mock missing dependencies: `vi.mock('@rara/utils')`
- Add setup files for test environment
- Ensure test data matches expected types
- Check for async/await issues: `async/await` vs callbacks

**Example Fix:**

```typescript
// ❌ Before
test('should fetch user', () => {
  fetchUser(); // Async but not awaited
});

// ✅ After
test('should fetch user', async () => {
  await fetchUser();
  expect(...).toBe(...);
});
```

---

### 🔴 Build Errors

**Error Pattern:**

```
error: Failed to compile
src/index.ts: Module not found: Can't resolve '@rara/types'
```

**Cause:** Missing dependency, unbuilt package, or path alias issue

**Solution:**

```bash
# Rebuild shared packages first
pnpm build:packages

# Then build everything
pnpm build

# If still failing, clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Dependency Issues:**

```bash
# Check if package is in workspaces
cat pnpm-workspace.yaml

# Verify package.json has correct exports
cat packages/types/package.json | grep -A5 '"exports"'

# Check build order
pnpm build:packages  # Should succeed before apps build
```

**Next.js Specific:**

```bash
# Clear Next.js cache
rm -rf apps/customer/.next apps/owner/.next

# Rebuild
pnpm build
```

---

## Deployment Failures

### 🔴 Vercel Deployment Fails

**Error Pattern:**

```
Error: Could not authenticate with Vercel
fatal: unable to access 'https://vercel.com/...'
```

**Cause:** Missing or invalid Vercel secret tokens

**Solution:**

1. Go to: https://github.com/your-org/rara-beauty/settings/secrets/actions
2. Check these secrets exist and are valid:

   - `VERCEL_TOKEN` — Vercel Personal Access Token
   - `VERCEL_ORG_ID` — Organization ID
   - `VERCEL_PROJECT_ID_CUSTOMER` — Project ID for customer app
   - `VERCEL_PROJECT_ID_OWNER` — Project ID for owner dashboard

3. **Get correct values:**

   ```bash
   # From Vercel account:
   # 1. Personal Access Token: Settings → Tokens
   # 2. Org ID: Settings → General → ID
   # 3. Project IDs: Each project → Settings → General → Project ID
   ```

4. **Update secrets:**
   ```
   Settings → Secrets → New repository secret → Add/update value
   ```

**Verify tokens:**

```bash
# Test Vercel CLI locally
npx vercel --token YOUR_TOKEN
```

---

### 🔴 Staging/Prod Deployment Still Fails

**Error Pattern:**

```
fatal: 'origin' does not appear to be a 'git' repository
```

**Cause:** Git checkout or fetch issue

**Solution:**

```bash
# These are usually transient. Retry the workflow:
# 1. Go to: Actions → [workflow] → Re-run failed jobs
# 2. Click "Re-run all jobs" button
```

**If persists:**

```bash
# Check branch is up to date
git fetch origin
git rebase origin/main

# Force push (only if you own the branch!)
git push -f origin feature-branch
```

---

### 🔴 Production Deployment Blocked

**Error Pattern:**

```
This branch does not have the correct permissions
Deployment requires approval in 'production' environment
```

**Cause:** Missing environment approval or branch protection rules

**Solution:**

1. **Get approval:**

   - Find the workflow run: Actions → [workflow name] → Your PR
   - Look for "Review deployment" button
   - Team lead approves

2. **Check branch rules:**

   - Settings → Branches → main → Edit
   - Ensure "Require branches to be up to date" is checked
   - Ensure PR reviews are satisfied

3. **Merge to main first:**
   ```bash
   # PR must be merged to main
   # Cannot deploy from feature branches to production
   ```

---

## Dependency & Cache Issues

### 🔴 "Module not found" or "Package not installed"

**Error Pattern:**

```
Cannot find module '@rara/utils'
```

**Solution:**

```bash
# Clear everything and reinstall
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Verify monorepo structure
pnpm list

# Re-run CI
pnpm ci:local
```

**Verify package exports:**

```bash
# Check each shared package has proper package.json
cat packages/utils/package.json | grep -A10 '"exports"'

# Ensure it's built
pnpm build:packages
```

---

### 🔴 Cache Not Updating

**Error Pattern:**

```
restored from cache, but package versions don't match
pnpm version mismatch
```

**Cause:** `pnpm-lock.yaml` changed but cache not invalidated

**Solution:**

```bash
# Commit lock file changes
git add pnpm-lock.yaml
git commit -m "chore: update dependencies"
git push

# GitHub will automatically invalidate cache
# Next run will use fresh cache
```

**Manual cache clear:**

- Settings → Actions → Caches
- Delete relevant cache entries
- Next run will rebuild fresh cache

---

## Workflow-Specific Issues

### 🔴 PR Comments Not Appearing

**Error Pattern:**

```
Error: Resource not accessible by integration
```

**Cause:** Missing permissions or environment issue

**Solution:**

```bash
# Check if this is a pull request
# PR comments only appear on actual PRs, not branch pushes

# Verify GitHub token has permissions
# Should be auto-provided, but check:
# Settings → Actions → General → Workflow permissions
# Should be: "Read and write permissions" (default)
```

---

### 🔴 Slack Notification Not Sending

**Error Pattern:**

```
env.SLACK_WEBHOOK_URL is empty
```

**Cause:** Slack webhook secret not configured

**Solution:**

```bash
# This is optional - if you don't want Slack notifications, skip

# To enable Slack:
# 1. Create Slack Incoming Webhook
#    Go to Slack → Apps → Incoming Webhooks → Create New
# 2. Add to GitHub secrets:
#    Settings → Secrets → SLACK_WEBHOOK_URL
# 3. Paste webhook URL
# 4. Re-run deployment workflow
```

---

## Performance Issues

### 🔴 CI Taking Too Long (>20 minutes)

**Cause:** No caching, large files, or redundant steps

**Solution:**

```bash
# 1. Check cache is working
#    Logs should show: "pnpm cache hit" or "node_modules restored"

# 2. If not caching, clear and retry
#    Settings → Actions → Caches → Delete all

# 3. Optimize locally
#    pnpm ci:local should take <25 min with cold cache
#    <10 min with warm cache

# 4. Check for large files
#    ls -lh apps/*/public/
#    Remove unnecessary images/assets
```

---

### 🔴 Disk Space Issues

**Error Pattern:**

```
ENOSPC: no space left on device
```

**Cause:** GitHub runner out of disk space

**Solution:**

```bash
# Usually transient. Retry:
# Actions → [workflow] → Re-run failed jobs

# If persistent, contact GitHub support
# Or clean up artifacts:
# Settings → Actions → Artifact retention
# Reduce retention days
```

---

## Debugging Workflows

### Check Logs

```bash
# 1. Go to: https://github.com/your-org/rara-beauty/actions
# 2. Click workflow run
# 3. Click failed job
# 4. Scroll to failure point
# 5. Read error message
```

### Enable Debug Logging

In GitHub Actions, add secret: `ACTIONS_STEP_DEBUG: true`

```bash
# Settings → Secrets → New repository secret
# Name: ACTIONS_STEP_DEBUG
# Value: true
```

Then rerun workflow for verbose logs.

### Test Locally First

**Always test before pushing:**

```bash
pnpm ci:local  # Runs all CI checks locally
```

**Test specific step:**

```bash
pnpm lint      # Just linting
pnpm type-check # Just type check
pnpm test      # Just tests
pnpm build     # Just build
```

---

## Getting Help

If you can't find the issue:

1. **Check the logs** — Read the full error message
2. **Google the error** — Most issues have known solutions
3. **Check GitHub docs** — https://docs.github.com/en/actions
4. **Ask the team** — Post in #dev-help Slack channel
5. **File an issue** — Include error logs and steps to reproduce

**Include in bug report:**

- Exact error message (copy from logs)
- Workflow file name (ci.yml, etc)
- Branch name
- Steps to reproduce locally
- Output of `pnpm ci:local`

---

## Reference Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [pnpm Docs](https://pnpm.io)
- [Repository Settings](https://github.com/your-org/rara-beauty/settings)
- [Workflow Runs](https://github.com/your-org/rara-beauty/actions)
