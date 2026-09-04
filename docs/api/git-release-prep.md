# Git Cleanup / Release Preparation

Current `git status` indicates two categories:

## 1. Safe to review

These appear to be real project files/configuration:

- `.env.example`
- `postcss.config.mjs`
- `scripts/`
- `docs/`
- `src/`
- `data/...`
- `.vscode/`

## 2. Do NOT blindly commit

### `frontend/node_modules/.package-lock.json`

Do not treat `node_modules` as source code.

First inspect whether it is tracked:

```powershell
git ls-files frontend/node_modules/.package-lock.json
```

If the command prints the path, it is tracked and should normally be removed from the repository index:

```powershell
git rm --cached frontend/node_modules/.package-lock.json
```

Then ensure `.gitignore` contains:

```gitignore
frontend/node_modules/
```

If it is not tracked, simply ensure the ignore rule exists.

### Large raw/processed data

Do not run:

```powershell
git add data/
```

blindly.

Check sizes first:

```powershell
Get-ChildItem data -Recurse -File |
    Sort-Object Length -Descending |
    Select-Object -First 30 FullName,Length
```

Raw audio and large parquet datasets should normally stay out of the public repo for this submission unless you deliberately set up Git LFS or another release mechanism.

## Recommended `.gitignore` additions

```gitignore
# Python
backend/.venv/
__pycache__/
*.py[cod]

# Environment / secrets
.env
.env.*
!.env.example

# Node
frontend/node_modules/
frontend/.next/

# IDE
.vscode/

# Large/raw data
data/raw/
*.parquet
*.pkl

# Local artifacts
*.log
.DS_Store
```

> Before using this exact block, compare it with the current `.gitignore` so you do not accidentally ignore a file that must be versioned, such as a small model artifact or required evaluation output.

## Release-oriented status check

Run:

```powershell
git status
git ls-files frontend/node_modules/.package-lock.json
git check-ignore -v frontend/node_modules/.package-lock.json
```

Then inspect:

```powershell
git diff
```

before staging anything.

## Final staging principle

Stage source and documentation intentionally:

```text
backend/app/
frontend/src/
frontend package/config files
scripts/
docs/
evaluation/reports/
evaluation/metrics/
evaluation/plots/
models/manifests/
README.md
LICENSE
.gitignore
.env.example
```

Do not stage secrets, node_modules, `.next`, virtual environments, raw audio, or huge generated datasets.
