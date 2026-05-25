# Git Workflow Setup Complete ✅

This document summarizes the Git workflow and CI/CD infrastructure setup for the Rara Beauty monorepo.

## What Was Set Up

### 1. Branch Strategy ✅

**Main Branches:**
- `main` — Production code (protected)
- `staging` — Testing/QA environment (protected)

**Feature Flow:**
```
Feature Branch (feat/*, fix/*, docs/*)
    ↓
PR to staging (requires approval)
    ↓
Testing & QA on staging
    ↓
PR from staging to main
    ↓
Production deployment
```

**Created:** `staging` branch from `main`

### 2. Commit Conventions ✅

**Tool:** Commitlint (validates commit message format)

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code formatting
- `refactor` — Code refactoring
- `perf` — Performance improvement
- `test` — Test changes
- `chore` — Build/tooling/dependencies
- `ci` — CI/CD changes

**Scopes:**
- `customer`, `owner` — Apps
- `types`, `utils`, `mock-data`, `hooks`, `config` — Packages
- `monorepo` — Root changes

**Examples:**
```
feat(customer): add booking calendar feature
fix(owner): resolve payment validation error
docs(monorepo): update contribution guide
```

### 3. Git Hooks ✅

**Tool:** Husky + lint-staged

**Pre-commit Hook** (runs on `git commit`):
- ESLint on staged TypeScript files (auto-fix)
- Prettier formatting on all files
- TypeScript type-check on changed packages
- Tests for changed packages only
- Speed: < 5 seconds

**Commit-msg Hook** (validates message):
- Checks commit message follows Conventional Commits
- Validates type, scope, and subject format
- Speed: < 1 second

**Configuration:**
- `.husky/pre-commit` — ESLint + Prettier + tests
- `.husky/commit-msg` — Commitlint validation
- `.lintstagedrc.json` — Lint-staged configuration

### 4. GitHub Configuration ✅

**Pull Request Template** (`.github/PULL_REQUEST_TEMPLATE.md`):
- Change type checklist
- Scope selection
- Detailed testing notes
- Screenshots/videos for UI changes
- Pre-merge checklist

**Code Owners** (`.github/CODEOWNERS`):
- @lateSleeps as default owner for all files
- Easy PR review assignments

**Workflows** (`.github/workflows/`):
- README with planned CI/CD workflows
- Ready for GitHub Actions setup

### 5. VSCode Configuration ✅

**Settings** (`.vscode/settings.json`):
- Auto-format on save (Prettier)
- ESLint auto-fix on save
- TypeScript workspace version
- Tailwind CSS IntelliSense
- Multi-root workspace support

**Extensions** (`.vscode/extensions.json`):
- Prettier, ESLint, TypeScript
- GitLens, Git History
- Vitest Explorer, Jest Runner
- Tailwind CSS, Prisma support

### 6. Documentation ✅

**CONTRIBUTING.md** — Complete development guide:
- Branch strategy explanation
- Detailed commit conventions
- Step-by-step workflow
- PR process and requirements
- Code standards
- Common commands

**GIT_WORKFLOW_SETUP.md** (this file):
- Setup summary and next steps

---

## Files Created/Modified

### Created
```
commitlint.config.js              # Conventional Commits validation
.husky/commit-msg                 # Commit message validation hook
.github/PULL_REQUEST_TEMPLATE.md  # PR template
.github/CODEOWNERS                # Code owners for auto-assignment
.github/workflows/README.md       # CI/CD workflows documentation
.vscode/settings.json             # VSCode workspace settings
.vscode/extensions.json           # Recommended extensions
CONTRIBUTING.md                   # Development guide
GIT_WORKFLOW_SETUP.md            # Setup documentation
```

### Updated
```
.husky/pre-commit                 # Updated to use npx for npm compatibility
package.json                      # Added commitlint dependencies
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd "Books apps"
pnpm install
```

### 2. Setup Husky Hooks

```bash
pnpm prepare
```

### 3. Create Feature Branch

```bash
# From staging branch
git checkout staging
git pull origin staging
git checkout -b feat/your-feature-name
```

### 4. Work and Commit

```bash
# Make changes
# Hooks run automatically on commit
git add .
git commit -m "feat(customer): add new feature"
# ↓ Pre-commit hook runs automatically
# ↓ ESLint + Prettier + Type-check + Tests
```

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
# Create PR on GitHub using the template
```

### 6. After Approval, Merge to Staging

```bash
# GitHub: Merge PR to staging
# After QA testing: Create PR from staging to main
```

---

## Common Git Commands

```bash
# Branch management
git checkout staging
git checkout -b feat/feature-name
git branch -v
git branch -d old-branch

# Commit with hooks
git add .
git commit -m "feat(scope): message"

# View log with scopes
git log --oneline -20

# Push and create PR
git push origin branch-name

# Sync with latest staging
git fetch origin
git rebase origin/staging
```

---

## Skipping Hooks (Emergency Only)

```bash
# Skip all hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency: critical hotfix"

# Skip pre-commit only
git commit --no-hook -m "feat: ..."
```

⚠️ Skipped commits may fail CI checks. Only use in true emergencies.

---

## Next Steps

### Immediate (for CI/CD)
1. ✅ Set up GitHub branch protection rules:
   - Main: Require 1 PR review + status checks
   - Staging: Require status checks
   
2. ⏳ Create GitHub Actions workflows:
   - `test.yml` — Run tests on PR
   - `build.yml` — Build verification
   
3. ⏳ Setup GitHub Secrets:
   - Deployment tokens
   - Notification webhooks

### Future Enhancements
- [ ] Deployment workflows (staging, production)
- [ ] Code security scanning (CodeQL)
- [ ] Dependency audit workflows
- [ ] Automated release notes generation
- [ ] Slack/email notifications on deployments

---

## Reference

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Husky**: https://typicode.github.io/husky/
- **Commitlint**: https://commitlint.js.org/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches

---

## Questions?

See **CONTRIBUTING.md** for detailed information on:
- Development workflow
- Code standards
- Testing requirements
- PR review process
