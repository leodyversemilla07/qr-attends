# Contributing to QR Attends

Thanks for contributing.

## Branch Naming

Use one of the following prefixes:

- `feat/<description>` — new features
- `fix/<description>` — bug fixes
- `refactor/<description>` — code restructuring
- `docs/<description>` — documentation-only changes
- `test/<description>` — test-only changes
- `ci/<description>` — CI/CD changes
- `chore/<description>` — maintenance and non-functional updates

Examples:

- `feat/offline-checkin-retry`
- `fix/login-token-expiry`
- `docs/update-api-reference`

## Commit Message Convention (required)

Use Conventional Commits:

`<type>(<scope>): <short description>`

- Keep subject line imperative and concise.
- Prefer ~72 characters max in subject.
- Add a body when context helps reviewers.

Allowed commit types:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `ci`
- `chore`
- `perf`

Examples:

- `feat(auth): add session refresh endpoint`
- `fix(scan): prevent duplicate check-in on rapid scans`
- `refactor(reports): type-safe member export pipeline`
- `docs(readme): update internal distribution links`

## Pull Requests

Please include:

1. Summary of what changed
2. Why the change was needed
3. Test evidence (typecheck/lint/tests)

Recommended local checks before push:

```bash
npm run typecheck
npm run lint
npm test -- --watch=false
```

## Security

- Never commit credentials, tokens, or secret files.
- Use environment variables and `.env` files excluded by git.
