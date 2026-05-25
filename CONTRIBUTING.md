# Contributing to Rara Beauty Monorepo

Thank you for contributing to the Rara Beauty salon booking platform! This guide will help you understand our development workflow, commit conventions, and code standards.

## Table of Contents

1. [Branch Strategy](#branch-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Code Standards](#code-standards)
6. [Git Hooks](#git-hooks)
7. [Emergency Commits](#emergency-commits)

---

## Branch Strategy

We follow a **two-branch strategy** with feature branches:

### Main Branches

- **`main`** — Production-ready code
  - Only receive PRs from `staging`
  - Protected branch (requires PR review)
  - All commits are tagged for release

- **`staging`** — Testing/QA environment
  - Receives feature PRs from feature branches
  - Protected branch (requires PR review)
  - Pre-release integration point

### Feature/Development Branches

- **`feat/<feature-name>`** — New features
  - Example: `feat/booking-calendar`
  - Branch from: `staging`
  - Merge back to: `staging`

- **`fix/<bug-name>`** — Bug fixes
  - Example: `fix/payment-validation`
  - Branch from: `staging`
  - Merge back to: `staging`

- **`docs/<doc-name>`** — Documentation
  - Example: `docs/api-guide`
  - Branch from: `staging`

### Branch Naming Convention

```
<type>/<descriptive-name>
  ↓         ↓
feat/     customer-payment
fix/      owner-login-bug
docs/     setup-guide
refactor/ utils-consolidation
```

---

## Commit Conventions

We follow **Conventional Commits** format for clear, semantic commit messages.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Required. Must be one of:

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc) |
| `refactor` | Code refactoring without feature/fix |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build, dependencies, tooling changes |
| `ci` | CI/CD configuration changes |

### Scope

Optional but recommended. Specifies which part of the system is affected:

- `customer` — Customer booking app
- `owner` — Owner dashboard app
- `types` — @rara/types package
- `utils` — @rara/utils package
- `mock-data` — @rara/mock-data package
- `hooks` — @rara/hooks package
- `config` — @rara/config package
- `monorepo` — Root monorepo changes

### Subject

- Use imperative mood ("add" not "adds" or "added")
- Don't capitalize first letter
- No period (.) at the end
- Max 50 characters
- Be specific and descriptive

### Body

Optional but recommended for non-trivial changes:

- Explain **what** and **why**, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer

Optional. Use for:

- Breaking changes: `BREAKING CHANGE: <description>`
- Related issues: `Closes #123`, `Fixes #456`
- Co-authored: `Co-Authored-By: Name <email>`

### Examples

```bash
# Simple fix
git commit -m "fix(customer): resolve payment form validation error"

# Feature with body
git commit -m "feat(owner): add salon inventory management

- Add inventory tracking dashboard
- Create item CRUD operations
- Integrate with mock data

Closes #42"

# Breaking change
git commit -m "refactor(types): rename UserRole enum values

BREAKING CHANGE: UserRole.STYLIST renamed to STYLIST_ROLE
Update all imports accordingly."
```

---

## Development Workflow

### 1. Setup Local Environment

```bash
# Clone repository
git clone https://github.com/lateSleeps/Book-apps-.git
cd "Book-apps-"

# Install pnpm globally (or use npx pnpm)
npm install -g pnpm

# Install dependencies
pnpm install

# Setup git hooks
pnpm prepare
```

### 2. Create Feature Branch

```bash
# Update staging to latest
git checkout staging
git pull origin staging

# Create feature branch
git checkout -b feat/your-feature-name

# Or from main if urgent fix needed
git checkout -b fix/critical-bug
```

### 3. Make Changes

```bash
# Work on your feature
# Edit files, add features, write tests

# Check code quality before commit
pnpm lint                    # ESLint
pnpm type-check            # TypeScript
pnpm test                  # Run tests
pnpm format               # Prettier
```

### 4. Stage and Commit

```bash
# Stage changes
git add .

# Pre-commit hooks will run automatically:
# - ESLint with auto-fix
# - Prettier formatting
# - TypeScript check
# - Lint-staged on changed files

git commit -m "feat(customer): add new booking feature"

# Commit message validation runs automatically
# commitlint will validate your message format
```

### 5. Push and Create PR

```bash
# Push to remote
git push origin feat/your-feature-name

# Create PR on GitHub
# Use pull request template
# Link related issues
# Provide description and testing notes
```

### 6. Review and Merge

```bash
# After approval
# GitHub PR merged into staging

# Merge staging to main (after QA testing)
# Released and tagged
```

---

## Pull Request Process

### Before Creating PR

1. **Update and rebase** on latest `staging`:
   ```bash
   git fetch origin
   git rebase origin/staging
   ```

2. **Run full test suite**:
   ```bash
   pnpm build
   pnpm test
   pnpm type-check
   pnpm lint
   ```

3. **Verify no conflicts**:
   ```bash
   git status
   ```

### PR Guidelines

1. **Use the PR template** (`.github/PULL_REQUEST_TEMPLATE.md`)
2. **Link related issues**: `Closes #123`
3. **Describe changes clearly** with "what" and "why"
4. **Keep PRs focused** — one feature/fix per PR
5. **Add screenshots** for UI changes
6. **List testing done**
7. **Update documentation** if needed

### PR Requirements

- [ ] PR title follows conventional commits
- [ ] Description is clear and complete
- [ ] All checks pass (linting, tests, builds)
- [ ] No merge conflicts
- [ ] Updated related documentation
- [ ] Related issues are linked
- [ ] Screenshots/videos attached (if UI changes)

---

## Code Standards

### TypeScript

- **Strict mode enabled** (`strict: true`)
- **No `any` types** — use generics or proper types
- **File organization**:
  ```
  src/
  ├── types/          # TypeScript interfaces/types
  ├── components/     # React components
  ├── hooks/         # Custom hooks
  ├── utils/         # Utility functions
  ├── constants/     # Constants
  └── tests/         # Test files
  ```

### Code Style

- **Prettier** for formatting (auto-formatted on commit)
- **2-space indentation** (configured in Prettier)
- **Single quotes** for strings
- **Trailing commas** in multi-line objects
- **Import organization**:
  ```typescript
  // 1. External packages
  import React from 'react';
  import { cn } from '@rara/utils/helpers';
  
  // 2. Internal absolute imports
  import { User } from '@rara/types/auth';
  
  // 3. Relative imports
  import { Button } from '../components/Button';
  
  // 4. Side effects
  import './styles.css';
  ```

### Component Structure

```typescript
// Interfaces at top
interface Props {
  title: string;
  onClose?: () => void;
}

// Component definition
export const MyComponent: React.FC<Props> = ({
  title,
  onClose,
}) => {
  // Hooks
  const [state, setState] = React.useState('');
  
  // Effects
  React.useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return <div>{title}</div>;
};
```

### Testing

- **Vitest** for unit tests
- **Test files** colocated with source: `Component.test.tsx`
- **Minimum 80% coverage** for utilities
- **All public APIs tested**

### Documentation

- **JSDoc** for exported functions:
  ```typescript
  /**
   * Format a date to readable string
   * @param date - The date to format
   * @param format - Desired format string
   * @returns Formatted date string
   */
  export const formatDate = (date: Date, format: string): string => {
    // ...
  };
  ```

- **README.md** in package directories
- **Comments for complex logic** only

---

## Git Hooks

### Automatic Hooks

Configured with **Husky** and **lint-staged**:

| Hook | Purpose | Speed |
|------|---------|-------|
| `pre-commit` | Lint and format staged files | < 5s |
| `commit-msg` | Validate commit message format | < 1s |
| `pre-push` | Run full test suite (optional) | < 30s |

### Pre-commit Hook Runs

1. **ESLint** on staged TS/TSX files
2. **Prettier** formatting on all files
3. **TypeScript check** on changed packages
4. **Tests** for changed packages only

### If Hook Fails

```bash
# Fix issues
pnpm lint --fix
pnpm format

# Stage fixes
git add .

# Retry commit
git commit -m "..."
```

---

## Emergency Commits

If you need to skip hooks (not recommended):

```bash
# Skip all hooks
git commit --no-verify -m "emergency: critical hotfix"

# Skip pre-commit only
git commit --no-hook -m "feat: normal feature"

# Skip commit-msg only
git commit --no-verify-hook -m "..."
```

⚠️ **Note**: Skipped commits may fail CI/CD checks. Only use in emergencies.

---

## Common Commands

```bash
# Development
pnpm dev              # Run all apps
pnpm dev:customer    # Run customer app only
pnpm dev:owner       # Run owner app only

# Building
pnpm build           # Build all packages and apps
pnpm build:packages  # Build shared packages only

# Testing & Quality
pnpm test            # Run tests (watch mode)
pnpm test:coverage   # With coverage report
pnpm type-check      # TypeScript check
pnpm lint            # ESLint check
pnpm lint --fix      # Fix linting issues
pnpm format          # Prettier format

# Git Workflow
git checkout -b feat/feature-name    # Create branch
git push origin feat/feature-name    # Push to remote
git commit -m "feat(...): ..."       # Commit (with hooks)
```

---

## Getting Help

- **Issue tracker**: GitHub Issues
- **Discussion**: GitHub Discussions
- **Documentation**: `/docs` folder
- **Code examples**: `/packages/mock-data` for reference implementations

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for helping make Rara Beauty better! 🎉
