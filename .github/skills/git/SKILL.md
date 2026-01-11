---
name: git
description: Git version control operations including commits, branches, merges, rebases, stashing, conflict resolution, history exploration, and repository management. Use this skill when working with Git repositories, managing code versions, or collaborating with others.
---

# Git Version Control Skill

This skill helps you perform Git operations efficiently and follow best practices for version control.

## Commit Guidelines

### Conventional Commits Format
Use the conventional commits specification for clear, semantic commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Maintenance tasks

### Good Commit Practices
- Keep commits atomic (one logical change per commit)
- Write descriptive messages in imperative mood ("Add feature" not "Added feature")
- Reference issue numbers when applicable: `fix(auth): resolve login bug (#123)`

## Common Git Workflows

### Feature Branch Workflow
```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Make changes, stage, and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/your-feature-name

# After PR approval, merge to main
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

### Keeping Branch Updated
```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout your-branch
git rebase main
# Or use merge: git merge main
```

### Stashing Changes
```bash
# Stash current changes
git stash

# Stash with a message
git stash push -m "WIP: feature description"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{2}
```

## Conflict Resolution

### Steps to Resolve Merge Conflicts
1. Identify conflicting files: `git status`
2. Open conflicting files and look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Incoming changes
   >>>>>>> branch-name
   ```
3. Edit the file to resolve conflicts (remove markers, keep desired code)
4. Stage resolved files: `git add <file>`
5. Complete the merge: `git commit`

### Aborting a Merge
```bash
git merge --abort
```

## History and Exploration

### Viewing History
```bash
# View commit history
git log --oneline --graph --all

# View changes in a commit
git show <commit-hash>

# View file history
git log --follow -p -- <file-path>

# Search commits by message
git log --grep="search term"

# View who changed each line
git blame <file-path>
```

### Finding Issues
```bash
# Find commit that introduced a bug
git bisect start
git bisect bad                 # Current commit is bad
git bisect good <commit-hash>  # Known good commit
# Git will checkout commits for you to test
git bisect good/bad            # Mark each as good or bad
git bisect reset               # When done
```

## Undoing Changes

### Unstage Files
```bash
git reset HEAD <file>
# Or
git restore --staged <file>
```

### Discard Local Changes
```bash
git checkout -- <file>
# Or
git restore <file>
```

### Amend Last Commit
```bash
# Change last commit message
git commit --amend -m "new message"

# Add forgotten files to last commit
git add forgotten-file
git commit --amend --no-edit
```

### Revert a Commit (Safe)
```bash
git revert <commit-hash>
```

### Reset to Previous State (Destructive)
```bash
# Soft reset (keep changes staged)
git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)
git reset HEAD~1

# Hard reset (discard all changes)
git reset --hard HEAD~1
```

## Branch Management

```bash
# List branches
git branch -a

# Delete local branch
git branch -d branch-name
git branch -D branch-name  # Force delete

# Delete remote branch
git push origin --delete branch-name

# Rename branch
git branch -m old-name new-name
```

## Remote Operations

```bash
# View remotes
git remote -v

# Add remote
git remote add origin <url>

# Fetch without merging
git fetch origin

# Pull with rebase
git pull --rebase origin main

# Push with force (use carefully)
git push --force-with-lease origin branch-name
```

## Tags

```bash
# Create lightweight tag
git tag v1.0.0

# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin --tags

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## Configuration

```bash
# Set user info
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Set default branch name
git config --global init.defaultBranch main

# Enable helpful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
```

## Best Practices

1. **Commit often**: Small, frequent commits are easier to review and revert
2. **Pull before push**: Always pull latest changes before pushing
3. **Use branches**: Never commit directly to main/master
4. **Write good messages**: Future you will thank present you
5. **Review before committing**: Use `git diff --staged` to review changes
6. **Keep history clean**: Use interactive rebase for local cleanup before pushing
7. **Use `.gitignore`**: Exclude build artifacts, dependencies, and sensitive files
