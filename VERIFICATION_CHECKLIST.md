# ✅ CI/CD Verification Checklist

Complete these steps to verify the CI/CD infrastructure is working correctly.

---

## Phase 1: Local Verification (Your Machine)

### Step 1.1: Verify Workflow Files Exist

```bash
cd /path/to/books-apps
ls -lh .github/workflows/
```

**Expected Output:**

```
-rw-r--r--  ci.yml                    (7.0K)
-rw-r--r--  deploy-staging.yml        (4.8K)
-rw-r--r--  deploy-production.yml     (6.9K)
-rw-r--r--  dependency-updates.yml    (4.2K)
```

**Status:** ✅ All 4 files present

---

### Step 1.2: Verify YAML Syntax

```bash
# Check ci.yml structure (first 50 lines)
head -50 .github/workflows/ci.yml
```

**Should see:**

```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

env:
  PNPM_HOME: /home/runner/.pnpm-store

jobs:
  install: ...
```

**Status:** ✅ YAML structure valid

---

### Step 1.3: Verify Local CI Script

```bash
# Check package.json has ci:local
cat package.json | grep -A1 '"ci:local"'
```

**Expected Output:**

```json
"ci:local": "pnpm lint && pnpm type-check && pnpm test:coverage --run && pnpm build",
```

**Status:** ✅ Script configured

---

### Step 1.4: Test CI Commands Locally ⚠️ IMPORTANT

**Prerequisites:**

- Node.js 20.x installed
- pnpm 9.1.4+ installed
- All dependencies installed (`pnpm install`)

**Run the full CI pipeline:**

```bash
# This will take 15-25 minutes on first run
# ~5-10 minutes on subsequent runs with cache
pnpm ci:local
```

**Watch for each step:**

1. **Lint** ✅ — Should complete with no errors

   ```
   > pnpm -r run lint
   ...
   ✓ All packages linted successfully
   ```

2. **Type Check** ✅ — Should complete with no errors

   ```
   > pnpm -r run type-check
   ...
   ✓ All packages type-checked successfully
   ```

3. **Test** ✅ — Should complete with coverage

   ```
   > pnpm test:coverage --run
   ...
   Test Files  2 passed (2)
   Coverage    75% lines | 80% functions | 70% branches
   ```

4. **Build** ✅ — Should complete with no errors
   ```
   > pnpm run build:packages && pnpm -r run build
   ...
   ✓ Packages built successfully
   ✓ Apps built successfully
   ```

**Final Output Should Be:**

```
✅ CI Pipeline passed - Ready to push!
```

**If any step fails:**

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for solutions
- Common fixes:
  - Lint errors: `pnpm format`
  - Type errors: Check VS Code, fix manually
  - Test failures: `pnpm test:watch` to debug
  - Build errors: `pnpm build:packages` first

---

## Phase 2: Git Preparation

### Step 2.1: Create Test Branch

```bash
# Create a new branch for testing
git checkout -b test/ci-pipeline

# Make a small test change
echo "// test commit for CI verification" >> apps/customer/README.md

# Stage the change
git add apps/customer/README.md

# Commit with proper message format
git commit -m "test(ci): verify GitHub Actions pipeline"

# Expected output:
# ✓ Commit message validated
# ✓ Pre-commit hooks passed (if set up)
```

### Step 2.2: Verify Git Configuration

```bash
# Check current branch
git branch -v

# Verify git hooks are set up
ls -la .husky/

# Should see:
# -rwxr-xr-x  commit-msg
# -rwxr-xr-x  pre-commit
```

---

## Phase 3: GitHub Actions Verification

### Step 3.1: Push Test Branch

```bash
# Push the test branch to GitHub
git push origin test/ci-pipeline

# Expected output:
# Creating pull request for test/ci-pipeline into main
```

### Step 3.2: Check GitHub Actions Registration

1. **Go to GitHub:** https://github.com/your-username/rara-beauty
2. **Click "Actions" tab**
3. **You should see:**
   ```
   ✅ CI — 4 workflow files registered
   ✅ Deploy to Staging
   ✅ Deploy to Production
   ✅ Dependency Updates
   ```

**If workflows don't appear:**

- Wait 1-2 minutes for GitHub to sync
- Refresh the page
- Check `.github/workflows/` directory exists on GitHub

---

### Step 3.3: Monitor CI Pipeline Run

1. **On your branch page:** https://github.com/your-username/rara-beauty/commits/test/ci-pipeline
2. **Should see CI status indicators** next to your commit:

   ```
   • Details → View workflow run
   ```

3. **Click "Details" to watch the workflow:**

   - ⏳ Orange circle = Running
   - ✅ Green checkmark = Passed
   - ❌ Red X = Failed

4. **Watch the jobs complete in order:**
   ```
   1. install         → ✅ (2-3 min)
   2. lint            → ✅ (1-2 min)
   3. type-check      → ✅ (1-2 min)
   4. test            → ✅ (3-5 min, uploads coverage)
   5. build           → ✅ (5-10 min)
   6. ci-status       → ✅ (1 min, final check)
   ```

**Total time: ~15-25 minutes** (first run with cache setup)

---

### Step 3.4: Create Pull Request

1. **GitHub prompts you to create PR**
2. **Click "Create pull request"** button
3. **Fill in PR details:**
   ```
   Title: test(ci): verify GitHub Actions pipeline
   Description: This PR tests the CI/CD infrastructure setup
   ```
4. **Click "Create pull request"**

---

### Step 3.5: Verify PR Status Checks

On the PR page, you should see:

```
All checks have passed
✅ CI / install       — All checks passed
✅ CI / lint          — All checks passed
✅ CI / type-check    — All checks passed
✅ CI / test          — All checks passed
✅ CI / build         — All checks passed
✅ CI / ci-status     — All checks passed
```

**Also check:**

- ✅ Coverage report comment appeared on PR
- ✅ Build artifacts uploaded

---

### Step 3.6: Verify Staging Deployment (Optional)

```
ℹ️ Staging deployment only triggers on push to 'staging' branch
```

To test staging deployment:

```bash
# Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feat/test-staging

# Make a change
echo "// test" >> apps/customer/README.md
git add .
git commit -m "feat(test): test staging deployment"
git push origin feat/test-staging

# Check Actions tab for deploy-staging workflow
# Should show: customer-staging.vercel.app and owner-staging.vercel.app
```

---

## Phase 4: Verification Summary

### ✅ Checklist

- [ ] **Local CI Script**

  - [ ] `pnpm ci:local` runs all 4 steps (lint → type-check → test → build)
  - [ ] All steps complete without errors
  - [ ] Output shows "✅ CI Pipeline passed"

- [ ] **Workflow Files**

  - [ ] All 4 `.yml` files exist in `.github/workflows/`
  - [ ] Files have proper sizes (7K, 4.8K, 6.9K, 4.2K)
  - [ ] YAML syntax is valid

- [ ] **Git Setup**

  - [ ] Test branch created: `test/ci-pipeline`
  - [ ] Commit message passes validation
  - [ ] Push successful to GitHub

- [ ] **GitHub Actions**

  - [ ] Actions tab shows workflows registered
  - [ ] CI pipeline triggered on push
  - [ ] All 6 jobs complete successfully
  - [ ] Status checks appear on PR
  - [ ] Coverage comment posted on PR

- [ ] **PR Status**
  - [ ] All checks show ✅ green
  - [ ] "All checks have passed" message appears
  - [ ] Can safely merge (if desired)

---

## Phase 5: Next Steps

### If All Checks Pass ✅

1. **Clean up test artifacts:**

   ```bash
   # Delete test branch (keep PR open for reference)
   git branch -D test/ci-pipeline
   # Or delete through GitHub UI
   ```

2. **Configure GitHub Secrets:**

   ```
   Settings → Secrets and variables → Actions → New repository secret
   Add:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID_CUSTOMER
   - VERCEL_PROJECT_ID_OWNER
   - SLACK_WEBHOOK_URL (optional)
   ```

3. **Enable Branch Protection (for main):**

   ```
   Settings → Branches → Add rule → main
   ✓ Require status checks to pass before merging
   ✓ Include administrators
   ✓ Restrict who can push to matching branches
   ```

4. **Share with Team:**
   - Share [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md)
   - Share [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - Schedule team walkthrough

---

### If Checks Fail ❌

1. **Read the error message** in GitHub Actions logs
2. **Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for solution
3. **Fix locally:**
   ```bash
   pnpm format         # Fix linting
   pnpm lint --fix     # Fix ESLint
   pnpm test:watch     # Debug tests
   ```
4. **Commit fix:**
   ```bash
   git add .
   git commit -m "fix(ci): resolve linting issues"
   git push origin test/ci-pipeline
   ```
5. **GitHub Actions reruns automatically** ✅

---

## Troubleshooting

### Workflow not appearing in Actions tab

**Solution:**

1. Verify `.github/workflows/` folder exists on GitHub
2. Verify `.yml` files are in the repo
3. Wait 5 minutes and refresh
4. Check for typos in folder name

### CI pipeline fails with "pnpm not found"

**Solution:**

- This should not happen on GitHub runners
- GitHub Actions automatically installs pnpm
- If it does: Run locally with `pnpm ci:local` first

### PR status checks don't appear

**Solution:**

1. Workflow must have completed (waiting is OK)
2. PR must exist (branch push alone won't show checks)
3. Commit must trigger the workflow
4. Refresh page

### Coverage comment not appearing on PR

**Solution:**

- Comment only appears if tests run and pass
- Coverage report must generate successfully
- PR must exist (not just branch)

### Test failures on GitHub but pass locally

**Solution:**

1. Check Node.js version matches (20.x)
2. Check pnpm version matches (9.1.4)
3. Delete lock file and reinstall: `rm pnpm-lock.yaml && pnpm install`
4. Run `pnpm ci:local` again

---

## Performance Notes

| Step       | Local         | GitHub       |
| ---------- | ------------- | ------------ |
| Install    | 2-3 min       | 2-3 min      |
| Lint       | 1-2 min       | 1-2 min      |
| Type-check | 1-2 min       | 1-2 min      |
| Test       | 3-5 min       | 3-5 min      |
| Build      | 5-10 min      | 5-10 min     |
| **Total**  | **15-25 min** | **5-10 min** |

GitHub is faster because:

- Uses cache on subsequent runs
- Parallel execution of some jobs
- Faster GitHub runners

---

## Success Criteria

✅ **All the following must be true:**

1. `pnpm ci:local` completes successfully locally
2. All 4 workflow files exist and are valid YAML
3. CI pipeline runs on GitHub after push
4. All 6 CI jobs complete successfully
5. PR status checks show all passing
6. Coverage report comment appears on PR
7. Can merge PR without issues

---

## Support

- **Local issues:** See [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md)
- **GitHub Actions issues:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **General questions:** See [CI_CD_README_SECTION.md](./CI_CD_README_SECTION.md)

---

**Once all checks pass, CI/CD infrastructure is live and ready for production! 🚀**
