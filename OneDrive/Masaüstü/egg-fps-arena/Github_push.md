# 📤 GITHUB PUSH GUIDE

## Quick Push (First Time)

```bash
cd egg-fps-arena

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "🥚 Initial commit - Egg-FPS Arena MVP

- Complete monorepo setup (client + server + shared)
- Netcode: prediction, reconciliation, interpolation
- Binary protocol (<120 bytes)
- Bot fill system
- Load testing tools
- Ads mock system
- Region optimization (TR focus)
- Docker + CI/CD
- Comprehensive documentation"

# Create GitHub repo (manual or via CLI)
# Option 1: Create repo on github.com manually
# Option 2: Use GitHub CLI
gh repo create egg-fps-arena --public --source=. --remote=origin

# Push to GitHub
git branch -M main
git push -u origin main
```

## GitHub Repository Setup

### 1. Create New Repository

**Via Web:**
1. Go to https://github.com/new
2. Repository name: `egg-fps-arena`
3. Description: `🥚 Fast-paced multiplayer .io FPS game with egg characters`
4. Public or Private (your choice)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

**Via GitHub CLI:**
```bash
gh repo create egg-fps-arena \
  --public \
  --description "🥚 Fast-paced multiplayer .io FPS game" \
  --source=. \
  --remote=origin \
  --push
```

### 2. Connect Local to Remote

If you created manually on web:

```bash
git remote add origin https://github.com/YOUR_USERNAME/egg-fps-arena.git
git branch -M main
git push -u origin main
```

---

## Project Structure on GitHub

```
egg-fps-arena/
├── 📄 README.md              ← Main documentation
├── 📄 DEPLOYMENT.md          ← Deploy instructions
├── 📄 TODO.md                ← Roadmap
├── 📄 ADVANCED_FEATURES.md   ← Load test, ads, regions
├── 📄 LICENSE                ← MIT
├── ⚙️ package.json
├── 🐳 docker-compose.yml
├── 🔧 .github/
│   └── workflows/
│       └── ci.yml            ← GitHub Actions
└── 📦 packages/
    ├── shared/               ← Types, protocol
    ├── server/               ← Colyseus backend
    └── client/               ← Phaser 3 frontend
```

---

## GitHub Actions CI

Already configured in `.github/workflows/ci.yml`

**What it does:**
- ✅ Runs on every push/PR
- ✅ Installs dependencies
- ✅ Lints code
- ✅ Builds all packages
- ✅ Runs tests
- ✅ Builds Docker image (on main branch)

**First push will trigger CI automatically!**

---

## Recommended GitHub Settings

### Topics (Add these)

1. Go to repository settings
2. Add topics:
   - `io-game`
   - `multiplayer`
   - `fps`
   - `phaser3`
   - `colyseus`
   - `typescript`
   - `game-development`
   - `websocket`
   - `client-prediction`

### Branch Protection (Optional, for team)

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - Require pull request reviews
   - Require status checks (CI must pass)
   - Require branches to be up to date

### Repository Description

```
🥚 Egg-FPS Arena - Fast-paced multiplayer .io FPS game with egg characters. 
Built with TypeScript, Phaser 3, and Colyseus. Features client-side prediction, 
server reconciliation, and optimized for Turkish players.
```

### Website

Add to "About" section:
- Your deployed client URL (after deploy)
- Example: `https://egg-fps-arena.vercel.app`

---

## Subsequent Pushes

```bash
# Make changes
git add .
git commit -m "feat: add new weapon type"
git push

# Or for feature branches
git checkout -b feature/new-weapon
git add .
git commit -m "feat: add shotgun weapon"
git push -u origin feature/new-weapon

# Then create PR on GitHub
```

---

## Commit Message Convention

Use conventional commits:

```bash
# Features
git commit -m "feat: add spectator mode"

# Bug fixes
git commit -m "fix: resolve lag compensation issue"

# Documentation
git commit -m "docs: update deployment guide"

# Performance
git commit -m "perf: optimize snapshot encoding"

# Refactor
git commit -m "refactor: extract bot AI to separate class"

# Tests
git commit -m "test: add unit tests for protocol"

# Chores
git commit -m "chore: update dependencies"
```

---

## GitHub Issues Template

Create `.github/ISSUE_TEMPLATE/` for better issue tracking:

**Bug Report:**
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. ...
2. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: Chrome 120
- OS: Windows 11
- Server Region: eu-tr
```

**Feature Request:**
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other ways to solve this?
```

---

## .gitignore Verification

Already configured, but double-check:

```bash
# Check what would be ignored
git status --ignored

# Should ignore:
# - node_modules/
# - dist/
# - .env
# - *.log
# - .DS_Store
```

---

## README Badges (Optional)

Add to top of README.md:

```markdown
# 🥚 Egg-FPS Arena

[![CI](https://github.com/YOUR_USERNAME/egg-fps-arena/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/egg-fps-arena/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Fast-paced multiplayer .io FPS game with egg characters...
```

---

## Deployment from GitHub

### Render (Server)

1. Connect GitHub account
2. New Web Service
3. Connect repository: `egg-fps-arena`
4. Root directory: `packages/server`
5. Build: `pnpm install && pnpm --filter server build`
6. Start: `node dist/index.js`
7. **Auto-deploy on push to main** ✅

### Vercel (Client)

1. Import project from GitHub
2. Root directory: `packages/client`
3. Build: `pnpm install && pnpm build`
4. Output: `dist`
5. **Auto-deploy on push to main** ✅

Both will auto-deploy on every push to `main`! 🎉

---

## Repository Checklist

Before making public:

- [ ] README.md is comprehensive
- [ ] LICENSE file included (MIT)
- [ ] .env.example provided (no secrets)
- [ ] .gitignore configured
- [ ] CI/CD passing
- [ ] Documentation complete
- [ ] No hardcoded credentials
- [ ] No API keys in code
- [ ] Attribution for dependencies

---

## Collaboration Setup

### Add Collaborators

1. Settings → Collaborators
2. Add team members
3. Set permissions (Write/Admin)

### Project Board (Optional)

1. Projects → New project
2. Board template: "Basic kanban"
3. Columns:
   - 📋 Backlog
   - 🏃 In Progress
   - 👀 Review
   - ✅ Done

Link issues to board automatically.

---

## GitHub Star ⭐ Goal

Share on:
- [ ] Twitter/X
- [ ] Reddit (r/iogames)
- [ ] Discord servers
- [ ] LinkedIn
- [ ] Product Hunt (after polish)

---

## Final Push Command

```bash
# From project root
cd egg-fps-arena

# Verify everything
git status
ls -la

# Push!
git add .
git commit -m "🚀 Production-ready MVP with advanced features"
git push origin main

# Watch CI run
gh run watch

# Done! 🎉
```

---

**Your project is now on GitHub! 🎊**

**Next steps:**
1. Deploy to production
2. Share with community
3. Gather feedback
4. Iterate!