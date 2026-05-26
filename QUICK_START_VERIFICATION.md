# 🚀 Quick Start Verification

**Total time needed:** ~30-40 minutes (mostly waiting for CI to run)

---

## Step 1: Local Verification (5 minutes)

```bash
# Navigate to project
cd /path/to/books-apps

# Verify workflow files exist
ls .github/workflows/*.yml
# Should show: ci.yml, deploy-staging.yml, deploy-production.yml, dependency-updates.yml

# Verify ci:local script exists
grep "ci:local" package.json
# Should show: "ci:local": "pnpm lint && pnpm type-check && pnpm test:coverage --run && pnpm build"

# Verify YAML is valid (check first 50 lines)
head -50 .github/workflows/ci.yml
# Should show proper YAML structure with 'name:', 'on:', 'jobs:'
```

**Status:** ✅ All files present and valid

---

## Step 2: Test Locally (15-25 minutes)

```bash
# Run full CI pipeline locally
pnpm ci:local

# Watch output:
# 1. ✅ Lint — no errors
# 2. ✅ Type Check — no errors
# 3. ✅ Test — coverage percentage
# 4. ✅ Build — packages and apps built
```

**Expected final output:**

```
✅ CI Pipeline passed - Ready to push!
```

**If anything fails:** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Step 3: Create Test Branch (2 minutes)

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a simple test change
echo "// test commit for CI verification" >> apps/customer/README.md

# Commit with proper message
git add .
git commit -m "test(ci): verify GitHub Actions pipeline"

# Push to GitHub
git push origin test/ci-pipeline

# Expected output: Branch pushed successfully
```

---

## Step 4: Watch GitHub Actions (15-20 minutes)

1. **Go to GitHub:** https://github.com/your-username/rara-beauty

2. **Click "Actions" tab**

   - Should see CI pipeline running
   - Watch the progress

3. **Monitor the jobs:**

   ```
   install      ⏳ → ✅ (2-3 min)
   lint         ⏳ → ✅ (1-2 min)
   type-check   ⏳ → ✅ (1-2 min)
   test         ⏳ → ✅ (3-5 min)
   build        ⏳ → ✅ (5-10 min)
   ci-status    ⏳ → ✅ (1 min)
   ```

4. **Wait for all jobs to complete** (green checkmarks)

---

## Step 5: Create Pull Request (2 minutes)

1. **GitHub suggests creating a PR** (automatic)
2. **Click "Create pull request"** button
3. **Fill in details:**
   - Title: `test(ci): verify GitHub Actions pipeline`
   - Keep default description
4. **Click "Create pull request"**

---

## Step 6: Verify PR Status Checks (1 minute)

On the PR page, you should see:

```
✅ All checks passed
  ✅ CI / install
  ✅ CI / lint
  ✅ CI / type-check
  ✅ CI / test
  ✅ CI / build
  ✅ CI / ci-status

✅ Coverage report comment posted
```

---

## ✅ Success Criteria

All of the following must be TRUE:

- [ ] `pnpm ci:local` runs successfully and shows "✅ CI Pipeline passed"
- [ ] All 4 workflow files exist: ci.yml, deploy-staging.yml, deploy-production.yml, dependency-updates.yml
- [ ] Test branch pushed to GitHub
- [ ] GitHub Actions shows all jobs passing (green ✅)
- [ ] PR created successfully
- [ ] All status checks on PR show green ✅
- [ ] Coverage comment appears on PR

---

## If All Checks Pass ✅

Congratulations! Your CI/CD infrastructure is working perfectly.

**Next steps:**

1. **Clean up test PR** (optional):

   ```bash
   # Delete test branch
   git branch -D test/ci-pipeline
   # Close/delete PR on GitHub (optional)
   ```

2. **Configure GitHub Secrets:**

   ```
   Go to: Settings → Secrets and variables → Actions → New repository secret
   Add:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID_CUSTOMER
   - VERCEL_PROJECT_ID_OWNER
   ```

3. **Share with team:**

   - Send: [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md)
   - Send: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - Run: Team walkthrough session

4. **Start using CI/CD:**
   ```bash
   # Normal workflow from now on:
   pnpm ci:local              # Before every push
   git push origin my-feature  # Push branch
   # GitHub Actions runs automatically
   ```

---

## If Checks Fail ❌

1. **Read the error** in GitHub Actions logs
2. **Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for the specific error
3. **Fix locally:**
   ```bash
   pnpm format   # Auto-fix formatting
   pnpm lint --fix # Auto-fix lint errors
   ```
4. **Re-run CI locally:**
   ```bash
   pnpm ci:local
   ```
5. **Push the fix:**
   ```bash
   git add .
   git commit -m "fix(ci): [fix description]"
   git push origin test/ci-pipeline
   ```
6. **GitHub Actions reruns automatically** ✅

---

## 📚 Documentation

| Document                                                 | Purpose                                      |
| -------------------------------------------------------- | -------------------------------------------- |
| [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md)                 | How to run `pnpm ci:local` and debug locally |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)               | Solutions for common CI failures             |
| [CI_CD_README_SECTION.md](./CI_CD_README_SECTION.md)     | Workflow overview for the team               |
| [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) | Detailed verification steps                  |

---

## 💬 Need Help?

- **Local CI issues?** → [CI_LOCAL_GUIDE.md](./CI_LOCAL_GUIDE.md)
- **GitHub Actions error?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **How do workflows work?** → [CI_CD_README_SECTION.md](./CI_CD_README_SECTION.md)

---

**Ready? Run `pnpm ci:local` first, then push your test branch! 🚀**
