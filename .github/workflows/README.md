# GitHub Actions Workflows

This directory contains CI/CD workflows for the Rara Beauty monorepo.

## Planned Workflows

### 1. **test.yml** — Automated Testing
- **Trigger**: On push to `staging` and `main`, on every PR
- **Steps**:
  - Install dependencies
  - Run linting: `pnpm lint`
  - Type-check: `pnpm type-check`
  - Run tests: `pnpm test --coverage`
  - Upload coverage reports
- **Status**: Required to pass before merge

### 2. **build.yml** — Build Verification
- **Trigger**: On push to `staging` and `main`, on every PR
- **Steps**:
  - Install dependencies
  - Build packages: `pnpm build:packages`
  - Build apps: `pnpm build`
  - Upload build artifacts
- **Status**: Required to pass before merge

### 3. **deploy-staging.yml** — Deploy to Staging
- **Trigger**: On push to `staging` branch
- **Steps**:
  - Build apps
  - Deploy customer app to staging environment
  - Deploy owner app to staging environment
  - Run smoke tests
  - Post deployment notification
- **Status**: Runs after merge to `staging`

### 4. **deploy-production.yml** — Deploy to Production
- **Trigger**: On push to `main` branch or manual trigger
- **Steps**:
  - Build apps (production optimized)
  - Deploy customer app to production
  - Deploy owner app to production
  - Run health checks
  - Create GitHub release/tag
  - Post deployment notification
- **Status**: Runs after merge to `main`

### 5. **codeql.yml** — Code Security Analysis
- **Trigger**: Weekly schedule, on push to main
- **Steps**:
  - Run CodeQL analysis
  - Check for security vulnerabilities
  - Upload results to GitHub Security tab
- **Status**: Informational, non-blocking

### 6. **dependency-check.yml** — Dependency Audit
- **Trigger**: Weekly schedule, on dependency changes
- **Steps**:
  - Run `pnpm audit`
  - Check for vulnerable dependencies
  - Auto-create PRs for updates
- **Status**: Informational, can be blocking

## Setup Instructions

### Prerequisites

1. **GitHub Secrets** (set in repo settings):
   ```
   VERCEL_TOKEN           # For deployment
   SLACK_WEBHOOK_URL      # For notifications
   STAGING_DOMAIN         # Staging environment domain
   PROD_DOMAIN            # Production domain
   ```

2. **Branch Protection Rules** (on GitHub):
   - `main` branch:
     - Require PR reviews: 1
     - Require status checks: test, build
     - Require branches up to date
     - Allow auto-merge: yes
   
   - `staging` branch:
     - Require PR reviews: 0 (optional)
     - Require status checks: test, build
     - Allow auto-merge: yes

3. **Environment Configuration**:
   - Create `development` environment (for staging)
   - Create `production` environment (for main)
   - Add deployment rules and secrets

### Running Workflows Locally

Test workflows locally using `act`:

```bash
# Install act
brew install act

# Run specific workflow
act -j test

# Run with secrets file
act -s VERCEL_TOKEN=xxxx
```

## Workflow Status Badges

Add to README.md:

```markdown
![Tests](https://github.com/lateSleeps/Book-apps-/workflows/test/badge.svg)
![Build](https://github.com/lateSleeps/Book-apps-/workflows/build/badge.svg)
![Deploy Staging](https://github.com/lateSleeps/Book-apps-/workflows/deploy-staging/badge.svg)
![Deploy Prod](https://github.com/lateSleeps/Book-apps-/workflows/deploy-production/badge.svg)
```

## Troubleshooting

### Workflow Failed
1. Check "Actions" tab for detailed logs
2. Review error messages
3. Fix code and push again

### False Positives in Security Checks
- Review CodeQL warnings
- Add false positive exclusions if needed
- Document exceptions

### Deployment Issues
- Check deployment logs
- Verify secrets are set correctly
- Ensure environment is configured

---

**Next Step**: Create individual workflow files as needed:
- `test.yml` — High priority
- `build.yml` — High priority
- `deploy-staging.yml` — Medium priority (after staging setup)
- `deploy-production.yml` — Medium priority (after prod setup)
